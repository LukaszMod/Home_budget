use axum::{extract::{State, Path}, Json};
use crate::{AppState, models::*, utils::db_err};

pub async fn create_goal(State(state): State<AppState>, Json(payload): Json<CreateGoal>) -> Result<Json<Goal>, (axum::http::StatusCode, String)> {
    let goal = sqlx::query_as::<_, Goal>(
        "INSERT INTO goals (user_id, asset_id, name, target_amount, target_date)
         VALUES ($1, $2, $3, $4, $5::date)
         RETURNING id, user_id, asset_id, name, target_amount, current_amount, target_date, created_date, completed_date, is_completed"
    ).bind(payload.user_id).bind(payload.asset_id).bind(&payload.name).bind(payload.target_amount).bind(&payload.target_date)
     .fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(goal))
}

pub async fn list_goals(State(state): State<AppState>) -> Result<Json<Vec<Goal>>, (axum::http::StatusCode, String)> {
    let rows = sqlx::query_as::<_, Goal>(
        "SELECT id, user_id, asset_id, name, target_amount, current_amount, target_date, created_date, completed_date, is_completed 
         FROM goals ORDER BY target_date DESC, id"
    ).fetch_all(&state.pool).await.map_err(db_err)?;
    Ok(Json(rows))
}

pub async fn get_goal(State(state): State<AppState>, Path(id): Path<i32>) -> Result<Json<Goal>, (axum::http::StatusCode, String)> {
    let goal = sqlx::query_as::<_, Goal>(
        "SELECT id, user_id, asset_id, name, target_amount, current_amount, target_date, created_date, completed_date, is_completed 
         FROM goals WHERE id = $1"
    ).bind(id).fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(goal))
}

pub async fn update_goal(State(state): State<AppState>, Path(id): Path<i32>, Json(payload): Json<CreateGoal>) -> Result<Json<Goal>, (axum::http::StatusCode, String)> {
    let goal = sqlx::query_as::<_, Goal>(
        "UPDATE goals SET user_id = $1, asset_id = $2, name = $3, target_amount = $4, target_date = $5::date
         WHERE id = $6
         RETURNING id, user_id, asset_id, name, target_amount, current_amount, target_date, created_date, completed_date, is_completed"
    ).bind(payload.user_id).bind(payload.asset_id).bind(&payload.name).bind(payload.target_amount).bind(&payload.target_date).bind(id)
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
         RETURNING id, user_id, asset_id, name, target_amount, current_amount, target_date, created_date, completed_date, is_completed"
    ).bind(id).fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(goal))
}
