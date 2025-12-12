use axum::{extract::{State, Path}, Json};
use crate::{AppState, models::*, utils::db_err};

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
