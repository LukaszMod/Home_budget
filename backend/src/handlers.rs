use axum::{extract::{State, Path}, Json};
use crate::{AppState, models::*};


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
        "INSERT INTO categories (name, main_category, parent_id) VALUES ($1, $2, $3)
         RETURNING id, name, main_category, parent_id"
    ).bind(&payload.name).bind(&payload.main_category).bind(&payload.parent_id)
     .fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(cat))
}

pub async fn list_categories(State(state): State<AppState>) -> Result<Json<Vec<Category>>, (axum::http::StatusCode, String)> {
    let rows = sqlx::query_as::<_, Category>(
        "SELECT id, name, main_category, parent_id FROM categories ORDER BY id"
    ).fetch_all(&state.pool).await.map_err(db_err)?;
    Ok(Json(rows))
}

pub async fn get_category(State(state): State<AppState>, Path(id): Path<i32>) -> Result<Json<Category>, (axum::http::StatusCode, String)> {
    let row = sqlx::query_as::<_, Category>(
        "SELECT id, name, main_category, parent_id FROM categories WHERE id = $1"
    ).bind(id).fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(row))
}

pub async fn update_category(State(state): State<AppState>, Path(id): Path<i32>, Json(payload): Json<CreateCategory>) -> Result<Json<Category>, (axum::http::StatusCode, String)> {
    let row = sqlx::query_as::<_, Category>(
        "UPDATE categories SET name = $1, main_category = $2, parent_id = $3 WHERE id = $4
         RETURNING id, name, main_category, parent_id"
    ).bind(&payload.name).bind(&payload.main_category).bind(&payload.parent_id).bind(id)
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
        "INSERT INTO accounts (name, owner, account_number) VALUES ($1, $2, $3)
         RETURNING id, name, owner, account_number"
    ).bind(&payload.name).bind(payload.owner).bind(&payload.account_number).fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(acc))
}

pub async fn list_accounts(State(state): State<AppState>) -> Result<Json<Vec<Account>>, (axum::http::StatusCode, String)> {
    let rows = sqlx::query_as::<_, Account>(
        "SELECT id, name, owner, account_number FROM accounts ORDER BY id"
    ).fetch_all(&state.pool).await.map_err(db_err)?;
    Ok(Json(rows))
}

pub async fn get_account(State(state): State<AppState>, Path(id): Path<i32>) -> Result<Json<Account>, (axum::http::StatusCode, String)> {
    let acc = sqlx::query_as::<_, Account>(
        "SELECT id, name, owner, account_number FROM accounts WHERE id = $1"
    ).bind(id).fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(acc))
}

pub async fn update_account(State(state): State<AppState>, Path(id): Path<i32>, Json(payload): Json<CreateAccount>) -> Result<Json<Account>, (axum::http::StatusCode, String)> {
    let acc = sqlx::query_as::<_, Account>(
        "UPDATE accounts SET name = $1, owner = $2, account_number = $3 WHERE id = $4
         RETURNING id, name, owner, account_number"
    ).bind(&payload.name).bind(payload.owner).bind(&payload.account_number).bind(id).fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(acc))
}

pub async fn delete_account(State(state): State<AppState>, Path(id): Path<i32>) -> Result<(), (axum::http::StatusCode, String)> {
    sqlx::query("DELETE FROM accounts WHERE id = $1").bind(id).execute(&state.pool).await.map_err(db_err)?;
    Ok(())
}

// OPERATIONS
pub async fn create_operation(State(state): State<AppState>, Json(payload): Json<CreateOperation>) -> Result<Json<Operation>, (axum::http::StatusCode, String)> {
    let op = sqlx::query_as::<_, Operation>(
        "INSERT INTO operations (category, description, user_id, parent_operation, account_id, amount, type)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, creation_date, category, description, user_id, parent_operation, account_id, amount, type::text"
    ).bind(&payload.category)
     .bind(&payload.description)
     .bind(payload.user_id)
     .bind(&payload.parent_operation)
     .bind(payload.account_id)
     .bind(payload.amount)
     .bind(&payload.r#type)
     .fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(op))
}

pub async fn list_operations(State(state): State<AppState>) -> Result<Json<Vec<Operation>>, (axum::http::StatusCode, String)> {
    let rows = sqlx::query_as::<_, Operation>(
        "SELECT id, creation_date, category, description, user_id, parent_operation, account_id, amount, type::text
         FROM operations ORDER BY id"
    ).fetch_all(&state.pool).await.map_err(db_err)?;
    Ok(Json(rows))
}

pub async fn get_operation(State(state): State<AppState>, Path(id): Path<i32>) -> Result<Json<Operation>, (axum::http::StatusCode, String)> {
    let op = sqlx::query_as::<_, Operation>(
        "SELECT id, creation_date, category, description, user_id, parent_operation, account_id, amount, type::text
         FROM operations WHERE id = $1"
    ).bind(id).fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(op))
}

pub async fn update_operation(State(state): State<AppState>, Path(id): Path<i32>, Json(payload): Json<CreateOperation>) -> Result<Json<Operation>, (axum::http::StatusCode, String)> {
    let op = sqlx::query_as::<_, Operation>(
        "UPDATE operations
         SET category = $1, description = $2, user_id = $3, parent_operation = $4, account_id = $5, amount = $6, type = $7
         WHERE id = $8
         RETURNING id, creation_date, category, description, user_id, parent_operation, account_id, amount, type::text"
    ).bind(&payload.category)
     .bind(&payload.description)
     .bind(payload.user_id)
     .bind(&payload.parent_operation)
     .bind(payload.account_id)
     .bind(payload.amount)
     .bind(&payload.r#type)
     .bind(id)
     .fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(op))
}

pub async fn delete_operation(State(state): State<AppState>, Path(id): Path<i32>) -> Result<(), (axum::http::StatusCode, String)> {
    sqlx::query("DELETE FROM operations WHERE id = $1").bind(id).execute(&state.pool).await.map_err(db_err)?;
    Ok(())
}

pub async fn list_child_operations(State(state): State<AppState>, Path(id): Path<i32>) -> Result<Json<Vec<Operation>>, (axum::http::StatusCode, String)> {
    let rows = sqlx::query_as::<_, Operation>(
        "SELECT id, creation_date, category, description, user_id, parent_operation, account_id, amount, type::text
         FROM operations WHERE parent_operation = $1 ORDER BY id"
    ).bind(id).fetch_all(&state.pool).await.map_err(db_err)?;
    Ok(Json(rows))
}

// BUDGETS
pub async fn create_budget(State(state): State<AppState>, Json(payload): Json<CreateBudget>) -> Result<Json<Budget>, (axum::http::StatusCode, String)> {
    let row = sqlx::query_as::<_, Budget>(
        "INSERT INTO budgets (user_id, category_id, month, limit_amount)
         VALUES ($1, $2, $3, $4)
         RETURNING id, user_id, category_id, month, limit_amount"
    ).bind(payload.user_id).bind(payload.category_id).bind(payload.month).bind(payload.limit_amount)
     .fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(row))
}

pub async fn list_budgets(State(state): State<AppState>) -> Result<Json<Vec<Budget>>, (axum::http::StatusCode, String)> {
    let rows = sqlx::query_as::<_, Budget>(
        "SELECT id, user_id, category_id, month, limit_amount FROM budgets ORDER BY month DESC, id"
    ).fetch_all(&state.pool).await.map_err(db_err)?;
    Ok(Json(rows))
}

pub async fn get_budget(State(state): State<AppState>, Path(id): Path<i32>) -> Result<Json<Budget>, (axum::http::StatusCode, String)> {
    let row = sqlx::query_as::<_, Budget>(
        "SELECT id, user_id, category_id, month, limit_amount FROM budgets WHERE id = $1"
    ).bind(id).fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(row))
}

pub async fn update_budget(State(state): State<AppState>, Path(id): Path<i32>, Json(payload): Json<CreateBudget>) -> Result<Json<Budget>, (axum::http::StatusCode, String)> {
    let row = sqlx::query_as::<_, Budget>(
        "UPDATE budgets SET user_id = $1, category_id = $2, month = $3, limit_amount = $4
         WHERE id = $5
         RETURNING id, user_id, category_id, month, limit_amount"
    ).bind(payload.user_id).bind(payload.category_id).bind(payload.month).bind(payload.limit_amount).bind(id)
     .fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(row))
}

pub async fn delete_budget(State(state): State<AppState>, Path(id): Path<i32>) -> Result<(), (axum::http::StatusCode, String)> {
    sqlx::query("DELETE FROM budgets WHERE id = $1").bind(id).execute(&state.pool).await.map_err(db_err)?;
    Ok(())
}

// Prosty wrapper błędów
fn db_err<E: std::fmt::Display>(e: E) -> (axum::http::StatusCode, String) {
    (axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("DB error: {}", e))
}
