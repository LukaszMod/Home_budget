use axum::{extract::{State, Path}, Json};
use crate::{AppState, models::*, utils::db_err};

// Helper function to ensure debt categories exist
pub async fn ensure_debt_categories(pool: &sqlx::PgPool) -> Result<(i32, i32), (axum::http::StatusCode, String)> {
    // Check if "Długi" category exists
    let debt_category: Option<Category> = sqlx::query_as::<_, Category>(
        "SELECT id, name, parent_id, type::text, sort_order, is_system, is_hidden FROM categories WHERE name = 'Długi' AND parent_id IS NULL"
    )
    .fetch_optional(pool)
    .await
    .map_err(db_err)?;

    let debt_category_id = if let Some(cat) = debt_category {
        cat.id
    } else {
        // Create "Długi" main category
        let max_order: Option<i32> = sqlx::query_scalar(
            "SELECT MAX(sort_order) FROM categories WHERE parent_id IS NULL"
        )
        .fetch_one(pool)
        .await
        .unwrap_or(None);
        
        let next_order = max_order.unwrap_or(0) + 1;

        let new_cat = sqlx::query_as::<_, Category>(
            "INSERT INTO categories (name, parent_id, type, sort_order, is_system) 
             VALUES ('Długi', NULL, 'expense'::category_type, $1, TRUE)
             RETURNING id, name, parent_id, type::text, sort_order, is_system, is_hidden"
        )
        .bind(next_order)
        .fetch_one(pool)
        .await
        .map_err(db_err)?;
        
        new_cat.id
    };

    // Check if "Odsetki" subcategory exists
    let interest_category: Option<Category> = sqlx::query_as::<_, Category>(
        "SELECT id, name, parent_id, type::text, sort_order, is_system, is_hidden FROM categories WHERE name = 'Odsetki' AND parent_id = $1"
    )
    .bind(debt_category_id)
    .fetch_optional(pool)
    .await
    .map_err(db_err)?;

    let interest_category_id = if let Some(cat) = interest_category {
        cat.id
    } else {
        // Create "Odsetki" subcategory
        let max_order: Option<i32> = sqlx::query_scalar(
            "SELECT MAX(sort_order) FROM categories WHERE parent_id = $1"
        )
        .bind(debt_category_id)
        .fetch_one(pool)
        .await
        .unwrap_or(None);
        
        let next_order = max_order.unwrap_or(0) + 1;

        let new_cat = sqlx::query_as::<_, Category>(
            "INSERT INTO categories (name, parent_id, type, sort_order, is_system) 
             VALUES ('Odsetki', $1, 'expense'::category_type, $2, TRUE)
             RETURNING id, name, parent_id, type::text, sort_order, is_system, is_hidden"
        )
        .bind(debt_category_id)
        .bind(next_order)
        .fetch_one(pool)
        .await
        .map_err(db_err)?;
        
        new_cat.id
    };

    Ok((debt_category_id, interest_category_id))
}

pub async fn create_category(State(state): State<AppState>, Json(payload): Json<CreateCategory>) -> Result<Json<Category>, (axum::http::StatusCode, String)> {
    // Calculate next sort order
    let max_order: i32 = sqlx::query_scalar::<_, i32>(
         r#" SELECT COALESCE(MAX(sort_order), 0) FROM categories WHERE $1::int IS NULL OR parent_id = $1 "# 
    )
    .bind(payload.parent_id)
    .fetch_one(&state.pool)
    .await
    .map_err(db_err)?;
    
    let next_order = max_order + 1;

    let cat = sqlx::query_as::<_, Category>(
        "INSERT INTO categories (name, parent_id, type, sort_order, is_system) VALUES ($1, $2, $3::category_type, $4, FALSE)
         RETURNING id, name, parent_id, type::text, sort_order, is_system, is_hidden"
    ).bind(&payload.name).bind(&payload.parent_id).bind(&payload.r#type).bind(next_order)
     .fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(cat))
}

pub async fn list_categories(State(state): State<AppState>) -> Result<Json<Vec<Category>>, (axum::http::StatusCode, String)> {
    let rows = sqlx::query_as::<_, Category>(
        "SELECT id, name, parent_id, type::text, sort_order, is_system, is_hidden FROM categories ORDER BY parent_id NULLS FIRST, sort_order, id"
    ).fetch_all(&state.pool).await.map_err(db_err)?;
    Ok(Json(rows))
}

pub async fn get_category(State(state): State<AppState>, Path(id): Path<i32>) -> Result<Json<Category>, (axum::http::StatusCode, String)> {
    let row = sqlx::query_as::<_, Category>(
        "SELECT id, name, parent_id, type::text, sort_order, is_system, is_hidden FROM categories WHERE id = $1"
    ).bind(id).fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(row))
}
pub async fn is_category_used(State(state): State<AppState>) -> Result<Json<Vec<CategoryUsed>>, (axum::http::StatusCode, String)> {
    let rows = sqlx::query_as::<_,CategoryUsed>(
        "SELECT category_id as id, COUNT(*) > 0 as is_used FROM operations GROUP BY category_id"
    ).fetch_all(&state.pool).await.map_err(db_err)?;
    Ok(Json(rows))
}

pub async fn update_category(State(state): State<AppState>, Path(id): Path<i32>, Json(payload): Json<CreateCategory>) -> Result<Json<Category>, (axum::http::StatusCode, String)> {
    let row = sqlx::query_as::<_, Category>(
        "UPDATE categories SET name = $1, parent_id = $2, type = $3::category_type WHERE id = $4
         RETURNING id, name, parent_id, type::text, sort_order, is_system, is_hidden"
    ).bind(&payload.name).bind(&payload.parent_id).bind(&payload.r#type).bind(id)
     .fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(row))
}

pub async fn delete_category(State(state): State<AppState>, Path(id): Path<i32>) -> Result<(), (axum::http::StatusCode, String)> {
    // Check if category is system category
    let is_system: bool = sqlx::query_scalar("SELECT is_system FROM categories WHERE id = $1")
        .bind(id)
        .fetch_one(&state.pool)
        .await
        .map_err(db_err)?;
    
    if is_system {
        return Err((axum::http::StatusCode::FORBIDDEN, "Cannot delete system category".to_string()));
    }
    
    sqlx::query("DELETE FROM categories WHERE id = $1").bind(id).execute(&state.pool).await.map_err(db_err)?;
    Ok(())
}

pub async fn reorder_categories(State(state): State<AppState>, Json(payload): Json<ReorderCategories>) -> Result<(), (axum::http::StatusCode, String)> {
    let mut tx = state.pool.begin().await.map_err(db_err)?;
    
    for item in payload.items {
        sqlx::query("UPDATE categories SET sort_order = $1 WHERE id = $2")
            .bind(item.sort_order)
            .bind(item.id)
            .execute(&mut *tx)
            .await
            .map_err(db_err)?;
    }
    
    tx.commit().await.map_err(db_err)?;
    Ok(())
}

pub async fn toggle_category_hidden(State(state): State<AppState>, Path(id): Path<i32>) -> Result<Json<Category>, (axum::http::StatusCode, String)> {
    // Check if category is system category
    let is_system: bool = sqlx::query_scalar("SELECT is_system FROM categories WHERE id = $1")
        .bind(id)
        .fetch_one(&state.pool)
        .await
        .map_err(db_err)?;
    
    if is_system {
        return Err((axum::http::StatusCode::FORBIDDEN, "Cannot hide system category".to_string()));
    }
    
    let row = sqlx::query_as::<_, Category>(
        "UPDATE categories SET is_hidden = NOT is_hidden WHERE id = $1
         RETURNING id, name, parent_id, type::text, sort_order, is_system, is_hidden"
    ).bind(id).fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(row))
}
