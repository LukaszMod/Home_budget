use axum::{
    extract::{State, Path},
    Json,
};
use sqlx::sqlx;
use crate::models::*;

pub async fn get_entities(
    State(state): State<AppState>,
) -> Result<Json<Vec<Entity>>, ApiError> {
    let entities = sqlx::query_as::<_, Entity>(
        "SELECT id, name FROM entities WHERE user_id = $1"
    )
    .bind(state.user_id)
    .fetch_all(&state.db)
    .await?;

    Ok(Json(entities))
}

pub async fn create_entity(
    State(state): State<AppState>,
    Json(payload): Json<CreateEntity>,
) -> Result<Json<Entity>, ApiError> {
    let entity = sqlx::query_as::<_, Entity>(
        "INSERT INTO entities (name) VALUES ($1) RETURNING id, name"
    )
    .bind(&payload.name)
    .fetch_one(&state.db)
    .await?;

    Ok(Json(entity))
}

pub async fn delete_entity(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<(), ApiError> {
    sqlx::query("DELETE FROM entities WHERE id = $1")
        .bind(id)
        .execute(&state.db)
        .await?;

    Ok(())
}
