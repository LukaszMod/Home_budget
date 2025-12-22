use axum::{extract::{State, Path}, Json};
use crate::{AppState, models::*, utils::db_err};
use std::collections::HashMap;

pub async fn create_operation(State(state): State<AppState>, Json(payload): Json<CreateOperation>) -> Result<Json<OperationWithHashtags>, (axum::http::StatusCode, String)> {
    use std::str::FromStr;
    use bigdecimal::BigDecimal;
    
    // Check if this is a split operation
    if let Some(split_items) = &payload.split_items {
        // Validate minimum 2 items
        if split_items.len() < 2 {
            return Err((axum::http::StatusCode::BAD_REQUEST, "Split requires at least 2 items".to_string()));
        }
        
        // Validate sum
        let sum: BigDecimal = split_items.iter().map(|item| &item.amount).sum();
        let tolerance = BigDecimal::from_str("0.01").unwrap();
        let diff = (&payload.amount - &sum).abs();
        
        if diff > tolerance {
            return Err((axum::http::StatusCode::BAD_REQUEST, 
                format!("Sum of items ({}) does not match total amount ({})", sum, payload.amount)));
        }
        
        // Begin transaction
        let mut tx = state.pool.begin().await.map_err(db_err)?;
        
        // Create parent operation with is_split=true
        let parent = sqlx::query_as::<_, Operation>(
            "INSERT INTO operations (category_id, description, asset_id, amount, operation_type, operation_date, is_split)
             VALUES ($1, $2, $3, $4, $5::operation_type, $6::date, TRUE)
             RETURNING id, creation_date, category_id, description, asset_id, amount, operation_type::text, operation_date, parent_operation_id, is_split, linked_operation_id"
        ).bind(payload.category_id)
         .bind(&payload.description)
         .bind(payload.asset_id)
         .bind(&payload.amount)
         .bind(&payload.operation_type)
         .bind(&payload.operation_date)
         .fetch_one(&mut *tx).await.map_err(db_err)?;
        
        // Create child operations
        for item in split_items {
            sqlx::query(
                "INSERT INTO operations (category_id, description, asset_id, amount, operation_type, operation_date, parent_operation_id, is_split)
                 VALUES ($1, $2, $3, $4, $5::operation_type, $6::date, $7, FALSE)"
            )
            .bind(item.category_id)
            .bind(&item.description)
            .bind(payload.asset_id)
            .bind(&item.amount)
            .bind(&payload.operation_type)
            .bind(&payload.operation_date)
            .bind(parent.id)
            .execute(&mut *tx)
            .await
            .map_err(db_err)?;
            
            // Extract and link hashtags from child description
            if let Some(desc) = &item.description {
                let extracted_hashtags = extract_hashtags(desc);
                if !extracted_hashtags.is_empty() {
                    // Note: We can't use the helper here since we're in a transaction
                    // For simplicity, we'll skip hashtags in split items during creation
                    // They can be added via split dialog later
                }
            }
        }
        
        // Commit transaction BEFORE linking hashtags
        tx.commit().await.map_err(db_err)?;
        
        // Extract and link hashtags from parent description (after commit)
        let hashtags = if let Some(desc) = &payload.description {
            let extracted_hashtags = extract_hashtags(desc);
            if !extracted_hashtags.is_empty() {
                link_operation_hashtags(&state.pool, parent.id, &extracted_hashtags).await.map_err(|e| db_err(e))?
            } else {
                Vec::new()
            }
        } else {
            Vec::new()
        };
        
        return Ok(Json(OperationWithHashtags {
            id: parent.id,
            creation_date: parent.creation_date,
            category_id: parent.category_id,
            description: parent.description,
            asset_id: parent.asset_id,
            amount: parent.amount,
            operation_type: parent.operation_type,
            operation_date: parent.operation_date,
            parent_operation_id: parent.parent_operation_id,
            is_split: parent.is_split,
            linked_operation_id: parent.linked_operation_id,
            hashtags,
        }));
    }
    
    // Regular operation (not split)
    let op = sqlx::query_as::<_, Operation>(
        "INSERT INTO operations (category_id, description, asset_id, amount, operation_type, operation_date)
         VALUES ($1, $2, $3, $4, $5::operation_type, $6::date)
         RETURNING id, creation_date, category_id, description, asset_id, amount, operation_type::text, operation_date, parent_operation_id, is_split, linked_operation_id"
    ).bind(payload.category_id)
     .bind(&payload.description)
     .bind(payload.asset_id)
     .bind(payload.amount)
     .bind(&payload.operation_type)
     .bind(&payload.operation_date)
     .fetch_one(&state.pool).await.map_err(db_err)?;
    
    // Extract and link hashtags from description
    let hashtags = if let Some(desc) = &payload.description {
        let extracted_hashtags = extract_hashtags(desc);
        if !extracted_hashtags.is_empty() {
            link_operation_hashtags(&state.pool, op.id, &extracted_hashtags).await.map_err(|e| db_err(e))?
        } else {
            Vec::new()
        }
    } else {
        Vec::new()
    };
    
    Ok(Json(OperationWithHashtags {
        id: op.id,
        creation_date: op.creation_date,
        category_id: op.category_id,
        description: op.description,
        asset_id: op.asset_id,
        amount: op.amount,
        operation_type: op.operation_type,
        operation_date: op.operation_date,
        parent_operation_id: op.parent_operation_id,
        is_split: op.is_split,
        linked_operation_id: op.linked_operation_id,
        hashtags,
    }))
}

pub async fn list_operations(State(state): State<AppState>) -> Result<Json<Vec<OperationWithDetails>>, (axum::http::StatusCode, String)> {
    #[derive(sqlx::FromRow)]
    struct OperationRow {
        id: i32,
        creation_date: Option<chrono::NaiveDateTime>,
        category_id: Option<i32>,
        category_name: Option<String>,
        parent_category_name: Option<String>,
        description: Option<String>,
        asset_id: i32,
        asset_name: Option<String>,
        amount: bigdecimal::BigDecimal,
        operation_type: Option<String>,
        operation_date: chrono::NaiveDate,
        parent_operation_id: Option<i32>,
        is_split: bool,
        linked_operation_id: Option<i32>,
    }
    
    // Use JOIN to get asset, category and parent category names in one query
    // Filter: show only parent operations (is_split=true) OR operations without parent (parent_operation_id IS NULL)
    // This excludes child operations from the list
    let rows = sqlx::query_as::<_, OperationRow>(
        "SELECT 
            o.id, 
            o.creation_date, 
            o.category_id, 
            c.name as category_name,
            pc.name as parent_category_name,
            o.description, 
            o.asset_id, 
            a.name as asset_name,
            o.amount, 
            o.operation_type::text as operation_type,
            o.operation_date,
            o.parent_operation_id,
            o.is_split,
            o.linked_operation_id
         FROM operations o
         INNER JOIN assets a ON o.asset_id = a.id
         LEFT JOIN categories c ON o.category_id = c.id
         LEFT JOIN categories pc ON c.parent_id = pc.id
         WHERE o.parent_operation_id IS NULL
         ORDER BY o.operation_date DESC, o.id"
    ).fetch_all(&state.pool).await.map_err(db_err)?;
    
    if rows.is_empty() {
        return Ok(Json(Vec::new()));
    }
    
    // Batch fetch all hashtags for all operations
    let operation_ids: Vec<i32> = rows.iter().map(|op| op.id).collect();
    let all_hashtags = get_operations_hashtags_batch(&state.pool, &operation_ids).await.map_err(|e| db_err(e))?;
    
    let result: Vec<OperationWithDetails> = rows.into_iter().map(|op| {
        let hashtags = all_hashtags.get(&op.id).cloned().unwrap_or_default();
        OperationWithDetails {
            id: op.id,
            creation_date: op.creation_date,
            category_id: op.category_id,
            category_name: op.category_name,
            parent_category_name: op.parent_category_name,
            description: op.description,
            asset_id: op.asset_id,
            asset_name: op.asset_name,
            amount: op.amount,
            operation_type: op.operation_type.unwrap_or_else(|| "unknown".to_string()),
            operation_date: op.operation_date,
            parent_operation_id: op.parent_operation_id,
            is_split: op.is_split,
            linked_operation_id: op.linked_operation_id,
            hashtags,
        }
    }).collect();
    
    Ok(Json(result))
}

pub async fn get_operation(State(state): State<AppState>, Path(id): Path<i32>) -> Result<Json<OperationWithHashtags>, (axum::http::StatusCode, String)> {
    let op = sqlx::query_as::<_, Operation>(
        "SELECT id, creation_date, category_id, description, asset_id, amount, operation_type::text, operation_date, parent_operation_id, is_split, linked_operation_id
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
        parent_operation_id: op.parent_operation_id,
        is_split: op.is_split,
        linked_operation_id: op.linked_operation_id,
        hashtags,
    }))
}

pub async fn update_operation(State(state): State<AppState>, Path(id): Path<i32>, Json(payload): Json<CreateOperation>) -> Result<Json<OperationWithHashtags>, (axum::http::StatusCode, String)> {
    let op = sqlx::query_as::<_, Operation>(
        "UPDATE operations
         SET category_id = $1, description = $2, asset_id = $3, amount = $4, operation_type = $5::operation_type, operation_date = $6::date
         WHERE id = $7
         RETURNING id, creation_date, category_id, description, asset_id, amount, operation_type::text, operation_date, parent_operation_id, is_split, linked_operation_id"
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
    let hashtags = if let Some(desc) = &payload.description {
        let extracted_hashtags = extract_hashtags(desc);
        if !extracted_hashtags.is_empty() {
            link_operation_hashtags(&state.pool, op.id, &extracted_hashtags).await.map_err(|e| db_err(e))?
        } else {
            Vec::new()
        }
    } else {
        Vec::new()
    };
    
    Ok(Json(OperationWithHashtags {
        id: op.id,
        creation_date: op.creation_date,
        category_id: op.category_id,
        description: op.description,
        asset_id: op.asset_id,
        amount: op.amount,
        operation_type: op.operation_type,
        operation_date: op.operation_date,
        parent_operation_id: op.parent_operation_id,
        is_split: op.is_split,
        linked_operation_id: op.linked_operation_id,
        hashtags,
    }))
}

pub async fn delete_operation(State(state): State<AppState>, Path(id): Path<i32>) -> Result<(), (axum::http::StatusCode, String)> {
    sqlx::query("DELETE FROM operations WHERE id = $1").bind(id).execute(&state.pool).await.map_err(db_err)?;
    Ok(())
}

// Helper function to extract hashtags from text (public for use in hashtags module)
pub fn extract_hashtags(text: &str) -> Vec<String> {
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

// Helper function to fetch hashtags for multiple operations in one query (batch)
async fn get_operations_hashtags_batch(pool: &sqlx::PgPool, operation_ids: &[i32]) -> Result<HashMap<i32, Vec<Hashtag>>, String> {
    let rows = sqlx::query!(
        "SELECT oh.operation_id, h.id, h.name, h.created_date
         FROM hashtags h
         INNER JOIN operation_hashtags oh ON h.id = oh.hashtag_id
         WHERE oh.operation_id = ANY($1)
         ORDER BY oh.operation_id, h.name",
        operation_ids
    )
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;
    
    let mut map: HashMap<i32, Vec<Hashtag>> = HashMap::new();
    for row in rows {
        let hashtag = Hashtag {
            id: row.id,
            name: row.name,
            created_date: row.created_date,
            usage_count: 0, // Not relevant for operation hashtags
        };
        map.entry(row.operation_id).or_insert_with(Vec::new).push(hashtag);
    }
    
    Ok(map)
}

// Helper function to link hashtags to operation (batch insert)
async fn link_operation_hashtags(pool: &sqlx::PgPool, operation_id: i32, hashtag_names: &[String]) -> Result<Vec<Hashtag>, String> {
    if hashtag_names.is_empty() {
        return Ok(Vec::new());
    }
    
    // Batch insert/get hashtags using UNNEST
    let hashtag_ids: Vec<i32> = sqlx::query_scalar(
        "INSERT INTO hashtags (name)
         SELECT * FROM UNNEST($1::text[])
         ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
         RETURNING id"
    )
    .bind(hashtag_names)
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;
    
    // Batch insert operation_hashtags relationships
    if !hashtag_ids.is_empty() {
        let operation_ids = vec![operation_id; hashtag_ids.len()];
        sqlx::query(
            "INSERT INTO operation_hashtags (operation_id, hashtag_id)
             SELECT * FROM UNNEST($1::int[], $2::int[])
             ON CONFLICT DO NOTHING"
        )
        .bind(&operation_ids)
        .bind(&hashtag_ids)
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;
    }
    
    // Fetch all linked hashtags in one query
    let hashtags = sqlx::query_as::<_, Hashtag>(
        "SELECT id, name, created_date FROM hashtags WHERE id = ANY($1) ORDER BY name"
    )
    .bind(&hashtag_ids)
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;
    
    Ok(hashtags)
}

// Split operations - create child operations from parent
pub async fn split_operation(
    State(state): State<AppState>,
    Path(id): Path<i32>,
    Json(payload): Json<SplitOperationRequest>,
) -> Result<Json<Vec<OperationWithHashtags>>, (axum::http::StatusCode, String)> {
    use std::str::FromStr;
    
    // Validate: minimum 2 items
    if payload.items.len() < 2 {
        return Err((axum::http::StatusCode::BAD_REQUEST, "Split requires at least 2 items".to_string()));
    }
    
    // Get parent operation
    let parent = sqlx::query_as::<_, Operation>(
        "SELECT id, creation_date, category_id, description, asset_id, amount, operation_type::text, operation_date, parent_operation_id, is_split, linked_operation_id
         FROM operations WHERE id = $1"
    ).bind(id).fetch_optional(&state.pool).await.map_err(db_err)?;
    
    let parent = match parent {
        Some(p) => p,
        None => return Err((axum::http::StatusCode::NOT_FOUND, "Operation not found".to_string())),
    };
    
    // Validate: not already split
    if parent.is_split {
        return Err((axum::http::StatusCode::BAD_REQUEST, "Operation is already split".to_string()));
    }
    
    // Validate: sum of items equals parent amount
    let sum: bigdecimal::BigDecimal = payload.items.iter().map(|item| &item.amount).sum();
    let tolerance = bigdecimal::BigDecimal::from_str("0.01").unwrap();
    let diff = (&parent.amount - &sum).abs();
    
    if diff > tolerance {
        return Err((axum::http::StatusCode::BAD_REQUEST, 
            format!("Sum of items ({}) does not match parent amount ({})", sum, parent.amount)));
    }
    
    // Begin transaction
    let mut tx = state.pool.begin().await.map_err(db_err)?;
    
    // Mark parent as split
    sqlx::query("UPDATE operations SET is_split = TRUE WHERE id = $1")
        .bind(id)
        .execute(&mut *tx)
        .await
        .map_err(db_err)?;
    
    // Create child operations
    let mut children = Vec::new();
    for item in &payload.items {
        let child = sqlx::query_as::<_, Operation>(
            "INSERT INTO operations (category_id, description, asset_id, amount, operation_type, operation_date, parent_operation_id, is_split)
             VALUES ($1, $2, $3, $4, $5::operation_type, $6, $7, FALSE)
             RETURNING id, creation_date, category_id, description, asset_id, amount, operation_type::text, operation_date, parent_operation_id, is_split, linked_operation_id"
        )
        .bind(item.category_id)
        .bind(&item.description)
        .bind(parent.asset_id)
        .bind(&item.amount)
        .bind(&parent.operation_type)
        .bind(parent.operation_date)
        .bind(id)
        .fetch_one(&mut *tx)
        .await
        .map_err(db_err)?;
        
        // Extract and link hashtags from description if present
        let hashtags = if let Some(desc) = &item.description {
            let extracted_hashtags = extract_hashtags(desc);
            if !extracted_hashtags.is_empty() {
                link_operation_hashtags(&state.pool, child.id, &extracted_hashtags).await.map_err(|e| db_err(e))?
            } else {
                Vec::new()
            }
        } else {
            Vec::new()
        };
        
        children.push(OperationWithHashtags {
            id: child.id,
            creation_date: child.creation_date,
            category_id: child.category_id,
            description: child.description,
            asset_id: child.asset_id,
            amount: child.amount,
            operation_type: child.operation_type,
            operation_date: child.operation_date,
            parent_operation_id: child.parent_operation_id,
            is_split: child.is_split,
            linked_operation_id: child.linked_operation_id,
            hashtags,
        });
    }
    
    tx.commit().await.map_err(db_err)?;
    
    Ok(Json(children))
}

// Unsplit operation - delete children and restore parent
pub async fn unsplit_operation(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<(), (axum::http::StatusCode, String)> {
    // Get parent operation
    let parent = sqlx::query_as::<_, Operation>(
        "SELECT id, creation_date, category_id, description, asset_id, amount, operation_type::text, operation_date, parent_operation_id, is_split, linked_operation_id
         FROM operations WHERE id = $1"
    ).bind(id).fetch_optional(&state.pool).await.map_err(db_err)?;
    
    let parent = match parent {
        Some(p) => p,
        None => return Err((axum::http::StatusCode::NOT_FOUND, "Operation not found".to_string())),
    };
    
    // Validate: operation is split
    if !parent.is_split {
        return Err((axum::http::StatusCode::BAD_REQUEST, "Operation is not split".to_string()));
    }
    
    // Begin transaction
    let mut tx = state.pool.begin().await.map_err(db_err)?;
    
    // Delete children (CASCADE will handle operation_hashtags)
    sqlx::query("DELETE FROM operations WHERE parent_operation_id = $1")
        .bind(id)
        .execute(&mut *tx)
        .await
        .map_err(db_err)?;
    
    // Restore parent
    sqlx::query("UPDATE operations SET is_split = FALSE WHERE id = $1")
        .bind(id)
        .execute(&mut *tx)
        .await
        .map_err(db_err)?;
    
    tx.commit().await.map_err(db_err)?;
    
    Ok(())
}

// Get children of split operation
pub async fn get_operation_children(
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<Json<Vec<OperationWithDetails>>, (axum::http::StatusCode, String)> {
    #[derive(sqlx::FromRow)]
    struct OperationRow {
        id: i32,
        creation_date: Option<chrono::NaiveDateTime>,
        category_id: Option<i32>,
        category_name: Option<String>,
        parent_category_name: Option<String>,
        description: Option<String>,
        asset_id: i32,
        asset_name: Option<String>,
        amount: bigdecimal::BigDecimal,
        operation_type: Option<String>,
        operation_date: chrono::NaiveDate,
        parent_operation_id: Option<i32>,
        is_split: bool,
        linked_operation_id: Option<i32>,
    }
    
    let rows = sqlx::query_as::<_, OperationRow>(
        "SELECT 
            o.id, 
            o.creation_date, 
            o.category_id, 
            c.name as category_name,
            pc.name as parent_category_name,
            o.description, 
            o.asset_id, 
            a.name as asset_name,
            o.amount, 
            o.operation_type::text as operation_type,
            o.operation_date,
            o.parent_operation_id,
            o.is_split,
            o.linked_operation_id
         FROM operations o
         INNER JOIN assets a ON o.asset_id = a.id
         LEFT JOIN categories c ON o.category_id = c.id
         LEFT JOIN categories pc ON c.parent_id = pc.id
         WHERE o.parent_operation_id = $1
         ORDER BY o.id"
    ).bind(id).fetch_all(&state.pool).await.map_err(db_err)?;
    
    if rows.is_empty() {
        return Ok(Json(Vec::new()));
    }
    
    // Batch fetch hashtags
    let operation_ids: Vec<i32> = rows.iter().map(|op| op.id).collect();
    let all_hashtags = get_operations_hashtags_batch(&state.pool, &operation_ids).await.map_err(|e| db_err(e))?;
    
    let result: Vec<OperationWithDetails> = rows.into_iter().map(|op| {
        let hashtags = all_hashtags.get(&op.id).cloned().unwrap_or_default();
        OperationWithDetails {
            id: op.id,
            creation_date: op.creation_date,
            category_id: op.category_id,
            category_name: op.category_name,
            parent_category_name: op.parent_category_name,
            description: op.description,
            asset_id: op.asset_id,
            asset_name: op.asset_name,
            amount: op.amount,
            operation_type: op.operation_type.unwrap_or_else(|| "unknown".to_string()),
            operation_date: op.operation_date,
            parent_operation_id: op.parent_operation_id,
            is_split: op.is_split,
            linked_operation_id: op.linked_operation_id,
            hashtags,
        }
    }).collect();
    
    Ok(Json(result))
}

// Classify uncategorized operations as transfers
pub async fn classify_uncategorized_operations(State(state): State<AppState>) -> Result<Json<serde_json::Value>, (axum::http::StatusCode, String)> {
    let result = sqlx::query("SELECT * FROM classify_uncategorized_as_transfers()")
        .fetch_all(&state.pool)
        .await
        .map_err(db_err)?;
    
    Ok(Json(serde_json::json!({
        "classified_count": result.len(),
        "message": format!("Successfully classified {} operations", result.len())
    })))
}
