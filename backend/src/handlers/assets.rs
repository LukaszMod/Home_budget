use axum::{extract::{State, Path}, Json};
use crate::{AppState, models::*};
use crate::handlers::categories::ensure_debt_categories;
use bigdecimal::{BigDecimal, FromPrimitive};

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
    
    // Check if this is a liability asset type
    let asset_type_category: String = sqlx::query_scalar(
        "SELECT category FROM asset_types WHERE id = $1"
    )
    .bind(payload.asset_type_id)
    .fetch_one(&state.pool)
    .await
    .map_err(db_err)?;
    
    // If creating a liability, ensure debt categories exist
    if asset_type_category == "liability" {
        ensure_debt_categories(&state.pool).await?;
    }
    
    let max_sort_order: Option<i32> = sqlx::query_scalar(
        "SELECT COALESCE(MAX(sort_order), 0) FROM assets"
    )
    .fetch_one(&state.pool)
    .await
    .map_err(db_err)?;
    
    let asset = sqlx::query_as::<_, Asset>(
        "INSERT INTO assets (user_id, asset_type_id, name, description, account_number, quantity, average_purchase_price, current_valuation, currency, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id, user_id, asset_type_id, name, description, account_number, quantity, average_purchase_price, current_valuation, currency, is_active, created_date, sort_order"
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
    .bind(max_sort_order.unwrap_or(0) + 1)
    .fetch_one(&state.pool)
    .await
    .map_err(db_err)?;
    
    // If initial balance is provided for liquid assets, create a balance correction operation
    if asset_type_category == "liquid" {
        if let Some(initial_balance) = payload.initial_balance {
            if initial_balance != 0.0 {
                let operation_type = if initial_balance > 0.0 { "income" } else { "expense" };
                sqlx::query(
                    "INSERT INTO operations (asset_id, amount, operation_type, operation_date, description)
                     VALUES ($1, $2, $3::operation_type, CURRENT_DATE, 'Correction')"
                )
                .bind(asset.id)
                .bind(initial_balance)
                .bind(operation_type)
                .execute(&state.pool)
                .await
                .map_err(db_err)?;
            }
        }
    }
    
    Ok(Json(asset))
}

pub async fn list_assets(State(state): State<AppState>) -> Result<Json<Vec<Asset>>, (axum::http::StatusCode, String)> {
    let rows = sqlx::query_as::<_, Asset>(
        "SELECT id, user_id, asset_type_id, name, description, account_number, quantity, average_purchase_price, current_valuation, currency, is_active, created_date, sort_order 
         FROM assets ORDER BY sort_order"
    ).fetch_all(&state.pool).await.map_err(db_err)?;
    Ok(Json(rows))
}

pub async fn get_asset(State(state): State<AppState>, Path(id): Path<i32>) -> Result<Json<Asset>, (axum::http::StatusCode, String)> {
    let asset = sqlx::query_as::<_, Asset>(
        "SELECT id, user_id, asset_type_id, name, description, account_number, quantity, average_purchase_price, current_valuation, currency, is_active, created_date, sort_order 
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
         RETURNING id, user_id, asset_type_id, name, description, account_number, quantity, average_purchase_price, current_valuation, currency, is_active, created_date, sort_order"
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

pub async fn reorder_assets(State(state): State<AppState>, Json(payload): Json<ReorderAssets>) -> Result<(), (axum::http::StatusCode, String)> {
    for item in payload.items {
        sqlx::query("UPDATE assets SET sort_order = $1 WHERE id = $2")
            .bind(item.sort_order)
            .bind(item.id)
            .execute(&state.pool)
            .await
            .map_err(db_err)?;
    }
    Ok(())
}

pub async fn toggle_asset_active(State(state): State<AppState>, Path(id): Path<i32>) -> Result<Json<Asset>, (axum::http::StatusCode, String)> {
    let asset = sqlx::query_as::<_, Asset>(
        "UPDATE assets SET is_active = NOT is_active WHERE id = $1
         RETURNING id, user_id, asset_type_id, name, description, account_number, quantity, average_purchase_price, current_valuation, currency, is_active, created_date, sort_order"
    ).bind(id).fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(asset))
}

pub async fn correct_balance(State(state): State<AppState>, Path(id): Path<i32>, Json(payload): Json<CorrectBalanceRequest>) -> Result<Json<Asset>, (axum::http::StatusCode, String)> {
    // Get asset and verify it's a liquid asset
    let _asset = sqlx::query_as::<_, Asset>(
        "SELECT a.id, a.user_id, a.asset_type_id, a.name, a.description, a.account_number, a.quantity, a.average_purchase_price, a.current_valuation, a.currency, a.is_active, a.created_date, a.sort_order 
         FROM assets a
         INNER JOIN asset_types at ON a.asset_type_id = at.id
         WHERE a.id = $1 AND at.category = 'liquid'"
    )
    .bind(id)
    .fetch_one(&state.pool)
    .await
    .map_err(|_| (axum::http::StatusCode::NOT_FOUND, "Asset not found or not a liquid asset".to_string()))?;

    // Get current balance
    let current_balance: Option<BigDecimal> = sqlx::query_scalar(
        "SELECT current_valuation FROM assets WHERE id = $1"
    )
    .bind(id)
    .fetch_one(&state.pool)
    .await
    .map_err(db_err)?;

    let current = current_balance.unwrap_or_else(|| BigDecimal::from_f64(0.0).unwrap());
    let target = BigDecimal::from_f64(payload.target_balance)
        .ok_or_else(|| (axum::http::StatusCode::BAD_REQUEST, "Invalid target balance".to_string()))?;

    // Calculate difference
    let difference = &target - &current;
    
    if difference != BigDecimal::from(0) {
        // Determine operation type and category
        let (operation_type, category_name) = if difference > BigDecimal::from(0) {
            ("income", "Positive")
        } else {
            ("expense", "Negative")
        };
        
        // Get category ID for Correction -> Positive/Negative
        let category_id: Option<i32> = sqlx::query_scalar(
            "SELECT c.id FROM categories c
             INNER JOIN categories p ON c.parent_id = p.id
             WHERE p.name = 'Correction' AND p.is_system = TRUE
             AND c.name = $1 AND c.is_system = TRUE"
        )
        .bind(category_name)
        .fetch_optional(&state.pool)
        .await
        .map_err(db_err)?;
        
        sqlx::query(
            "INSERT INTO operations (asset_id, amount, operation_type, operation_date, description, category_id)
             VALUES ($1, $2, $3::operation_type, CURRENT_DATE, 'Korekta salda', $4)"
        )
        .bind(id)
        .bind(difference)
        .bind(operation_type)
        .bind(category_id)
        .execute(&state.pool)
        .await
        .map_err(db_err)?;
    }

    // Return updated asset
    let updated_asset = sqlx::query_as::<_, Asset>(
        "SELECT id, user_id, asset_type_id, name, description, account_number, quantity, average_purchase_price, current_valuation, currency, is_active, created_date, sort_order 
         FROM assets WHERE id = $1"
    )
    .bind(id)
    .fetch_one(&state.pool)
    .await
    .map_err(db_err)?;

    Ok(Json(updated_asset))
}

// INVESTMENT TRANSACTIONS
pub async fn create_investment_transaction(State(state): State<AppState>, Json(payload): Json<CreateInvestmentTransaction>) -> Result<Json<InvestmentTransaction>, (axum::http::StatusCode, String)> {
    let txn = sqlx::query_as::<_, InvestmentTransaction>(
        "INSERT INTO investment_transactions (asset_id, transaction_type, quantity, price_per_unit, total_value, transaction_date, notes)
         VALUES ($1, $2, $3, $4, $5, $6::date, $7)
         RETURNING id, asset_id, transaction_type, quantity, price_per_unit, total_value, transaction_date, notes, created_date"
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
        "SELECT id, asset_id, transaction_type, quantity, price_per_unit, total_value, transaction_date, notes, created_date 
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
         RETURNING id, asset_id, valuation_date, value, notes, created_date"
    )
    .bind(payload.asset_id)
    .bind(&payload.valuation_date)
    .bind(&payload.value)
    .bind(&payload.notes)
    .fetch_one(&state.pool)
    .await
    .map_err(db_err)?;
    
    // Update current valuation in asset
    sqlx::query("UPDATE assets SET current_valuation = $1 WHERE id = $2")
        .bind(&payload.value)
        .bind(payload.asset_id)
        .execute(&state.pool)
        .await
        .map_err(db_err)?;
    
    Ok(Json(val))
}

pub async fn list_asset_valuations(State(state): State<AppState>, Path(asset_id): Path<i32>) -> Result<Json<Vec<AssetValuation>>, (axum::http::StatusCode, String)> {
    let rows = sqlx::query_as::<_, AssetValuation>(
        "SELECT id, asset_id, valuation_date, value, notes, created_date 
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
