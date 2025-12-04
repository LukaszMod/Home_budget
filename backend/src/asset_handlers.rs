use axum::{extract::{State, Path}, Json};
use crate::{AppState, models::*};

fn db_err<E: std::fmt::Display>(e: E) -> (axum::http::StatusCode, String) {
    (axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("DB error: {}", e))
}

// ASSET TYPES
pub async fn list_asset_types(State(state): State<AppState>) -> Result<Json<Vec<AssetType>>, (axum::http::StatusCode, String)> {
    let rows = sqlx::query_as::<_, AssetType>(
        "SELECT id, name, category, icon, allows_operations, created_date FROM asset_types ORDER BY id"
    ).fetch_all(&state.pool).await.map_err(db_err)?;
    Ok(Json(rows))
}

// ASSETS
pub async fn create_asset(State(state): State<AppState>, Json(payload): Json<CreateAsset>) -> Result<Json<Asset>, (axum::http::StatusCode, String)> {
    let currency = payload.currency.unwrap_or_else(|| "PLN".to_string());
    
    let asset = sqlx::query_as::<_, Asset>(
        "INSERT INTO assets (user_id, asset_type_id, name, description, account_number, quantity, average_purchase_price, current_valuation, currency)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, user_id, asset_type_id, name, description, account_number, quantity::float8, average_purchase_price::float8, current_valuation::float8, currency, is_active, created_date"
    )
    .bind(payload.user_id)
    .bind(payload.asset_type_id)
    .bind(&payload.name)
    .bind(&payload.description)
    .bind(&payload.account_number)
    .bind(payload.quantity)
    .bind(payload.average_purchase_price)
    .bind(payload.current_valuation)
    .bind(&currency)
    .fetch_one(&state.pool)
    .await
    .map_err(db_err)?;
    
    Ok(Json(asset))
}

pub async fn list_assets(State(state): State<AppState>) -> Result<Json<Vec<Asset>>, (axum::http::StatusCode, String)> {
    let rows = sqlx::query_as::<_, Asset>(
        "SELECT id, user_id, asset_type_id, name, description, account_number, quantity::float8, average_purchase_price::float8, current_valuation::float8, currency, is_active, created_date 
         FROM assets ORDER BY id"
    ).fetch_all(&state.pool).await.map_err(db_err)?;
    Ok(Json(rows))
}

pub async fn get_asset(State(state): State<AppState>, Path(id): Path<i32>) -> Result<Json<Asset>, (axum::http::StatusCode, String)> {
    let asset = sqlx::query_as::<_, Asset>(
        "SELECT id, user_id, asset_type_id, name, description, account_number, quantity::float8, average_purchase_price::float8, current_valuation::float8, currency, is_active, created_date 
         FROM assets WHERE id = $1"
    ).bind(id).fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(asset))
}

pub async fn update_asset(State(state): State<AppState>, Path(id): Path<i32>, Json(payload): Json<CreateAsset>) -> Result<Json<Asset>, (axum::http::StatusCode, String)> {
    let currency = payload.currency.unwrap_or_else(|| "PLN".to_string());
    
    let asset = sqlx::query_as::<_, Asset>(
        "UPDATE assets 
         SET user_id = $1, asset_type_id = $2, name = $3, description = $4, account_number = $5, 
             quantity = $6, average_purchase_price = $7, current_valuation = $8, currency = $9
         WHERE id = $10
         RETURNING id, user_id, asset_type_id, name, description, account_number, quantity::float8, average_purchase_price::float8, current_valuation::float8, currency, is_active, created_date"
    )
    .bind(payload.user_id)
    .bind(payload.asset_type_id)
    .bind(&payload.name)
    .bind(&payload.description)
    .bind(&payload.account_number)
    .bind(payload.quantity)
    .bind(payload.average_purchase_price)
    .bind(payload.current_valuation)
    .bind(&currency)
    .bind(id)
    .fetch_one(&state.pool)
    .await
    .map_err(db_err)?;
    
    Ok(Json(asset))
}

pub async fn delete_asset(State(state): State<AppState>, Path(id): Path<i32>) -> Result<(), (axum::http::StatusCode, String)> {
    sqlx::query("DELETE FROM assets WHERE id = $1").bind(id).execute(&state.pool).await.map_err(db_err)?;
    Ok(())
}

pub async fn toggle_asset_active(State(state): State<AppState>, Path(id): Path<i32>) -> Result<Json<Asset>, (axum::http::StatusCode, String)> {
    let asset = sqlx::query_as::<_, Asset>(
        "UPDATE assets SET is_active = NOT is_active WHERE id = $1
         RETURNING id, user_id, asset_type_id, name, description, account_number, quantity::float8, average_purchase_price::float8, current_valuation::float8, currency, is_active, created_date"
    ).bind(id).fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(asset))
}

// INVESTMENT TRANSACTIONS
pub async fn create_investment_transaction(State(state): State<AppState>, Json(payload): Json<CreateInvestmentTransaction>) -> Result<Json<InvestmentTransaction>, (axum::http::StatusCode, String)> {
    let txn = sqlx::query_as::<_, InvestmentTransaction>(
        "INSERT INTO investment_transactions (asset_id, transaction_type, quantity, price_per_unit, total_value, transaction_date, notes)
         VALUES ($1, $2, $3, $4, $5, $6::date, $7)
         RETURNING id, asset_id, transaction_type, quantity::float8, price_per_unit::float8, total_value::float8, transaction_date, notes, created_date"
    )
    .bind(payload.asset_id)
    .bind(&payload.transaction_type)
    .bind(payload.quantity)
    .bind(payload.price_per_unit)
    .bind(payload.total_value)
    .bind(&payload.transaction_date)
    .bind(&payload.notes)
    .fetch_one(&state.pool)
    .await
    .map_err(db_err)?;
    
    // Update asset quantity and average price for buy/sell transactions
    if payload.transaction_type == "buy" || payload.transaction_type == "sell" {
        let _ = update_asset_investment_stats(&state, payload.asset_id).await;
    }
    
    Ok(Json(txn))
}

pub async fn list_investment_transactions(State(state): State<AppState>, Path(asset_id): Path<i32>) -> Result<Json<Vec<InvestmentTransaction>>, (axum::http::StatusCode, String)> {
    let rows = sqlx::query_as::<_, InvestmentTransaction>(
        "SELECT id, asset_id, transaction_type, quantity::float8, price_per_unit::float8, total_value::float8, transaction_date, notes, created_date 
         FROM investment_transactions WHERE asset_id = $1 ORDER BY transaction_date DESC, id DESC"
    ).bind(asset_id).fetch_all(&state.pool).await.map_err(db_err)?;
    Ok(Json(rows))
}

pub async fn delete_investment_transaction(State(state): State<AppState>, Path(id): Path<i32>) -> Result<(), (axum::http::StatusCode, String)> {
    // Get asset_id before deleting
    let asset_id: (i32,) = sqlx::query_as("SELECT asset_id FROM investment_transactions WHERE id = $1")
        .bind(id)
        .fetch_one(&state.pool)
        .await
        .map_err(db_err)?;
    
    sqlx::query("DELETE FROM investment_transactions WHERE id = $1").bind(id).execute(&state.pool).await.map_err(db_err)?;
    
    // Recalculate asset stats
    let _ = update_asset_investment_stats(&state, asset_id.0).await;
    
    Ok(())
}

// ASSET VALUATIONS
pub async fn create_asset_valuation(State(state): State<AppState>, Json(payload): Json<CreateAssetValuation>) -> Result<Json<AssetValuation>, (axum::http::StatusCode, String)> {
    let val = sqlx::query_as::<_, AssetValuation>(
        "INSERT INTO asset_valuations (asset_id, valuation_date, value, notes)
         VALUES ($1, $2::date, $3, $4)
         RETURNING id, asset_id, valuation_date, value::float8, notes, created_date"
    )
    .bind(payload.asset_id)
    .bind(&payload.valuation_date)
    .bind(payload.value)
    .bind(&payload.notes)
    .fetch_one(&state.pool)
    .await
    .map_err(db_err)?;
    
    // Update current valuation in asset
    sqlx::query("UPDATE assets SET current_valuation = $1 WHERE id = $2")
        .bind(payload.value)
        .bind(payload.asset_id)
        .execute(&state.pool)
        .await
        .map_err(db_err)?;
    
    Ok(Json(val))
}

pub async fn list_asset_valuations(State(state): State<AppState>, Path(asset_id): Path<i32>) -> Result<Json<Vec<AssetValuation>>, (axum::http::StatusCode, String)> {
    let rows = sqlx::query_as::<_, AssetValuation>(
        "SELECT id, asset_id, valuation_date, value::float8, notes, created_date 
         FROM asset_valuations WHERE asset_id = $1 ORDER BY valuation_date DESC, id DESC"
    ).bind(asset_id).fetch_all(&state.pool).await.map_err(db_err)?;
    Ok(Json(rows))
}

pub async fn delete_asset_valuation(State(state): State<AppState>, Path(id): Path<i32>) -> Result<(), (axum::http::StatusCode, String)> {
    sqlx::query("DELETE FROM asset_valuations WHERE id = $1").bind(id).execute(&state.pool).await.map_err(db_err)?;
    Ok(())
}

// Helper function to recalculate investment statistics
async fn update_asset_investment_stats(state: &AppState, asset_id: i32) -> Result<(), String> {
    // Calculate total quantity and average purchase price
    let stats: Option<(Option<f64>, Option<f64>)> = sqlx::query_as(
        "SELECT 
            SUM(CASE WHEN transaction_type = 'buy' THEN quantity ELSE -quantity END) as total_quantity,
            SUM(CASE WHEN transaction_type = 'buy' THEN total_value ELSE 0 END) / NULLIF(SUM(CASE WHEN transaction_type = 'buy' THEN quantity ELSE 0 END), 0) as avg_price
         FROM investment_transactions 
         WHERE asset_id = $1 AND transaction_type IN ('buy', 'sell')"
    )
    .bind(asset_id)
    .fetch_optional(&state.pool)
    .await
    .map_err(|e| e.to_string())?;
    
    if let Some((quantity, avg_price)) = stats {
        sqlx::query("UPDATE assets SET quantity = $1, average_purchase_price = $2 WHERE id = $3")
            .bind(quantity)
            .bind(avg_price)
            .bind(asset_id)
            .execute(&state.pool)
            .await
            .map_err(|e| e.to_string())?;
    }
    
    Ok(())
}
