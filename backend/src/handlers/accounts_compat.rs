use axum::{extract::{State, Path}, Json};
use crate::{AppState, utils::db_err};

/// BACKWARD COMPATIBILITY: /accounts endpoints that map to liquid assets
pub async fn list_accounts_compat(State(state): State<AppState>) -> Result<Json<Vec<serde_json::Value>>, (axum::http::StatusCode, String)> {
    // Get liquid assets and format them as old Account objects
    let rows = sqlx::query!(
        "SELECT a.id, a.name, a.user_id, a.account_number, a.is_active as \"is_active!\"
         FROM assets a
         INNER JOIN asset_types at ON a.asset_type_id = at.id
         WHERE at.category = 'liquid'
         ORDER BY a.id"
    )
    .fetch_all(&state.pool)
    .await
    .map_err(db_err)?;
    
    let accounts: Vec<serde_json::Value> = rows.into_iter().map(|row| {
        serde_json::json!({
            "id": row.id,
            "name": row.name,
            "user_id": row.user_id,
            "account_number": row.account_number,
            "is_closed": !row.is_active
        })
    }).collect();
    
    Ok(Json(accounts))
}

pub async fn toggle_account_closed_compat(State(state): State<AppState>, Path(id): Path<i32>) -> Result<Json<serde_json::Value>, (axum::http::StatusCode, String)> {
    // Toggle is_active on asset
    let row = sqlx::query!(
        "UPDATE assets SET is_active = NOT is_active WHERE id = $1
         RETURNING id, name, user_id, account_number, is_active as \"is_active!\""
    ,id)
    .fetch_one(&state.pool)
    .await
    .map_err(db_err)?;
    
    Ok(Json(serde_json::json!({
        "id": row.id,
        "name": row.name,
        "user_id": row.user_id,
        "account_number": row.account_number,
        "is_closed": !row.is_active
    })))
}
