use axum::{extract::State, Json};
use crate::{AppState, models::*, utils::db_err};
use crate::handlers::categories::ensure_debt_categories;
use bigdecimal::{BigDecimal, FromPrimitive};

pub async fn transfer_operation(
    State(state): State<AppState>,
    Json(payload): Json<TransferRequest>,
) -> Result<Json<TransferResponse>, (axum::http::StatusCode, String)> {
    // Start transaction
    let mut tx = state.pool.begin().await.map_err(db_err)?;

    // Verify source asset exists
    let from_asset = sqlx::query_as::<_, Asset>(
        "SELECT id, user_id, asset_type_id, name, description, account_number, quantity, average_purchase_price, current_valuation, currency, is_active, created_date 
         FROM assets WHERE id = $1"
    )
    .bind(payload.from_asset_id)
    .fetch_one(&mut *tx)
    .await
    .map_err(|e| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("Error fetching from_asset: {}", e)))?;

    let mut response = TransferResponse {
        success: false,
        from_operation_id: None,
        to_operation_id: None,
        new_asset_id: None,
        investment_transaction_id: None,
        interest_operation_id: None,
    };

    match payload.transfer_type.as_str() {
        "liquid_to_liquid" => {
            // Verify destination asset exists
            let to_asset_id = payload.to_asset_id
                .ok_or_else(|| (axum::http::StatusCode::BAD_REQUEST, "to_asset_id required for liquid_to_liquid".to_string()))?;
            
            sqlx::query("SELECT id FROM assets WHERE id = $1")
                .bind(to_asset_id)
                .fetch_one(&mut *tx)
                .await
                .map_err(|_| (axum::http::StatusCode::NOT_FOUND, "Destination asset not found".to_string()))?;

            // Get Transfer category IDs
            let (outgoing_category_id, incoming_category_id): (Option<i32>, Option<i32>) = sqlx::query_as(
                "SELECT c_out.id, c_in.id 
                 FROM categories c_parent
                 LEFT JOIN categories c_out ON c_out.parent_id = c_parent.id AND c_out.name = 'Outgoing'
                 LEFT JOIN categories c_in ON c_in.parent_id = c_parent.id AND c_in.name = 'Incoming'
                 WHERE c_parent.name = 'Transfer' AND c_parent.parent_id IS NULL"
            )
            .fetch_optional(&mut *tx)
            .await
            .map_err(db_err)?
            .unwrap_or((None, None));

            // Create outgoing operation
            let from_op = sqlx::query_as::<_, Operation>(
                "INSERT INTO operations (category_id, description, asset_id, amount, operation_type, operation_date)
                 VALUES ($1, $2, $3, $4, $5::operation_type, $6::date)
                 RETURNING id, creation_date, category_id, description, asset_id, amount, operation_type::text, operation_date, parent_operation_id, is_split, linked_operation_id"
            )
            .bind(outgoing_category_id)
            .bind(payload.description.as_ref().unwrap_or(&format!("Przelew do aktywa #{}", to_asset_id)))
            .bind(payload.from_asset_id)
            .bind(-payload.amount.clone())
            .bind("expense")
            .bind(&payload.operation_date)
            .fetch_one(&mut *tx)
            .await
            .map_err(|e| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("Error creating from_op: {}", e)))?;

            response.from_operation_id = Some(from_op.id);

            // Create incoming operation with linked_operation_id pointing to outgoing
            let to_op = sqlx::query_as::<_, Operation>(
                "INSERT INTO operations (category_id, description, asset_id, amount, operation_type, operation_date, linked_operation_id)
                 VALUES ($1, $2, $3, $4, $5::operation_type, $6::date, $7)
                 RETURNING id, creation_date, category_id, description, asset_id, amount, operation_type::text, operation_date, parent_operation_id, is_split, linked_operation_id"
            )
            .bind(incoming_category_id)
            .bind(payload.description.as_ref().unwrap_or(&format!("Przelew z aktywa #{}", payload.from_asset_id)))
            .bind(to_asset_id)
            .bind(payload.amount.clone())
            .bind("income")
            .bind(&payload.operation_date)
            .bind(from_op.id)
            .fetch_one(&mut *tx)
            .await
            .map_err(db_err)?;

            response.to_operation_id = Some(to_op.id);

            // Update outgoing operation to link to incoming
            sqlx::query("UPDATE operations SET linked_operation_id = $1 WHERE id = $2")
                .bind(to_op.id)
                .bind(from_op.id)
                .execute(&mut *tx)
                .await
                .map_err(db_err)?;
        },

        "liquid_to_investment" => {
            // Check if we're adding to existing or creating new
            if let Some(to_asset_id) = payload.to_asset_id {
                // Adding to existing investment
                let existing_asset = sqlx::query_as::<_, Asset>(
                    "SELECT id, user_id, asset_type_id, name, description, account_number, quantity, average_purchase_price, current_valuation, currency, is_active, created_date 
                     FROM assets WHERE id = $1"
                )
                .bind(to_asset_id)
                .fetch_one(&mut *tx)
                .await
                .map_err(|_| (axum::http::StatusCode::NOT_FOUND, "Destination investment asset not found".to_string()))?;

                let quantity = payload.investment_quantity
                    .ok_or_else(|| (axum::http::StatusCode::BAD_REQUEST, "investment_quantity required".to_string()))?;

                let quantity_bd = BigDecimal::from_f64(quantity).unwrap_or_else(|| BigDecimal::from(0));
                let price_per_unit = payload.amount.clone() / quantity_bd.clone();

                // Calculate new average price
                let old_quantity = existing_asset.quantity.clone().unwrap_or_else(|| BigDecimal::from(0));
                let old_avg_price = existing_asset.average_purchase_price.clone().unwrap_or_else(|| BigDecimal::from(0));
                let new_quantity = &old_quantity + &quantity_bd;
                let new_avg_price = ((&old_quantity * &old_avg_price) + (&quantity_bd * &price_per_unit)) / &new_quantity;

                // Update asset
                sqlx::query(
                    "UPDATE assets SET quantity = $1, average_purchase_price = $2 WHERE id = $3"
                )
                .bind(new_quantity)
                .bind(new_avg_price)
                .bind(to_asset_id)
                .execute(&mut *tx)
                .await
                .map_err(db_err)?;

                // Create investment transaction
                let inv_tx = sqlx::query_as::<_, InvestmentTransaction>(
                    "INSERT INTO investment_transactions (asset_id, transaction_type, quantity, price_per_unit, total_value, transaction_date)
                     VALUES ($1, 'buy', $2, $3, $4, $5)
                     RETURNING id, asset_id, transaction_type, quantity, price_per_unit, total_value, transaction_date, notes, created_date"
                )
                .bind(to_asset_id)
                .bind(quantity_bd)
                .bind(price_per_unit)
                .bind(payload.amount.clone())
                .bind(&payload.operation_date)
                .fetch_one(&mut *tx)
                .await
                .map_err(db_err)?;

                response.investment_transaction_id = Some(inv_tx.id);

                // Create outgoing operation from source
                let from_op = sqlx::query_as::<_, Operation>(
                    "INSERT INTO operations (asset_id, amount, operation_type, operation_date, description)
                     VALUES ($1, $2, 'expense'::operation_type, $3::date, $4)
                     RETURNING id, creation_date, category_id, description, asset_id, amount, operation_type::text, operation_date, parent_operation_id, is_split, linked_operation_id"
                )
                .bind(payload.from_asset_id)
                .bind(-payload.amount.clone())
                .bind(&payload.operation_date)
                .bind(payload.description.as_ref().unwrap_or(&format!("Zakup inwestycji #{}", to_asset_id)))
                .fetch_one(&mut *tx)
                .await
                .map_err(db_err)?;

                response.from_operation_id = Some(from_op.id);

            } else {
                // Creating new investment asset
                let new_asset_data = payload.new_asset
                    .ok_or_else(|| (axum::http::StatusCode::BAD_REQUEST, "new_asset required when to_asset_id is null".to_string()))?;

                let quantity = payload.investment_quantity
                    .ok_or_else(|| (axum::http::StatusCode::BAD_REQUEST, "investment_quantity required".to_string()))?;

                let quantity_bd = BigDecimal::from_f64(quantity).unwrap_or_else(|| BigDecimal::from(0));
                let price_per_unit = payload.amount.clone() / quantity_bd.clone();

                // Create new asset
                let new_asset = sqlx::query_as::<_, Asset>(
                    "INSERT INTO assets (user_id, asset_type_id, name, description, account_number, quantity, average_purchase_price, currency)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                     RETURNING id, user_id, asset_type_id, name, description, account_number, quantity, average_purchase_price, current_valuation, currency, is_active, created_date"
                )
                .bind(from_asset.user_id)
                .bind(new_asset_data.asset_type_id)
                .bind(&new_asset_data.name)
                .bind(&new_asset_data.description)
                .bind(&new_asset_data.account_number)
                .bind(&quantity_bd)
                .bind(&price_per_unit)
                .bind(new_asset_data.currency.as_ref().unwrap_or(&"PLN".to_string()))
                .fetch_one(&mut *tx)
                .await
                .map_err(db_err)?;

                response.new_asset_id = Some(new_asset.id);

                // Create investment transaction
                let inv_tx = sqlx::query_as::<_, InvestmentTransaction>(
                    "INSERT INTO investment_transactions (asset_id, transaction_type, quantity, price_per_unit, total_value, transaction_date)
                     VALUES ($1, 'buy', $2, $3, $4, $5)
                     RETURNING id, asset_id, transaction_type, quantity, price_per_unit, total_value, transaction_date, notes, created_date"
                )
                .bind(new_asset.id)
                .bind(&quantity_bd)
                .bind(&price_per_unit)
                .bind(payload.amount.clone())
                .bind(&payload.operation_date)
                .fetch_one(&mut *tx)
                .await
                .map_err(db_err)?;

                response.investment_transaction_id = Some(inv_tx.id);

                // Create outgoing operation from source
                let from_op = sqlx::query_as::<_, Operation>(
                    "INSERT INTO operations (asset_id, amount, operation_type, operation_date, description)
                     VALUES ($1, $2, 'expense'::operation_type, $3::date, $4)
                     RETURNING id, creation_date, category_id, description, asset_id, amount, operation_type::text, operation_date, parent_operation_id, is_split, linked_operation_id"
                )
                .bind(payload.from_asset_id)
                .bind(-payload.amount.clone())
                .bind(&payload.operation_date)
                .bind(payload.description.as_ref().unwrap_or(&format!("Zakup inwestycji: {}", new_asset.name)))
                .fetch_one(&mut *tx)
                .await
                .map_err(db_err)?;

                response.from_operation_id = Some(from_op.id);
            }
        },

        "liquid_to_property" | "liquid_to_vehicle" | "liquid_to_valuable" => {
            // Creating new non-investment asset
            let new_asset_data = payload.new_asset
                .ok_or_else(|| (axum::http::StatusCode::BAD_REQUEST, "new_asset required for this transfer type".to_string()))?;

            // Create new asset with valuation
            let new_asset = sqlx::query_as::<_, Asset>(
                "INSERT INTO assets (user_id, asset_type_id, name, description, account_number, current_valuation, currency)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 RETURNING id, user_id, asset_type_id, name, description, account_number, quantity, average_purchase_price, current_valuation, currency, is_active, created_date"
            )
            .bind(from_asset.user_id)
            .bind(new_asset_data.asset_type_id)
            .bind(&new_asset_data.name)
            .bind(&new_asset_data.description)
            .bind(&new_asset_data.account_number)
            .bind(payload.amount.clone())
            .bind(new_asset_data.currency.as_ref().unwrap_or(&"PLN".to_string()))
            .fetch_one(&mut *tx)
            .await
            .map_err(db_err)?;

            response.new_asset_id = Some(new_asset.id);

            // Create initial valuation
            sqlx::query(
                "INSERT INTO asset_valuations (asset_id, valuation_date, value, notes)
                 VALUES ($1, $2, $3, $4)"
            )
            .bind(new_asset.id)
            .bind(&payload.operation_date)
            .bind(payload.amount.clone())
            .bind("Początkowa wycena przy zakupie")
            .execute(&mut *tx)
            .await
            .map_err(db_err)?;

            // Create outgoing operation from source
            let from_op = sqlx::query_as::<_, Operation>(
                "INSERT INTO operations (asset_id, amount, operation_type, operation_date, description)
                 VALUES ($1, $2, 'expense'::operation_type, $3::date, $4)
                 RETURNING id, creation_date, category_id, description, asset_id, amount, operation_type::text, operation_date, parent_operation_id, is_split, linked_operation_id"
            )
            .bind(payload.from_asset_id)
            .bind(-payload.amount.clone())
            .bind(&payload.operation_date)
            .bind(payload.description.as_ref().unwrap_or(&format!("Zakup: {}", new_asset.name)))
            .fetch_one(&mut *tx)
            .await
            .map_err(db_err)?;

            response.from_operation_id = Some(from_op.id);
        },

        "liquid_to_liability" => {
            // Payment towards liability (debt payment)
            let to_asset_id = payload.to_asset_id
                .ok_or_else(|| (axum::http::StatusCode::BAD_REQUEST, "to_asset_id required for liability payment".to_string()))?;
            
            sqlx::query("SELECT id FROM assets WHERE id = $1")
                .bind(to_asset_id)
                .fetch_one(&mut *tx)
                .await
                .map_err(|_| (axum::http::StatusCode::NOT_FOUND, "Liability asset not found".to_string()))?;

            // Ensure debt categories exist and get interest category ID
            let (_, interest_category_id) = ensure_debt_categories(&state.pool).await?;

            // Create outgoing operation from liquid asset
            let from_op = sqlx::query_as::<_, Operation>(
                "INSERT INTO operations (asset_id, amount, operation_type, operation_date, description)
                 VALUES ($1, $2, 'expense'::operation_type, $3::date, $4)
                 RETURNING id, creation_date, category_id, description, asset_id, amount, operation_type::text, operation_date, parent_operation_id, is_split, linked_operation_id"
            )
            .bind(payload.from_asset_id)
            .bind(-payload.amount.clone())
            .bind(&payload.operation_date)
            .bind(payload.description.as_ref().unwrap_or(&format!("Spłata zobowiązania #{}", to_asset_id)))
            .fetch_one(&mut *tx)
            .await
            .map_err(db_err)?;

            response.from_operation_id = Some(from_op.id);

            // Create operation reducing liability (positive amount = reduction)
            let to_op = sqlx::query_as::<_, Operation>(
                "INSERT INTO operations (asset_id, amount, operation_type, operation_date, description)
                 VALUES ($1, $2, 'income'::operation_type, $3::date, $4)
                 RETURNING id, creation_date, category_id, description, asset_id, amount, operation_type::text, operation_date, parent_operation_id, is_split, linked_operation_id"
            )
            .bind(to_asset_id)
            .bind(payload.amount.clone())
            .bind(&payload.operation_date)
            .bind(payload.description.as_ref().unwrap_or(&format!("Spłata z aktywa #{}", payload.from_asset_id)))
            .fetch_one(&mut *tx)
            .await
            .map_err(db_err)?;

            response.to_operation_id = Some(to_op.id);

            // If interest amount is provided, create separate interest operation
            if let Some(interest) = payload.interest_amount {
                if interest > 0.0 {
                    let interest_bd = BigDecimal::from_f64(interest)
                        .ok_or_else(|| (axum::http::StatusCode::BAD_REQUEST, "Invalid interest amount".to_string()))?;

                    let interest_op = sqlx::query_as::<_, Operation>(
                        "INSERT INTO operations (asset_id, amount, operation_type, operation_date, description, category_id)
                         VALUES ($1, $2, 'expense'::operation_type, $3::date, $4, $5)
                         RETURNING id, creation_date, category_id, description, asset_id, amount, operation_type::text, operation_date, parent_operation_id, is_split, linked_operation_id"
                    )
                    .bind(payload.from_asset_id)
                    .bind(-interest_bd)
                    .bind(&payload.operation_date)
                    .bind(format!("Odsetki - {}", payload.description.as_ref().unwrap_or(&format!("zobowiązanie #{}", to_asset_id))))
                    .bind(interest_category_id)
                    .fetch_one(&mut *tx)
                    .await
                    .map_err(db_err)?;

                    response.interest_operation_id = Some(interest_op.id);
                }
            }
        },

        _ => {
            return Err((axum::http::StatusCode::BAD_REQUEST, format!("Unknown transfer_type: {}", payload.transfer_type)));
        }
    }

    // Commit transaction
    tx.commit().await.map_err(db_err)?;

    response.success = true;
    Ok(Json(response))
}
