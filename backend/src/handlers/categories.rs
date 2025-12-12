use axum::{extract::{State, Path}, Json};
use crate::{AppState, models::*, utils::db_err};

pub async fn create_category(State(state): State<AppState>, Json(payload): Json<CreateCategory>) -> Result<Json<Category>, (axum::http::StatusCode, String)> {
    let cat = sqlx::query_as::<_, Category>(
        "INSERT INTO categories (name, parent_id, type) VALUES ($1, $2, $3::category_type)
         RETURNING id, name, parent_id, type::text"
    ).bind(&payload.name).bind(&payload.parent_id).bind(&payload.r#type)
     .fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(cat))
}

pub async fn list_categories(State(state): State<AppState>) -> Result<Json<Vec<Category>>, (axum::http::StatusCode, String)> {
    let rows = sqlx::query_as::<_, Category>(
        "SELECT id, name, parent_id, type::text FROM categories ORDER BY parent_id NULLS FIRST, id"
    ).fetch_all(&state.pool).await.map_err(db_err)?;
    Ok(Json(rows))
}

pub async fn get_category(State(state): State<AppState>, Path(id): Path<i32>) -> Result<Json<Category>, (axum::http::StatusCode, String)> {
    let row = sqlx::query_as::<_, Category>(
        "SELECT id, name, parent_id, type::text FROM categories WHERE id = $1"
    ).bind(id).fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(row))
}

pub async fn update_category(State(state): State<AppState>, Path(id): Path<i32>, Json(payload): Json<CreateCategory>) -> Result<Json<Category>, (axum::http::StatusCode, String)> {
    let row = sqlx::query_as::<_, Category>(
        "UPDATE categories SET name = $1, parent_id = $2, type = $3::category_type WHERE id = $4
         RETURNING id, name, parent_id, type::text"
    ).bind(&payload.name).bind(&payload.parent_id).bind(&payload.r#type).bind(id)
     .fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(row))
}

pub async fn delete_category(State(state): State<AppState>, Path(id): Path<i32>) -> Result<(), (axum::http::StatusCode, String)> {
    sqlx::query("DELETE FROM categories WHERE id = $1").bind(id).execute(&state.pool).await.map_err(db_err)?;
    Ok(())
}
