use crate::{AppState, models::*, utils::db_err};
use axum::{
    Json,
    extract::{Path, State},
};

// Validation: hashtag can only contain alphanumeric and underscore characters
fn is_valid_hashtag(name: &str) -> bool {
    !name.is_empty() && name.len() <= 50 && name.chars().all(|c| c.is_alphanumeric() || c == '_')
}

pub async fn get_hashtags(
    State(state): State<AppState>,
) -> Result<Json<Vec<Hashtag>>, (axum::http::StatusCode, String)> {
    let rows = sqlx::query_as::<_, Hashtag>(
        "SELECT id, name, created_date, usage_count FROM hashtags ORDER BY name",
    )
    .fetch_all(&state.pool)
    .await
    .map_err(db_err)?;
    Ok(Json(rows))
}

pub async fn create_hashtag(
    State(state): State<AppState>,
    Json(payload): Json<CreateHashtag>,
) -> Result<Json<Hashtag>, (axum::http::StatusCode, String)> {
    // Validate hashtag format
    if !is_valid_hashtag(&payload.name) {
        return Err((
            axum::http::StatusCode::BAD_REQUEST,
            "Hashtag can only contain alphanumeric characters and underscore, max 50 chars"
                .to_string(),
        ));
    }

    let name_lower = payload.name.to_lowercase();

    let hashtag = sqlx::query_as::<_, Hashtag>(
        "INSERT INTO hashtags (name, usage_count) VALUES ($1, 0)
         ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
         RETURNING id, name, created_date, usage_count",
    )
    .bind(&name_lower)
    .fetch_one(&state.pool)
    .await
    .map_err(db_err)?;

    Ok(Json(hashtag))
}

pub async fn delete_hashtag(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<(), (axum::http::StatusCode, String)> {
    // Check if hashtag is used in any operations (usage_count > 0)
    let hashtag = sqlx::query_as::<_, Hashtag>(
        "SELECT id, name, created_date, usage_count FROM hashtags WHERE id = $1",
    )
    .bind(id)
    .fetch_optional(&state.pool)
    .await
    .map_err(db_err)?;

    match hashtag {
        Some(h) if h.usage_count > 0 => Err((
            axum::http::StatusCode::CONFLICT,
            "Cannot delete hashtag that is used in operations".to_string(),
        )),
        Some(_) => {
            sqlx::query("DELETE FROM hashtags WHERE id = $1")
                .bind(id)
                .execute(&state.pool)
                .await
                .map_err(db_err)?;
            Ok(())
        }
        None => Err((
            axum::http::StatusCode::NOT_FOUND,
            "Hashtag not found".to_string(),
        )),
    }
}

pub async fn extract_hashtags_from_text(
    State(_state): State<AppState>,
    Json(payload): Json<serde_json::Value>,
) -> Result<Json<Vec<String>>, (axum::http::StatusCode, String)> {
    let text = payload.get("text").and_then(|v| v.as_str()).ok_or((
        axum::http::StatusCode::BAD_REQUEST,
        "Missing 'text' field".to_string(),
    ))?;

    // Extract hashtags from text (words starting with #)
    let hashtags = crate::handlers::operations::extract_hashtags(text);

    Ok(Json(hashtags))
}
