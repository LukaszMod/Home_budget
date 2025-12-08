use axum::{extract::{State, Path}, Json};
use crate::{AppState, models::*};
use serde_json::json;
use bigdecimal::{BigDecimal, FromPrimitive};


// USERS
pub async fn create_user(
    State(state): State<AppState>,
    Json(payload): Json<CreateUser>,
) -> Result<Json<User>, (axum::http::StatusCode, String)> {
    let user = sqlx::query_as::<_, User>(
        "INSERT INTO users (full_name, nick) VALUES ($1, $2) RETURNING id, full_name, nick, creation_date"
    )
    .bind(&payload.full_name)
    .bind(&payload.nick)
    .fetch_one(&state.pool)
    .await
    .map_err(db_err)?;
    Ok(Json(user))
}

pub async fn list_users(State(state): State<AppState>) -> Result<Json<Vec<User>>, (axum::http::StatusCode, String)> {
    let rows = sqlx::query_as::<_, User>(
        "SELECT id, full_name, nick, creation_date FROM users ORDER BY id"
    ).fetch_all(&state.pool).await.map_err(db_err)?;
    Ok(Json(rows))
}

pub async fn get_user(State(state): State<AppState>, Path(id): Path<i32>) -> Result<Json<User>, (axum::http::StatusCode, String)> {
    let user = sqlx::query_as::<_, User>(
        "SELECT id, full_name, nick, creation_date FROM users WHERE id = $1"
    ).bind(id).fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(user))
}

pub async fn update_user(State(state): State<AppState>, Path(id): Path<i32>, Json(payload): Json<CreateUser>) -> Result<Json<User>, (axum::http::StatusCode, String)> {
    let user = sqlx::query_as::<_, User>(
        "UPDATE users SET full_name = $1, nick = $2 WHERE id = $3
         RETURNING id, full_name, nick, creation_date"
    ).bind(&payload.full_name).bind(&payload.nick).bind(id).fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(user))
}

pub async fn delete_user(State(state): State<AppState>, Path(id): Path<i32>) -> Result<(), (axum::http::StatusCode, String)> {
    sqlx::query("DELETE FROM users WHERE id = $1").bind(id).execute(&state.pool).await.map_err(db_err)?;
    Ok(())
}

// CATEGORIES
pub async fn create_category(State(state): State<AppState>, Json(payload): Json<CreateCategory>) -> Result<Json<Category>, (axum::http::StatusCode, String)> {
    let cat = sqlx::query_as::<_, Category>(
        "INSERT INTO categories (name, parent_id, type) VALUES ($1, $2, $3::category_type)
         RETURNING id, name, parent_id, type::text"
    ).bind(&payload.name).bind(&payload.parent_id).bind(&payload.r#type)
     .fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(cat))
}

pub async fn list_categories(State(state): State<AppState>) -> Result<Json<Vec<Category>>, (axum::http::StatusCode, String)> {
    let rows = sqlx::query_as::<_, Category>(
        "SELECT id, name, parent_id, type::text FROM categories ORDER BY parent_id NULLS FIRST, id"
    ).fetch_all(&state.pool).await.map_err(db_err)?;
    Ok(Json(rows))
}

pub async fn get_category(State(state): State<AppState>, Path(id): Path<i32>) -> Result<Json<Category>, (axum::http::StatusCode, String)> {
    let row = sqlx::query_as::<_, Category>(
        "SELECT id, name, parent_id, type::text FROM categories WHERE id = $1"
    ).bind(id).fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(row))
}

pub async fn update_category(State(state): State<AppState>, Path(id): Path<i32>, Json(payload): Json<CreateCategory>) -> Result<Json<Category>, (axum::http::StatusCode, String)> {
    let row = sqlx::query_as::<_, Category>(
        "UPDATE categories SET name = $1, parent_id = $2, type = $3::category_type WHERE id = $4
         RETURNING id, name, parent_id, type::text"
    ).bind(&payload.name).bind(&payload.parent_id).bind(&payload.r#type).bind(id)
     .fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(row))
}

pub async fn delete_category(State(state): State<AppState>, Path(id): Path<i32>) -> Result<(), (axum::http::StatusCode, String)> {
    sqlx::query("DELETE FROM categories WHERE id = $1").bind(id).execute(&state.pool).await.map_err(db_err)?;
    Ok(())
}

// ACCOUNTS
pub async fn create_account(State(state): State<AppState>, Json(payload): Json<CreateAccount>) -> Result<Json<Account>, (axum::http::StatusCode, String)> {
    let acc = sqlx::query_as::<_, Account>(
        "INSERT INTO accounts (user_id, name, account_number) VALUES ($1, $2, $3)
         RETURNING id, user_id, name, account_number, is_closed"
    ).bind(payload.user_id).bind(&payload.name).bind(&payload.account_number).fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(acc))
}

pub async fn list_accounts(State(state): State<AppState>) -> Result<Json<Vec<Account>>, (axum::http::StatusCode, String)> {
    let rows = sqlx::query_as::<_, Account>(
        "SELECT id, user_id, name, account_number, is_closed FROM accounts ORDER BY id"
    ).fetch_all(&state.pool).await.map_err(db_err)?;
    Ok(Json(rows))
}

pub async fn get_account(State(state): State<AppState>, Path(id): Path<i32>) -> Result<Json<Account>, (axum::http::StatusCode, String)> {
    let acc = sqlx::query_as::<_, Account>(
        "SELECT id, user_id, name, account_number, is_closed FROM accounts WHERE id = $1"
    ).bind(id).fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(acc))
}

pub async fn update_account(State(state): State<AppState>, Path(id): Path<i32>, Json(payload): Json<CreateAccount>) -> Result<Json<Account>, (axum::http::StatusCode, String)> {
    let acc = sqlx::query_as::<_, Account>(
        "UPDATE accounts SET user_id = $1, name = $2, account_number = $3 WHERE id = $4
         RETURNING id, user_id, name, account_number, is_closed"
    ).bind(payload.user_id).bind(&payload.name).bind(&payload.account_number).bind(id).fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(acc))
}

pub async fn delete_account(State(state): State<AppState>, Path(id): Path<i32>) -> Result<(), (axum::http::StatusCode, String)> {
    sqlx::query("DELETE FROM accounts WHERE id = $1").bind(id).execute(&state.pool).await.map_err(db_err)?;
    Ok(())
}

pub async fn toggle_account_closed(State(state): State<AppState>, Path(id): Path<i32>) -> Result<Json<Account>, (axum::http::StatusCode, String)> {
    let acc = sqlx::query_as::<_, Account>(
        "UPDATE accounts SET is_closed = NOT is_closed WHERE id = $1
         RETURNING id, user_id, name, account_number, is_closed"
    ).bind(id).fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(acc))
}

// OPERATIONS
pub async fn create_operation(State(state): State<AppState>, Json(payload): Json<CreateOperation>) -> Result<Json<OperationWithHashtags>, (axum::http::StatusCode, String)> {
    let op = sqlx::query_as::<_, Operation>(
        "INSERT INTO operations (category_id, description, asset_id, amount, operation_type, operation_date)
         VALUES ($1, $2, $3, $4, $5::operation_type, $6::date)
         RETURNING id, creation_date, category_id, description, asset_id, amount, operation_type::text, operation_date"
    ).bind(payload.category_id)
     .bind(&payload.description)
     .bind(payload.asset_id)
     .bind(payload.amount)
     .bind(&payload.operation_type)
     .bind(&payload.operation_date)
     .fetch_one(&state.pool).await.map_err(db_err)?;
    
    // Extract and link hashtags from description
    let mut hashtags = Vec::new();
    if let Some(desc) = &payload.description {
        let extracted_hashtags = extract_hashtags(desc);
        for hashtag in extracted_hashtags {
            // Get or create hashtag
            let hashtag_id: (i32,) = sqlx::query_as(
                "INSERT INTO hashtags (name) VALUES ($1)
                 ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
                 RETURNING id"
            )
            .bind(&hashtag)
            .fetch_one(&state.pool)
            .await
            .map_err(db_err)?;
            
            // Link operation and hashtag
            sqlx::query("INSERT INTO operation_hashtags (operation_id, hashtag_id) VALUES ($1, $2)")
                .bind(op.id)
                .bind(hashtag_id.0)
                .execute(&state.pool)
                .await
                .map_err(db_err)?;
            
            // Fetch the hashtag record
            if let Ok(tag) = sqlx::query_as::<_, Hashtag>(
                "SELECT id, name, created_date FROM hashtags WHERE id = $1"
            ).bind(hashtag_id.0).fetch_one(&state.pool).await {
                hashtags.push(tag);
            }
        }
    }
    
    Ok(Json(OperationWithHashtags {
        id: op.id,
        creation_date: op.creation_date,
        category_id: op.category_id,
        description: op.description,
        asset_id: op.asset_id,
        amount: op.amount,
        operation_type: op.operation_type,
        operation_date: op.operation_date,
        hashtags,
    }))
}

// Helper function to extract hashtags from text
fn extract_hashtags(text: &str) -> Vec<String> {
    let mut hashtags: Vec<String> = Vec::new();
    let words: Vec<&str> = text.split_whitespace().collect();
    
    for word in words {
        if word.starts_with('#') {
            let hashtag = word.trim_start_matches('#')
                .chars()
                .filter(|c| c.is_alphanumeric() || *c == '_')
                .collect::<String>()
                .to_lowercase();
            
            if !hashtag.is_empty() && !hashtags.contains(&hashtag) {
                hashtags.push(hashtag);
            }
        }
    }
    
    hashtags
}

pub async fn list_operations(State(state): State<AppState>) -> Result<Json<Vec<OperationWithHashtags>>, (axum::http::StatusCode, String)> {
    let rows = sqlx::query_as::<_, Operation>(
        "SELECT id, creation_date, category_id, description, asset_id, amount, operation_type::text, operation_date
         FROM operations ORDER BY operation_date DESC, id"
    ).fetch_all(&state.pool).await.map_err(db_err)?;
    
    let mut result = Vec::new();
    for op in rows {
        let hashtags = get_operation_hashtags(&state.pool, op.id).await.map_err(|_| db_err("Failed to fetch hashtags"))?;
        result.push(OperationWithHashtags {
            id: op.id,
            creation_date: op.creation_date,
            category_id: op.category_id,
            description: op.description,
            asset_id: op.asset_id,
            amount: op.amount,
            operation_type: op.operation_type,
            operation_date: op.operation_date,
            hashtags,
        });
    }
    Ok(Json(result))
}

pub async fn get_operation(State(state): State<AppState>, Path(id): Path<i32>) -> Result<Json<OperationWithHashtags>, (axum::http::StatusCode, String)> {
    let op = sqlx::query_as::<_, Operation>(
        "SELECT id, creation_date, category_id, description, asset_id, amount, operation_type::text, operation_date
         FROM operations WHERE id = $1"
    ).bind(id).fetch_one(&state.pool).await.map_err(db_err)?;
    
    let hashtags = get_operation_hashtags(&state.pool, op.id).await.map_err(|_| db_err("Failed to fetch hashtags"))?;
    
    Ok(Json(OperationWithHashtags {
        id: op.id,
        creation_date: op.creation_date,
        category_id: op.category_id,
        description: op.description,
        asset_id: op.asset_id,
        amount: op.amount,
        operation_type: op.operation_type,
        operation_date: op.operation_date,
        hashtags,
    }))
}

pub async fn update_operation(State(state): State<AppState>, Path(id): Path<i32>, Json(payload): Json<CreateOperation>) -> Result<Json<OperationWithHashtags>, (axum::http::StatusCode, String)> {
    let op = sqlx::query_as::<_, Operation>(
        "UPDATE operations
         SET category_id = $1, description = $2, asset_id = $3, amount = $4, operation_type = $5::operation_type, operation_date = $6::date
         WHERE id = $7
         RETURNING id, creation_date, category_id, description, asset_id, amount, operation_type::text, operation_date"
    ).bind(payload.category_id)
     .bind(&payload.description)
     .bind(payload.asset_id)
     .bind(payload.amount)
     .bind(&payload.operation_type)
     .bind(&payload.operation_date)
     .bind(id)
     .fetch_one(&state.pool).await.map_err(db_err)?;
    
    // Delete old hashtag associations
    sqlx::query("DELETE FROM operation_hashtags WHERE operation_id = $1").bind(id).execute(&state.pool).await.map_err(db_err)?;
    
    // Extract and link hashtags from description
    let mut hashtags = Vec::new();
    if let Some(desc) = &payload.description {
        let extracted_hashtags = extract_hashtags(desc);
        for hashtag in extracted_hashtags {
            // Get or create hashtag
            let hashtag_id: (i32,) = sqlx::query_as(
                "INSERT INTO hashtags (name) VALUES ($1)
                 ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
                 RETURNING id"
            )
            .bind(&hashtag)
            .fetch_one(&state.pool)
            .await
            .map_err(db_err)?;
            
            // Link operation and hashtag
            sqlx::query("INSERT INTO operation_hashtags (operation_id, hashtag_id) VALUES ($1, $2)")
                .bind(op.id)
                .bind(hashtag_id.0)
                .execute(&state.pool)
                .await
                .map_err(db_err)?;
            
            // Fetch the hashtag record
            if let Ok(tag) = sqlx::query_as::<_, Hashtag>(
                "SELECT id, name, created_date FROM hashtags WHERE id = $1"
            ).bind(hashtag_id.0).fetch_one(&state.pool).await {
                hashtags.push(tag);
            }
        }
    }
    
    Ok(Json(OperationWithHashtags {
        id: op.id,
        creation_date: op.creation_date,
        category_id: op.category_id,
        description: op.description,
        asset_id: op.asset_id,
        amount: op.amount,
        operation_type: op.operation_type,
        operation_date: op.operation_date,
        hashtags,
    }))
}

pub async fn delete_operation(State(state): State<AppState>, Path(id): Path<i32>) -> Result<(), (axum::http::StatusCode, String)> {
    sqlx::query("DELETE FROM operations WHERE id = $1").bind(id).execute(&state.pool).await.map_err(db_err)?;
    Ok(())
}

// BUDGETS
pub async fn create_budget(State(state): State<AppState>, Json(payload): Json<CreateBudget>) -> Result<Json<Budget>, (axum::http::StatusCode, String)> {
    let row = sqlx::query_as::<_, Budget>(
        "INSERT INTO budgets (asset_id, category_id, month, planned_amount)
         VALUES ($1, $2, $3, $4)
         RETURNING id, asset_id, category_id, month, planned_amount"
    ).bind(payload.asset_id).bind(payload.category_id).bind(payload.month).bind(payload.planned_amount)
     .fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(row))
}

pub async fn list_budgets(State(state): State<AppState>) -> Result<Json<Vec<Budget>>, (axum::http::StatusCode, String)> {
    let rows = sqlx::query_as::<_, Budget>(
        "SELECT id, asset_id, category_id, month, planned_amount FROM budgets ORDER BY month DESC, id"
    ).fetch_all(&state.pool).await.map_err(db_err)?;
    Ok(Json(rows))
}

pub async fn get_budget(State(state): State<AppState>, Path(id): Path<i32>) -> Result<Json<Budget>, (axum::http::StatusCode, String)> {
    let row = sqlx::query_as::<_, Budget>(
        "SELECT id, asset_id, category_id, month, planned_amount FROM budgets WHERE id = $1"
    ).bind(id).fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(row))
}

pub async fn update_budget(State(state): State<AppState>, Path(id): Path<i32>, Json(payload): Json<CreateBudget>) -> Result<Json<Budget>, (axum::http::StatusCode, String)> {
    let row = sqlx::query_as::<_, Budget>(
        "UPDATE budgets SET asset_id = $1, category_id = $2, month = $3, planned_amount = $4
         WHERE id = $5
         RETURNING id, asset_id, category_id, month, planned_amount"
    ).bind(payload.asset_id).bind(payload.category_id).bind(payload.month).bind(payload.planned_amount).bind(id)
     .fetch_one(&state.pool).await.map_err(db_err)?;
    Ok(Json(row))
}

pub async fn delete_budget(State(state): State<AppState>, Path(id): Path<i32>) -> Result<(), (axum::http::StatusCode, String)> {
    sqlx::query("DELETE FROM budgets WHERE id = $1").bind(id).execute(&state.pool).await.map_err(db_err)?;
    Ok(())
}

// GOALS
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

// HASHTAGS
// Validation: hashtag can only contain alphanumeric and underscore characters
fn is_valid_hashtag(name: &str) -> bool {
    !name.is_empty() && name.len() <= 50 && name.chars().all(|c| c.is_alphanumeric() || c == '_')
}

pub async fn get_hashtags(State(state): State<AppState>) -> Result<Json<Vec<Hashtag>>, (axum::http::StatusCode, String)> {
    let rows = sqlx::query_as::<_, Hashtag>(
        "SELECT id, name, created_date FROM hashtags ORDER BY name"
    ).fetch_all(&state.pool).await.map_err(db_err)?;
    Ok(Json(rows))
}

pub async fn create_hashtag(State(state): State<AppState>, Json(payload): Json<CreateHashtag>) -> Result<Json<Hashtag>, (axum::http::StatusCode, String)> {
    // Validate hashtag format
    if !is_valid_hashtag(&payload.name) {
        return Err((axum::http::StatusCode::BAD_REQUEST, 
            "Hashtag can only contain alphanumeric characters and underscore, max 50 chars".to_string()));
    }

    let name_lower = payload.name.to_lowercase();
    
    let hashtag = sqlx::query_as::<_, Hashtag>(
        "INSERT INTO hashtags (name) VALUES ($1)
         ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
         RETURNING id, name, created_date"
    )
    .bind(&name_lower)
    .fetch_one(&state.pool)
    .await
    .map_err(db_err)?;
    
    Ok(Json(hashtag))
}

pub async fn delete_hashtag(State(state): State<AppState>, Path(id): Path<i32>) -> Result<(), (axum::http::StatusCode, String)> {
    // Check if hashtag is used in any operations
    let count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM operation_hashtags WHERE hashtag_id = $1")
        .bind(id)
        .fetch_one(&state.pool)
        .await
        .map_err(db_err)?;
    
    if count.0 > 0 {
        return Err((axum::http::StatusCode::CONFLICT, 
            "Cannot delete hashtag that is used in operations".to_string()));
    }
    
    sqlx::query("DELETE FROM hashtags WHERE id = $1").bind(id).execute(&state.pool).await.map_err(db_err)?;
    Ok(())
}

pub async fn extract_hashtags_from_text(State(state): State<AppState>, Json(payload): Json<serde_json::Value>) -> Result<Json<Vec<String>>, (axum::http::StatusCode, String)> {
    let text = payload.get("text")
        .and_then(|v| v.as_str())
        .ok_or((axum::http::StatusCode::BAD_REQUEST, "Missing 'text' field".to_string()))?;
    
    // Extract hashtags from text (words starting with #)
    let hashtags = extract_hashtags(text);
    
    Ok(Json(hashtags))
}

// RECURRING OPERATIONS
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
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
         RETURNING id, asset_id, category_id, description, amount, operation_type, frequency, start_date, end_date, is_active, creation_date, last_generated"
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

pub async fn list_recurring_operations(State(state): State<AppState>) -> Result<Json<Vec<RecurringOperation>>, (axum::http::StatusCode, String)> {
    let rows = sqlx::query_as::<_, RecurringOperation>(
        "SELECT id, asset_id, category_id, description, amount, operation_type, frequency, start_date, end_date, is_active, creation_date, last_generated
         FROM recurring_operations
         WHERE is_active = TRUE
         ORDER BY start_date DESC"
    ).fetch_all(&state.pool).await.map_err(db_err)?;
    Ok(Json(rows))
}

pub async fn get_recurring_operation(State(state): State<AppState>, Path(id): Path<i32>) -> Result<Json<RecurringOperation>, (axum::http::StatusCode, String)> {
    let row = sqlx::query_as::<_, RecurringOperation>(
        "SELECT id, asset_id, category_id, description, amount, operation_type, frequency, start_date, end_date, is_active, creation_date, last_generated
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
         RETURNING id, asset_id, category_id, description, amount, operation_type, frequency, start_date, end_date, is_active, creation_date, last_generated"
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

// TRANSFER OPERATIONS
pub async fn transfer_operation(
    State(state): State<AppState>,
    Json(payload): Json<TransferRequest>,
) -> Result<Json<TransferResponse>, (axum::http::StatusCode, String)> {
    // Parse operation date
    let operation_date = chrono::NaiveDate::parse_from_str(&payload.operation_date, "%Y-%m-%d")
        .map_err(|e| (axum::http::StatusCode::BAD_REQUEST, format!("Invalid date format: {}", e)))?;

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

            // Create outgoing operation
            let from_op = sqlx::query_as::<_, Operation>(
                "INSERT INTO operations (category_id, description, asset_id, amount, operation_type, operation_date)
                 VALUES ($1, $2, $3, $4, $5::operation_type, $6::date)
                 RETURNING id, creation_date, category_id, description, asset_id, amount, operation_type::text, operation_date"
            )
            .bind(None::<i32>)
            .bind(payload.description.as_ref().unwrap_or(&format!("Przelew do aktywa #{}", to_asset_id)))
            .bind(payload.from_asset_id)
            .bind(-payload.amount)
            .bind("expense")
            .bind(&payload.operation_date)
            .fetch_one(&mut *tx)
            .await
            .map_err(|e| (axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("Error creating from_op: {}", e)))?;

            response.from_operation_id = Some(from_op.id);

            // Create incoming operation
            let to_op = sqlx::query_as::<_, Operation>(
                "INSERT INTO operations (category_id, description, asset_id, amount, operation_type, operation_date)
                 VALUES ($1, $2, $3, $4, $5::operation_type, $6::date)
                 RETURNING id, creation_date, category_id, description, asset_id, amount, operation_type::text, operation_date"
            )
            .bind(None::<i32>)
            .bind(payload.description.as_ref().unwrap_or(&format!("Przelew z aktywa #{}", payload.from_asset_id)))
            .bind(to_asset_id)
            .bind(payload.amount)
            .bind("income")
            .bind(&payload.operation_date)
            .fetch_one(&mut *tx)
            .await
            .map_err(db_err)?;

            response.to_operation_id = Some(to_op.id);
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

                let price_per_unit = payload.amount / quantity;

                // Calculate new average price
                let quantity_bd = BigDecimal::from_f64(quantity).unwrap_or_else(|| BigDecimal::from(0));
                let price_per_unit_bd = BigDecimal::from_f64(price_per_unit).unwrap_or_else(|| BigDecimal::from(0));
                let old_quantity = existing_asset.quantity.clone().unwrap_or_else(|| BigDecimal::from(0));
                let old_avg_price = existing_asset.average_purchase_price.clone().unwrap_or_else(|| BigDecimal::from(0));
                let new_quantity = &old_quantity + &quantity_bd;
                let new_avg_price = ((&old_quantity * &old_avg_price) + (&quantity_bd * &price_per_unit_bd)) / &new_quantity;

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
                .bind(quantity)
                .bind(price_per_unit)
                .bind(payload.amount)
                .bind(&payload.operation_date)
                .fetch_one(&mut *tx)
                .await
                .map_err(db_err)?;

                response.investment_transaction_id = Some(inv_tx.id);

                // Create outgoing operation from source
                let from_op = sqlx::query_as::<_, Operation>(
                    "INSERT INTO operations (asset_id, amount, operation_type, operation_date, description)
                     VALUES ($1, $2, 'expense'::operation_type, $3::date, $4)
                     RETURNING id, creation_date, category_id, description, asset_id, amount, operation_type::text, operation_date"
                )
                .bind(payload.from_asset_id)
                .bind(-payload.amount)
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

                let price_per_unit = payload.amount / quantity;

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
                .bind(quantity)
                .bind(price_per_unit)
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
                .bind(quantity)
                .bind(price_per_unit)
                .bind(payload.amount)
                .bind(&payload.operation_date)
                .fetch_one(&mut *tx)
                .await
                .map_err(db_err)?;

                response.investment_transaction_id = Some(inv_tx.id);

                // Create outgoing operation from source
                let from_op = sqlx::query_as::<_, Operation>(
                    "INSERT INTO operations (asset_id, amount, operation_type, operation_date, description)
                     VALUES ($1, $2, 'expense'::operation_type, $3::date, $4)
                     RETURNING id, creation_date, category_id, description, asset_id, amount, operation_type::text, operation_date"
                )
                .bind(payload.from_asset_id)
                .bind(-payload.amount)
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
            .bind(payload.amount)
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
            .bind(payload.amount)
            .bind("Początkowa wycena przy zakupie")
            .execute(&mut *tx)
            .await
            .map_err(db_err)?;

            // Create outgoing operation from source
            let from_op = sqlx::query_as::<_, Operation>(
                "INSERT INTO operations (asset_id, amount, operation_type, operation_date, description)
                 VALUES ($1, $2, 'expense'::operation_type, $3::date, $4)
                 RETURNING id, creation_date, category_id, description, asset_id, amount, operation_type::text, operation_date"
            )
            .bind(payload.from_asset_id)
            .bind(-payload.amount)
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

            // Create outgoing operation from liquid asset
            let from_op = sqlx::query_as::<_, Operation>(
                "INSERT INTO operations (asset_id, amount, operation_type, operation_date, description)
                 VALUES ($1, $2, 'expense'::operation_type, $3::date, $4)
                 RETURNING id, creation_date, category_id, description, asset_id, amount, operation_type::text, operation_date"
            )
            .bind(payload.from_asset_id)
            .bind(-payload.amount)
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
                 RETURNING id, creation_date, category_id, description, asset_id, amount, operation_type::text, operation_date"
            )
            .bind(to_asset_id)
            .bind(payload.amount)
            .bind(&payload.operation_date)
            .bind(payload.description.as_ref().unwrap_or(&format!("Spłata z aktywa #{}", payload.from_asset_id)))
            .fetch_one(&mut *tx)
            .await
            .map_err(db_err)?;

            response.to_operation_id = Some(to_op.id);
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

// BACKWARD COMPATIBILITY: /accounts endpoints that map to liquid assets
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

// Prosty wrapper błędów
fn db_err<E: std::fmt::Display>(e: E) -> (axum::http::StatusCode, String) {
    (axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("DB error: {}", e))
}

// Helper function to fetch hashtags for an operation
async fn get_operation_hashtags(pool: &sqlx::PgPool, operation_id: i32) -> Result<Vec<Hashtag>, String> {
    let hashtags = sqlx::query_as::<_, Hashtag>(
        "SELECT h.id, h.name, h.created_date
         FROM hashtags h
         INNER JOIN operation_hashtags oh ON h.id = oh.hashtag_id
         WHERE oh.operation_id = $1
         ORDER BY h.name"
    )
    .bind(operation_id)
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;
    Ok(hashtags)
}
