use axum::{
    extract::{Path, State, Query},
    http::StatusCode,
    Json,
};
use serde::Deserialize;

use crate::{AppState, models::{ImportTemplate, CreateImportTemplate, UpdateImportTemplate}};

#[derive(Deserialize)]
pub struct ImportTemplateQuery {
    pub user_id: Option<i32>,
}

pub async fn create_import_template(
    State(state): State<AppState>,
    Query(params): Query<ImportTemplateQuery>,
    Json(template): Json<CreateImportTemplate>,
) -> Result<(StatusCode, Json<ImportTemplate>), StatusCode> {
    let user_id = params.user_id.ok_or(StatusCode::BAD_REQUEST)?;

    let result = sqlx::query_as::<_, ImportTemplate>(
        r#"
        INSERT INTO import_templates (user_id, name, template_data)
        VALUES ($1, $2, $3)
        RETURNING id, user_id, name, template_data, created_at, updated_at
        "#
    )
    .bind(user_id)
    .bind(&template.name)
    .bind(&template.template_data)
    .fetch_one(&state.pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok((StatusCode::CREATED, Json(result)))
}

pub async fn list_import_templates(
    State(state): State<AppState>,
    Query(params): Query<ImportTemplateQuery>,
) -> Result<Json<Vec<ImportTemplate>>, StatusCode> {
    let user_id = params.user_id.ok_or(StatusCode::BAD_REQUEST)?;

    let templates = sqlx::query_as::<_, ImportTemplate>(
        r#"
        SELECT id, user_id, name, template_data, created_at, updated_at
        FROM import_templates
        WHERE user_id = $1
        ORDER BY created_at DESC
        "#
    )
    .bind(user_id)
    .fetch_all(&state.pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(templates))
}

pub async fn get_import_template(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<Json<ImportTemplate>, StatusCode> {
    let template = sqlx::query_as::<_, ImportTemplate>(
        r#"
        SELECT id, user_id, name, template_data, created_at, updated_at
        FROM import_templates
        WHERE id = $1
        "#
    )
    .bind(id)
    .fetch_one(&state.pool)
    .await
    .map_err(|_| StatusCode::NOT_FOUND)?;

    Ok(Json(template))
}

pub async fn update_import_template(
    State(state): State<AppState>,
    Path(id): Path<i32>,
    Json(update): Json<UpdateImportTemplate>,
) -> Result<Json<ImportTemplate>, StatusCode> {
    // Build dynamic update query
    let mut query = String::from("UPDATE import_templates SET updated_at = CURRENT_TIMESTAMP");
    let mut params_count = 1;

    if update.name.is_some() {
        params_count += 1;
        query.push_str(&format!(", name = ${}", params_count));
    }
    if update.template_data.is_some() {
        params_count += 1;
        query.push_str(&format!(", template_data = ${}", params_count));
    }

    query.push_str(" WHERE id = $1 RETURNING id, user_id, name, template_data, created_at, updated_at");

    let mut qry = sqlx::query_as::<_, ImportTemplate>(&query).bind(id);

    if let Some(name) = update.name {
        qry = qry.bind(name);
    }
    if let Some(template_data) = update.template_data {
        qry = qry.bind(template_data);
    }

    let template = qry
        .fetch_one(&state.pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(template))
}

pub async fn delete_import_template(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<StatusCode, StatusCode> {
    sqlx::query("DELETE FROM import_templates WHERE id = $1")
        .bind(id)
        .execute(&state.pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(StatusCode::NO_CONTENT)
}
