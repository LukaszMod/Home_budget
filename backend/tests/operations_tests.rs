use backend::{AppState, models::*};
use sqlx::PgPool;
use axum::{
    body::Body,
    http::{Request, StatusCode},
};
use tower::ServiceExt;
use serde_json::json;

async fn setup_test_db() -> PgPool {
    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgres://postgres:postgres@localhost/home_budget_test".to_string());
    
    let pool = PgPool::connect(&database_url)
        .await
        .expect("Failed to connect to test database");
    
    // Run migrations
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("Failed to run migrations");
    
    pool
}

async fn cleanup_test_db(pool: &PgPool) {
    sqlx::query("TRUNCATE operations, assets, users, categories, asset_types CASCADE")
        .execute(pool)
        .await
        .expect("Failed to cleanup test database");
}

async fn create_test_user(pool: &PgPool) -> i32 {
    let user = sqlx::query_as::<_, User>(
        "INSERT INTO users (full_name, nick) VALUES ($1, $2) RETURNING id, full_name, nick, email, created_date"
    )
    .bind("Test User")
    .bind("testuser")
    .fetch_one(pool)
    .await
    .expect("Failed to create test user");
    
    user.id
}

async fn create_test_asset(pool: &PgPool, user_id: i32) -> i32 {
    // Get liquid asset type
    let asset_type = sqlx::query_as::<_, AssetType>(
        "SELECT id, name, icon, category, created_date FROM asset_types WHERE category = 'liquid' LIMIT 1"
    )
    .fetch_one(pool)
    .await
    .expect("Failed to get asset type");
    
    let asset = sqlx::query_as::<_, Asset>(
        "INSERT INTO assets (user_id, asset_type_id, name, currency) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, user_id, asset_type_id, name, description, account_number, quantity, average_purchase_price, current_valuation, currency, is_active, created_date"
    )
    .bind(user_id)
    .bind(asset_type.id)
    .bind("Test Account")
    .bind("PLN")
    .fetch_one(pool)
    .await
    .expect("Failed to create test asset");
    
    asset.id
}

async fn create_test_category(pool: &PgPool) -> i32 {
    let category = sqlx::query_as::<_, Category>(
        "INSERT INTO categories (name, type) VALUES ($1, $2) RETURNING id, name, type, parent_id, user_id, created_date"
    )
    .bind("Test Category")
    .bind("expense")
    .fetch_one(pool)
    .await
    .expect("Failed to create test category");
    
    category.id
}

#[tokio::test]
async fn test_create_regular_operation() {
    let pool = setup_test_db().await;
    cleanup_test_db(&pool).await;
    
    let user_id = create_test_user(&pool).await;
    let asset_id = create_test_asset(&pool, user_id).await;
    let category_id = create_test_category(&pool).await;
    
    let state = AppState { pool: pool.clone() };
    let app = backend::routes::router().with_state(state);
    
    let payload = json!({
        "asset_id": asset_id,
        "amount": "100.50",
        "description": "Test operation",
        "category_id": category_id,
        "operation_type": "expense",
        "operation_date": "2025-12-13"
    });
    
    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/operations")
                .header("content-type", "application/json")
                .body(Body::from(serde_json::to_string(&payload).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();
    
    assert_eq!(response.status(), StatusCode::OK);
    
    // Check if account balance was updated
    let balance: (Option<bigdecimal::BigDecimal>,) = sqlx::query_as(
        "SELECT current_valuation FROM assets WHERE id = $1"
    )
    .bind(asset_id)
    .fetch_one(&pool)
    .await
    .expect("Failed to get balance");
    
    assert_eq!(balance.0.unwrap().to_string(), "-100.50");
    
    cleanup_test_db(&pool).await;
}

#[tokio::test]
async fn test_create_split_operation() {
    let pool = setup_test_db().await;
    cleanup_test_db(&pool).await;
    
    let user_id = create_test_user(&pool).await;
    let asset_id = create_test_asset(&pool, user_id).await;
    let category_id_1 = create_test_category(&pool).await;
    
    let category_id_2 = sqlx::query_as::<_, Category>(
        "INSERT INTO categories (name, type) VALUES ($1, $2) RETURNING id, name, type, parent_id, user_id, created_date"
    )
    .bind("Test Category 2")
    .bind("expense")
    .fetch_one(&pool)
    .await
    .expect("Failed to create test category 2")
    .id;
    
    let state = AppState { pool: pool.clone() };
    let app = backend::routes::router().with_state(state);
    
    let payload = json!({
        "asset_id": asset_id,
        "amount": "200",
        "description": "Split test",
        "operation_type": "expense",
        "operation_date": "2025-12-13",
        "is_split": true,
        "split_items": [
            {
                "category_id": category_id_1,
                "amount": 120,
                "description": "Part 1"
            },
            {
                "category_id": category_id_2,
                "amount": 80,
                "description": "Part 2"
            }
        ]
    });
    
    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/operations")
                .header("content-type", "application/json")
                .body(Body::from(serde_json::to_string(&payload).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();
    
    assert_eq!(response.status(), StatusCode::OK);
    
    // Check if parent operation exists and is marked as split
    let parent_count: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM operations WHERE asset_id = $1 AND is_split = true AND parent_operation_id IS NULL"
    )
    .bind(asset_id)
    .fetch_one(&pool)
    .await
    .expect("Failed to count parent operations");
    
    assert_eq!(parent_count.0, 1);
    
    // Check if child operations exist
    let child_count: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM operations WHERE asset_id = $1 AND parent_operation_id IS NOT NULL"
    )
    .bind(asset_id)
    .fetch_one(&pool)
    .await
    .expect("Failed to count child operations");
    
    assert_eq!(child_count.0, 2);
    
    // Check if account balance was updated (should only count parent)
    let balance: (Option<bigdecimal::BigDecimal>,) = sqlx::query_as(
        "SELECT current_valuation FROM assets WHERE id = $1"
    )
    .bind(asset_id)
    .fetch_one(&pool)
    .await
    .expect("Failed to get balance");
    
    assert_eq!(balance.0.unwrap().to_string(), "-200");
    
    cleanup_test_db(&pool).await;
}

#[tokio::test]
async fn test_transfer_between_accounts() {
    let pool = setup_test_db().await;
    cleanup_test_db(&pool).await;
    
    let user_id = create_test_user(&pool).await;
    let from_asset_id = create_test_asset(&pool, user_id).await;
    
    // Create second asset
    let asset_type = sqlx::query_as::<_, AssetType>(
        "SELECT id, name, icon, category, created_date FROM asset_types WHERE category = 'liquid' LIMIT 1"
    )
    .fetch_one(&pool)
    .await
    .expect("Failed to get asset type");
    
    let to_asset_id = sqlx::query_as::<_, Asset>(
        "INSERT INTO assets (user_id, asset_type_id, name, currency) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, user_id, asset_type_id, name, description, account_number, quantity, average_purchase_price, current_valuation, currency, is_active, created_date"
    )
    .bind(user_id)
    .bind(asset_type.id)
    .bind("Test Account 2")
    .bind("PLN")
    .fetch_one(&pool)
    .await
    .expect("Failed to create second test asset")
    .id;
    
    // Add initial balance to from_asset
    sqlx::query(
        "INSERT INTO operations (asset_id, amount, operation_type, operation_date, description)
         VALUES ($1, $2, 'income'::operation_type, $3, $4)"
    )
    .bind(from_asset_id)
    .bind(bigdecimal::BigDecimal::from(1000))
    .bind(chrono::NaiveDate::from_ymd_opt(2025, 12, 1).unwrap())
    .bind("Initial balance")
    .execute(&pool)
    .await
    .expect("Failed to add initial balance");
    
    let state = AppState { pool: pool.clone() };
    let app = backend::routes::router().with_state(state);
    
    let payload = json!({
        "from_asset_id": from_asset_id,
        "to_asset_id": to_asset_id,
        "amount": "500",
        "transfer_type": "liquid_to_liquid",
        "description": "Test transfer",
        "operation_date": "2025-12-13"
    });
    
    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/operations/transfer")
                .header("content-type", "application/json")
                .body(Body::from(serde_json::to_string(&payload).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();
    
    assert_eq!(response.status(), StatusCode::OK);
    
    // Check balances
    let from_balance: (Option<bigdecimal::BigDecimal>,) = sqlx::query_as(
        "SELECT current_valuation FROM assets WHERE id = $1"
    )
    .bind(from_asset_id)
    .fetch_one(&pool)
    .await
    .expect("Failed to get from balance");
    
    let to_balance: (Option<bigdecimal::BigDecimal>,) = sqlx::query_as(
        "SELECT current_valuation FROM assets WHERE id = $1"
    )
    .bind(to_asset_id)
    .fetch_one(&pool)
    .await
    .expect("Failed to get to balance");
    
    assert_eq!(from_balance.0.unwrap().to_string(), "500");
    assert_eq!(to_balance.0.unwrap().to_string(), "500");
    
    cleanup_test_db(&pool).await;
}

#[tokio::test]
async fn test_account_balance_trigger_on_delete() {
    let pool = setup_test_db().await;
    cleanup_test_db(&pool).await;
    
    let user_id = create_test_user(&pool).await;
    let asset_id = create_test_asset(&pool, user_id).await;
    let category_id = create_test_category(&pool).await;
    
    // Create operation
    let op_id = sqlx::query_as::<_, Operation>(
        "INSERT INTO operations (asset_id, amount, operation_type, operation_date, description, category_id)
         VALUES ($1, $2, 'expense'::operation_type, $3, $4, $5)
         RETURNING id, creation_date, category_id, description, asset_id, amount, operation_type::text, operation_date, parent_operation_id, is_split"
    )
    .bind(asset_id)
    .bind(bigdecimal::BigDecimal::from(100))
    .bind(chrono::NaiveDate::from_ymd_opt(2025, 12, 13).unwrap())
    .bind("Test")
    .bind(category_id)
    .fetch_one(&pool)
    .await
    .expect("Failed to create operation")
    .id;
    
    // Check balance after insert
    let balance_after_insert: (Option<bigdecimal::BigDecimal>,) = sqlx::query_as(
        "SELECT current_valuation FROM assets WHERE id = $1"
    )
    .bind(asset_id)
    .fetch_one(&pool)
    .await
    .expect("Failed to get balance");
    
    assert_eq!(balance_after_insert.0.unwrap().to_string(), "-100");
    
    // Delete operation
    sqlx::query("DELETE FROM operations WHERE id = $1")
        .bind(op_id)
        .execute(&pool)
        .await
        .expect("Failed to delete operation");
    
    // Check balance after delete
    let balance_after_delete: (Option<bigdecimal::BigDecimal>,) = sqlx::query_as(
        "SELECT current_valuation FROM assets WHERE id = $1"
    )
    .bind(asset_id)
    .fetch_one(&pool)
    .await
    .expect("Failed to get balance");
    
    assert_eq!(balance_after_delete.0.unwrap().to_string(), "0");
    
    cleanup_test_db(&pool).await;
}
