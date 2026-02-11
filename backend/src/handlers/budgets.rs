use crate::{AppState, models::*, utils::db_err};
use axum::{
    Json,
    extract::{Path, State},
};
use chrono::Datelike;

pub async fn create_budget(
    State(state): State<AppState>,
    Json(payload): Json<CreateBudget>,
) -> Result<Json<Budget>, (axum::http::StatusCode, String)> {
    let row = sqlx::query_as::<_, Budget>(
        "INSERT INTO budgets (category_id, month, planned_amount, description)
         VALUES ($1, $2, $3, $4)
         RETURNING id, category_id, month, planned_amount, description",
    )
    .bind(payload.category_id)
    .bind(payload.month)
    .bind(payload.planned_amount)
    .bind(payload.description)
    .fetch_one(&state.pool)
    .await
    .map_err(db_err)?;
    Ok(Json(row))
}

pub async fn list_budgets(
    State(state): State<AppState>,
) -> Result<Json<Vec<Budget>>, (axum::http::StatusCode, String)> {
    let rows = sqlx::query_as::<_, Budget>(
        "SELECT id, category_id, month, planned_amount, description FROM budgets ORDER BY month DESC, id"
    ).fetch_all(&state.pool).await.map_err(db_err)?;
    Ok(Json(rows))
}

pub async fn get_budget(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<Json<Budget>, (axum::http::StatusCode, String)> {
    let row = sqlx::query_as::<_, Budget>(
        "SELECT id, category_id, month, planned_amount, description FROM budgets WHERE id = $1",
    )
    .bind(id)
    .fetch_one(&state.pool)
    .await
    .map_err(db_err)?;
    Ok(Json(row))
}



// pub async fn update_budget(
//     State(state): State<AppState>,
//     Path(id): Path<i32>,
//     Json(payload): Json<CreateBudget>,
// ) -> Result<Json<Budget>, (axum::http::StatusCode, String)> {
//     let row = sqlx::query_as::<_, Budget>(
//         "UPDATE budgets SET category_id = $1, month = $2, planned_amount = $3, description = $4
//          WHERE id = $5
//          RETURNING id, category_id, month, planned_amount, description",
//     )
//     .bind(payload.category_id)
//     .bind(payload.month)
//     .bind(payload.planned_amount)
//     .bind(payload.description)
//     .bind(id)
//     .fetch_one(&state.pool)
//     .await
//     .map_err(db_err)?;
//     Ok(Json(row))
// }

pub async fn update_budgets(
    State(state): State<AppState>,
    Json(payload): Json<Vec<Budget>>,
) -> Result<Json<Vec<Budget>>, (axum::http::StatusCode, String)> {
    let mut updated = Vec::new();

    for item in payload {
        let row = sqlx::query_as::<_, Budget>(
            "UPDATE budgets
             SET category_id = $1,
                 month = $2,
                 planned_amount = $3,
                 description = $4
             WHERE id = $5
             RETURNING id, category_id, month, planned_amount, description"
        )
        .bind(item.category_id)
        .bind(item.month)
        .bind(item.planned_amount)
        .bind(item.description)
        .bind(item.id)
        .fetch_one(&state.pool)
        .await
        .map_err(db_err)?;

        updated.push(row);
    }

    Ok(Json(updated))
}



pub async fn delete_budget(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<(), (axum::http::StatusCode, String)> {
    sqlx::query("DELETE FROM budgets WHERE id = $1")
        .bind(id)
        .execute(&state.pool)
        .await
        .map_err(db_err)?;
    Ok(())
}

// Get budget data for a specific month with JOINed categories and spending in one query
pub async fn get_budget_data_for_month(
    State(state): State<AppState>,
    Path(month): Path<String>,
) -> Result<Json<BudgetDataResponse>, (axum::http::StatusCode, String)> {
    // Parse month (format: YYYY-MM)
    let month_date = chrono::NaiveDate::parse_from_str(&format!("{}-01", month), "%Y-%m-%d")
        .map_err(|_| {
            (
                axum::http::StatusCode::BAD_REQUEST,
                "Invalid month format, expected YYYY-MM".to_string(),
            )
        })?;

    // Get budgets with category info using JOIN
    #[derive(sqlx::FromRow)]
    struct BudgetRow {
        id: i32,
        category_id: i32,
        category_name: String,
        category_type: String,
        parent_id: Option<i32>,
        month: chrono::NaiveDate,
        planned_amount: bigdecimal::BigDecimal,
        description: Option<String>,
    }

    let budget_rows = sqlx::query_as::<_, BudgetRow>(
        "SELECT 
            b.id, 
            b.category_id, 
            c.name as category_name,
            c.type::text as category_type,
            c.parent_id,
            b.month, 
            b.planned_amount,
            b.description
         FROM budgets b
         INNER JOIN categories c ON b.category_id = c.id
         WHERE b.month >= $1 AND b.month < $1 + INTERVAL '1 month'
         ORDER BY b.id",
    )
    .bind(month_date)
    .fetch_all(&state.pool)
    .await
    .map_err(db_err)?;

    let budgets: Vec<BudgetWithCategory> = budget_rows
        .into_iter()
        .map(|row| BudgetWithCategory {
            id: row.id,
            category_id: row.category_id,
            category_name: row.category_name,
            category_type: row.category_type,
            parent_id: row.parent_id,
            month: row.month,
            planned_amount: row.planned_amount,
            description: row.description,
        })
        .collect();

    // Calculate spending per category for this month using aggregation
    let month_end = month_date + chrono::Duration::days(31); // Safe upper bound
    let month_end = chrono::NaiveDate::from_ymd_opt(month_end.year(), month_end.month(), 1)
        .unwrap_or(month_end);

    let spending_rows = sqlx::query!(
        "SELECT 
            category_id,
            SUM(ABS(amount)) as total_amount
         FROM operations
         WHERE category_id IS NOT NULL
           AND operation_date >= $1
           AND operation_date < $2
         GROUP BY category_id",
        month_date,
        month_end
    )
    .fetch_all(&state.pool)
    .await
    .map_err(db_err)?;

    let spending: Vec<CategorySpending> = spending_rows
        .into_iter()
        .filter_map(|row| {
            row.category_id.map(|cat_id| CategorySpending {
                category_id: cat_id,
                amount: row
                    .total_amount
                    .unwrap_or_else(|| bigdecimal::BigDecimal::from(0)),
            })
        })
        .collect();

    Ok(Json(BudgetDataResponse { budgets, spending }))
}
