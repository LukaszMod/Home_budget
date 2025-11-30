use axum::{extract::{State, Path}, Json};
use crate::{AppState, models::*};
use serde_json::json;


// USERS
pub async fn create_user(
    State(state): State<AppState>,
    Json(payload): Json<CreateUser>,
) -> Result<Json<User>, (axum::http::StatusCode, String)> {
    let user = sqlx::query_as::<_, User>(
        "INSERT INTO users (full_name, nick) VALUES ($1, $2) RETURNING id, full_name, nick, creation_date"
    )
    .bind(&payload.full_name)
    .bind(&payload.nick)
    .fetch_one(&state.pool)
    .await
    .map_err(db_err)?;
    Ok(Json(user))
}

pub async fn list_users(State(state): State<AppState>) -> Result<Json<Vec<User>>, (axum::http::StatusCode, String)> {
    let rows = sqlx::query_as::<_, User>(
        "SELECT id, full_name, nick, creation_date FROM users ORDER BY id"
    ).fetch_all(&state.pool).await.map_err(db_err)?;
    Ok(Json(rows))
}

pub async fn get_user(State(state): State<AppState>, Path(id): Path<i32>) -> Result<Json<User>, (axum::http::StatusCode, String)> {
    let user = sqlx::query_as::<_, User>(
        "SELECT id, full_name, nick, creation_date FROM users WHERE id = $1"
    ).bind(id).fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(user))
}

pub async fn update_user(State(state): State<AppState>, Path(id): Path<i32>, Json(payload): Json<CreateUser>) -> Result<Json<User>, (axum::http::StatusCode, String)> {
    let user = sqlx::query_as::<_, User>(
        "UPDATE users SET full_name = $1, nick = $2 WHERE id = $3
         RETURNING id, full_name, nick, creation_date"
    ).bind(&payload.full_name).bind(&payload.nick).bind(id).fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(user))
}

pub async fn delete_user(State(state): State<AppState>, Path(id): Path<i32>) -> Result<(), (axum::http::StatusCode, String)> {
    sqlx::query("DELETE FROM users WHERE id = $1").bind(id).execute(&state.pool).await.map_err(db_err)?;
    Ok(())
}

// CATEGORIES
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

// ACCOUNTS
pub async fn create_account(State(state): State<AppState>, Json(payload): Json<CreateAccount>) -> Result<Json<Account>, (axum::http::StatusCode, String)> {
    let acc = sqlx::query_as::<_, Account>(
        "INSERT INTO accounts (user_id, name, account_number) VALUES ($1, $2, $3)
         RETURNING id, user_id, name, account_number, is_closed"
    ).bind(payload.user_id).bind(&payload.name).bind(&payload.account_number).fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(acc))
}

pub async fn list_accounts(State(state): State<AppState>) -> Result<Json<Vec<Account>>, (axum::http::StatusCode, String)> {
    let rows = sqlx::query_as::<_, Account>(
        "SELECT id, user_id, name, account_number, is_closed FROM accounts ORDER BY id"
    ).fetch_all(&state.pool).await.map_err(db_err)?;
    Ok(Json(rows))
}

pub async fn get_account(State(state): State<AppState>, Path(id): Path<i32>) -> Result<Json<Account>, (axum::http::StatusCode, String)> {
    let acc = sqlx::query_as::<_, Account>(
        "SELECT id, user_id, name, account_number, is_closed FROM accounts WHERE id = $1"
    ).bind(id).fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(acc))
}

pub async fn update_account(State(state): State<AppState>, Path(id): Path<i32>, Json(payload): Json<CreateAccount>) -> Result<Json<Account>, (axum::http::StatusCode, String)> {
    let acc = sqlx::query_as::<_, Account>(
        "UPDATE accounts SET user_id = $1, name = $2, account_number = $3 WHERE id = $4
         RETURNING id, user_id, name, account_number, is_closed"
    ).bind(payload.user_id).bind(&payload.name).bind(&payload.account_number).bind(id).fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(acc))
}

pub async fn delete_account(State(state): State<AppState>, Path(id): Path<i32>) -> Result<(), (axum::http::StatusCode, String)> {
    sqlx::query("DELETE FROM accounts WHERE id = $1").bind(id).execute(&state.pool).await.map_err(db_err)?;
    Ok(())
}

pub async fn toggle_account_closed(State(state): State<AppState>, Path(id): Path<i32>) -> Result<Json<Account>, (axum::http::StatusCode, String)> {
    let acc = sqlx::query_as::<_, Account>(
        "UPDATE accounts SET is_closed = NOT is_closed WHERE id = $1
         RETURNING id, user_id, name, account_number, is_closed"
    ).bind(id).fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(acc))
}

// OPERATIONS
pub async fn create_operation(State(state): State<AppState>, Json(payload): Json<CreateOperation>) -> Result<Json<Operation>, (axum::http::StatusCode, String)> {
    let op = sqlx::query_as::<_, Operation>(
        "INSERT INTO operations (category_id, description, account_id, amount, operation_type, operation_date)
         VALUES ($1, $2, $3, $4, $5::operation_type, $6::date)
         RETURNING id, creation_date, category_id, description, account_id, amount::float8, operation_type::text, operation_date"
    ).bind(payload.category_id)
     .bind(&payload.description)
     .bind(payload.account_id)
     .bind(payload.amount)
     .bind(&payload.operation_type)
     .bind(&payload.operation_date)
     .fetch_one(&state.pool).await.map_err(db_err)?;
    
    // Extract and link hashtags from description
    if let Some(desc) = &payload.description {
        let hashtags = extract_hashtags(desc);
        for hashtag in hashtags {
            // Get or create hashtag
            let hashtag_id: (i32,) = sqlx::query_as(
                "INSERT INTO hashtags (name) VALUES ($1)
                 ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
                 RETURNING id"
            )
            .bind(&hashtag)
            .fetch_one(&state.pool)
            .await
            .map_err(db_err)?;
            
            // Link operation and hashtag
            sqlx::query("INSERT INTO operation_hashtags (operation_id, hashtag_id) VALUES ($1, $2)")
                .bind(op.id)
                .bind(hashtag_id.0)
                .execute(&state.pool)
                .await
                .map_err(db_err)?;
        }
    }
    
    Ok(Json(op))
}

// Helper function to extract hashtags from text
fn extract_hashtags(text: &str) -> Vec<String> {
    let mut hashtags: Vec<String> = Vec::new();
    let words: Vec<&str> = text.split_whitespace().collect();
    
    for word in words {
        if word.starts_with('#') {
            let hashtag = word.trim_start_matches('#')
                .chars()
                .filter(|c| c.is_alphanumeric() || *c == '_')
                .collect::<String>()
                .to_lowercase();
            
            if !hashtag.is_empty() && !hashtags.contains(&hashtag) {
                hashtags.push(hashtag);
            }
        }
    }
    
    hashtags
}

pub async fn list_operations(State(state): State<AppState>) -> Result<Json<Vec<Operation>>, (axum::http::StatusCode, String)> {
    let rows = sqlx::query_as::<_, Operation>(
        "SELECT id, creation_date, category_id, description, account_id, amount::float8, operation_type::text, operation_date
         FROM operations ORDER BY operation_date DESC, id"
    ).fetch_all(&state.pool).await.map_err(db_err)?;
    Ok(Json(rows))
}

pub async fn get_operation(State(state): State<AppState>, Path(id): Path<i32>) -> Result<Json<Operation>, (axum::http::StatusCode, String)> {
    let op = sqlx::query_as::<_, Operation>(
        "SELECT id, creation_date, category_id, description, account_id, amount::float8, operation_type::text, operation_date
         FROM operations WHERE id = $1"
    ).bind(id).fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(op))
}

pub async fn update_operation(State(state): State<AppState>, Path(id): Path<i32>, Json(payload): Json<CreateOperation>) -> Result<Json<Operation>, (axum::http::StatusCode, String)> {
    let op = sqlx::query_as::<_, Operation>(
        "UPDATE operations
         SET category_id = $1, description = $2, account_id = $3, amount = $4, operation_type = $5::operation_type, operation_date = $6::date
         WHERE id = $7
         RETURNING id, creation_date, category_id, description, account_id, amount::float8, operation_type::text, operation_date"
    ).bind(payload.category_id)
     .bind(&payload.description)
     .bind(payload.account_id)
     .bind(payload.amount)
     .bind(&payload.operation_type)
     .bind(&payload.operation_date)
     .bind(id)
     .fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(op))
}

pub async fn delete_operation(State(state): State<AppState>, Path(id): Path<i32>) -> Result<(), (axum::http::StatusCode, String)> {
    sqlx::query("DELETE FROM operations WHERE id = $1").bind(id).execute(&state.pool).await.map_err(db_err)?;
    Ok(())
}

// BUDGETS
pub async fn create_budget(State(state): State<AppState>, Json(payload): Json<CreateBudget>) -> Result<Json<Budget>, (axum::http::StatusCode, String)> {
    let row = sqlx::query_as::<_, Budget>(
        "INSERT INTO budgets (account_id, category_id, month, planned_amount)
         VALUES ($1, $2, $3, $4)
         RETURNING id, account_id, category_id, month, planned_amount::float8"
    ).bind(payload.account_id).bind(payload.category_id).bind(payload.month).bind(payload.planned_amount)
     .fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(row))
}

pub async fn list_budgets(State(state): State<AppState>) -> Result<Json<Vec<Budget>>, (axum::http::StatusCode, String)> {
    let rows = sqlx::query_as::<_, Budget>(
        "SELECT id, account_id, category_id, month, planned_amount::float8 FROM budgets ORDER BY month DESC, id"
    ).fetch_all(&state.pool).await.map_err(db_err)?;
    Ok(Json(rows))
}

pub async fn get_budget(State(state): State<AppState>, Path(id): Path<i32>) -> Result<Json<Budget>, (axum::http::StatusCode, String)> {
    let row = sqlx::query_as::<_, Budget>(
        "SELECT id, account_id, category_id, month, planned_amount::float8 FROM budgets WHERE id = $1"
    ).bind(id).fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(row))
}

pub async fn update_budget(State(state): State<AppState>, Path(id): Path<i32>, Json(payload): Json<CreateBudget>) -> Result<Json<Budget>, (axum::http::StatusCode, String)> {
    let row = sqlx::query_as::<_, Budget>(
        "UPDATE budgets SET account_id = $1, category_id = $2, month = $3, planned_amount = $4
         WHERE id = $5
         RETURNING id, account_id, category_id, month, planned_amount::float8"
    ).bind(payload.account_id).bind(payload.category_id).bind(payload.month).bind(payload.planned_amount).bind(id)
     .fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(row))
}

pub async fn delete_budget(State(state): State<AppState>, Path(id): Path<i32>) -> Result<(), (axum::http::StatusCode, String)> {
    sqlx::query("DELETE FROM budgets WHERE id = $1").bind(id).execute(&state.pool).await.map_err(db_err)?;
    Ok(())
}

// GOALS
pub async fn create_goal(State(state): State<AppState>, Json(payload): Json<CreateGoal>) -> Result<Json<Goal>, (axum::http::StatusCode, String)> {
    let goal = sqlx::query_as::<_, Goal>(
        "INSERT INTO goals (user_id, account_id, name, target_amount, target_date)
         VALUES ($1, $2, $3, $4, $5::date)
         RETURNING id, user_id, account_id, name, target_amount::float8, current_amount::float8, target_date, created_date, completed_date, is_completed"
    ).bind(payload.user_id).bind(payload.account_id).bind(&payload.name).bind(payload.target_amount).bind(&payload.target_date)
     .fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(goal))
}

pub async fn list_goals(State(state): State<AppState>) -> Result<Json<Vec<Goal>>, (axum::http::StatusCode, String)> {
    let rows = sqlx::query_as::<_, Goal>(
        "SELECT id, user_id, account_id, name, target_amount::float8, current_amount::float8, target_date, created_date, completed_date, is_completed 
         FROM goals ORDER BY target_date DESC, id"
    ).fetch_all(&state.pool).await.map_err(db_err)?;
    Ok(Json(rows))
}

pub async fn get_goal(State(state): State<AppState>, Path(id): Path<i32>) -> Result<Json<Goal>, (axum::http::StatusCode, String)> {
    let goal = sqlx::query_as::<_, Goal>(
        "SELECT id, user_id, account_id, name, target_amount::float8, current_amount::float8, target_date, created_date, completed_date, is_completed 
         FROM goals WHERE id = $1"
    ).bind(id).fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(goal))
}

pub async fn update_goal(State(state): State<AppState>, Path(id): Path<i32>, Json(payload): Json<CreateGoal>) -> Result<Json<Goal>, (axum::http::StatusCode, String)> {
    let goal = sqlx::query_as::<_, Goal>(
        "UPDATE goals SET user_id = $1, account_id = $2, name = $3, target_amount = $4, target_date = $5::date
         WHERE id = $6
         RETURNING id, user_id, account_id, name, target_amount::float8, current_amount::float8, target_date, created_date, completed_date, is_completed"
    ).bind(payload.user_id).bind(payload.account_id).bind(&payload.name).bind(payload.target_amount).bind(&payload.target_date).bind(id)
     .fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(goal))
}

pub async fn delete_goal(State(state): State<AppState>, Path(id): Path<i32>) -> Result<(), (axum::http::StatusCode, String)> {
    sqlx::query("DELETE FROM goals WHERE id = $1").bind(id).execute(&state.pool).await.map_err(db_err)?;
    Ok(())
}

pub async fn complete_goal(State(state): State<AppState>, Path(id): Path<i32>) -> Result<Json<Goal>, (axum::http::StatusCode, String)> {
    let goal = sqlx::query_as::<_, Goal>(
        "UPDATE goals SET is_completed = TRUE, completed_date = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING id, user_id, account_id, name, target_amount::float8, current_amount::float8, target_date, created_date, completed_date, is_completed"
    ).bind(id).fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(goal))
}

// HASHTAGS
// Validation: hashtag can only contain alphanumeric and underscore characters
fn is_valid_hashtag(name: &str) -> bool {
    !name.is_empty() && name.len() <= 50 && name.chars().all(|c| c.is_alphanumeric() || c == '_')
}

pub async fn get_hashtags(State(state): State<AppState>) -> Result<Json<Vec<Hashtag>>, (axum::http::StatusCode, String)> {
    let rows = sqlx::query_as::<_, Hashtag>(
        "SELECT id, name, created_date FROM hashtags ORDER BY name"
    ).fetch_all(&state.pool).await.map_err(db_err)?;
    Ok(Json(rows))
}

pub async fn create_hashtag(State(state): State<AppState>, Json(payload): Json<CreateHashtag>) -> Result<Json<Hashtag>, (axum::http::StatusCode, String)> {
    // Validate hashtag format
    if !is_valid_hashtag(&payload.name) {
        return Err((axum::http::StatusCode::BAD_REQUEST, 
            "Hashtag can only contain alphanumeric characters and underscore, max 50 chars".to_string()));
    }

    let name_lower = payload.name.to_lowercase();
    
    let hashtag = sqlx::query_as::<_, Hashtag>(
        "INSERT INTO hashtags (name) VALUES ($1)
         ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
         RETURNING id, name, created_date"
    )
    .bind(&name_lower)
    .fetch_one(&state.pool)
    .await
    .map_err(db_err)?;
    
    Ok(Json(hashtag))
}

pub async fn delete_hashtag(State(state): State<AppState>, Path(id): Path<i32>) -> Result<(), (axum::http::StatusCode, String)> {
    // Check if hashtag is used in any operations
    let count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM operation_hashtags WHERE hashtag_id = $1")
        .bind(id)
        .fetch_one(&state.pool)
        .await
        .map_err(db_err)?;
    
    if count.0 > 0 {
        return Err((axum::http::StatusCode::CONFLICT, 
            "Cannot delete hashtag that is used in operations".to_string()));
    }
    
    sqlx::query("DELETE FROM hashtags WHERE id = $1").bind(id).execute(&state.pool).await.map_err(db_err)?;
    Ok(())
}

pub async fn extract_hashtags_from_text(State(state): State<AppState>, Json(payload): Json<serde_json::Value>) -> Result<Json<Vec<String>>, (axum::http::StatusCode, String)> {
    let text = payload.get("text")
        .and_then(|v| v.as_str())
        .ok_or((axum::http::StatusCode::BAD_REQUEST, "Missing 'text' field".to_string()))?;
    
    // Extract hashtags from text (words starting with #)
    let hashtags = extract_hashtags(text);
    
    Ok(Json(hashtags))
}

// Prosty wrapper błędów
fn db_err<E: std::fmt::Display>(e: E) -> (axum::http::StatusCode, String) {
    (axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("DB error: {}", e))
}
