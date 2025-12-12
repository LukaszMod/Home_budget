use axum::{extract::{State, Path}, Json};
use crate::{AppState, models::*, utils::db_err};

pub async fn create_recurring_operation(
    State(state): State<AppState>,
    Json(payload): Json<CreateRecurringOperation>,
) -> Result<Json<RecurringOperation>, (axum::http::StatusCode, String)> {
    let start_date = chrono::NaiveDate::parse_from_str(&payload.start_date, "%Y-%m-%d")
        .map_err(|_| (axum::http::StatusCode::BAD_REQUEST, "Invalid start_date format".to_string()))?;
    
    let end_date = if let Some(ed) = payload.end_date {
        Some(chrono::NaiveDate::parse_from_str(&ed, "%Y-%m-%d")
            .map_err(|_| (axum::http::StatusCode::BAD_REQUEST, "Invalid end_date format".to_string()))?)
    } else {
        None
    };

    let recurring_op = sqlx::query_as::<_, RecurringOperation>(
        "INSERT INTO recurring_operations (asset_id, category_id, description, amount, operation_type, frequency, start_date, end_date, is_active)
         VALUES ($1, $2, $3, $4, $5::operation_type, $6::recurring_frequency, $7, $8, TRUE)
         RETURNING id, asset_id, category_id, description, amount, operation_type::text, frequency::text, start_date, end_date, is_active, creation_date, last_generated"
    )
    .bind(payload.asset_id)
    .bind(payload.category_id)
    .bind(&payload.description)
    .bind(payload.amount)
    .bind(&payload.operation_type)
    .bind(&payload.frequency)
    .bind(start_date)
    .bind(end_date)
    .fetch_one(&state.pool)
    .await
    .map_err(db_err)?;

    Ok(Json(recurring_op))
}

pub async fn list_recurring_operations(State(state): State<AppState>) -> Result<Json<Vec<RecurringOperationWithDetails>>, (axum::http::StatusCode, String)> {
    #[derive(sqlx::FromRow)]
    struct RecurringOpRow {
        id: i32,
        asset_id: i32,
        asset_name: Option<String>,
        category_id: Option<i32>,
        category_name: Option<String>,
        description: Option<String>,
        amount: bigdecimal::BigDecimal,
        operation_type: String,
        frequency: String,
        start_date: chrono::NaiveDate,
        end_date: Option<chrono::NaiveDate>,
        is_active: bool,
        creation_date: Option<chrono::NaiveDateTime>,
        last_generated: Option<chrono::NaiveDate>,
    }
    
    let rows = sqlx::query_as::<_, RecurringOpRow>(
        "SELECT 
            ro.id, 
            ro.asset_id, 
            a.name as asset_name,
            ro.category_id, 
            c.name as category_name,
            ro.description, 
            ro.amount, 
            ro.operation_type::text as operation_type, 
            ro.frequency::text as frequency, 
            ro.start_date, 
            ro.end_date, 
            ro.is_active, 
            ro.creation_date, 
            ro.last_generated
         FROM recurring_operations ro
         INNER JOIN assets a ON ro.asset_id = a.id
         LEFT JOIN categories c ON ro.category_id = c.id
         WHERE ro.is_active = TRUE
         ORDER BY ro.start_date DESC"
    ).fetch_all(&state.pool).await.map_err(db_err)?;
    
    let result: Vec<RecurringOperationWithDetails> = rows.into_iter().map(|row| {
        RecurringOperationWithDetails {
            id: row.id,
            asset_id: row.asset_id,
            asset_name: row.asset_name,
            category_id: row.category_id,
            category_name: row.category_name,
            description: row.description,
            amount: row.amount,
            operation_type: row.operation_type,
            frequency: row.frequency,
            start_date: row.start_date,
            end_date: row.end_date,
            is_active: row.is_active,
            creation_date: row.creation_date,
            last_generated: row.last_generated,
        }
    }).collect();
    
    Ok(Json(result))
}

pub async fn get_recurring_operation(State(state): State<AppState>, Path(id): Path<i32>) -> Result<Json<RecurringOperation>, (axum::http::StatusCode, String)> {
    let row = sqlx::query_as::<_, RecurringOperation>(
        "SELECT id, asset_id, category_id, description, amount, operation_type::text, frequency::text, start_date, end_date, is_active, creation_date, last_generated
         FROM recurring_operations
         WHERE id = $1"
    ).bind(id).fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(row))
}

pub async fn update_recurring_operation(
    State(state): State<AppState>,
    Path(id): Path<i32>,
    Json(payload): Json<UpdateRecurringOperation>,
) -> Result<Json<RecurringOperation>, (axum::http::StatusCode, String)> {
    let end_date = if let Some(ed) = payload.end_date {
        Some(chrono::NaiveDate::parse_from_str(&ed, "%Y-%m-%d")
            .map_err(|_| (axum::http::StatusCode::BAD_REQUEST, "Invalid end_date format".to_string()))?)
    } else {
        None
    };

    let recurring_op = sqlx::query_as::<_, RecurringOperation>(
        "UPDATE recurring_operations 
         SET description = COALESCE($1, description),
             amount = COALESCE($2, amount),
             category_id = COALESCE($3, category_id),
             end_date = COALESCE($4, end_date),
             is_active = COALESCE($5, is_active)
         WHERE id = $6
         RETURNING id, asset_id, category_id, description, amount, operation_type::text, frequency::text, start_date, end_date, is_active, creation_date, last_generated"
    )
    .bind(&payload.description)
    .bind(payload.amount)
    .bind(payload.category_id)
    .bind(end_date)
    .bind(payload.is_active)
    .bind(id)
    .fetch_one(&state.pool)
    .await
    .map_err(db_err)?;

    Ok(Json(recurring_op))
}

pub async fn delete_recurring_operation(State(state): State<AppState>, Path(id): Path<i32>) -> Result<(), (axum::http::StatusCode, String)> {
    sqlx::query("DELETE FROM recurring_operations WHERE id = $1").bind(id).execute(&state.pool).await.map_err(db_err)?;
    Ok(())
}
