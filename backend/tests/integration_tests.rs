use sqlx::postgres::PgPoolOptions;
use std::env;

#[tokio::test]
async fn test_database_connection() {
    let database_url = env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgresql://postgres:postgres@localhost/home_budget_test".to_string());
    
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await;
    
    assert!(pool.is_ok(), "Should connect to database");
}

#[tokio::test]
async fn test_split_operations_creation() {
    let database_url = env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgresql://postgres:postgres@localhost/home_budget_test".to_string());
    
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Failed to connect to database");

    // Create parent operation
    let parent = sqlx::query!(
        r#"
        INSERT INTO operations (description, asset_id, amount, operation_type, operation_date, is_split)
        VALUES ($1, $2, $3, $4::operation_type, $5::date, TRUE)
        RETURNING id
        "#,
        "Test Split Operation",
        1,
        100.0,
        "expense",
        "2025-12-13"
    )
    .fetch_one(&pool)
    .await
    .expect("Failed to create parent operation");

    // Create child operations
    let child1 = sqlx::query!(
        r#"
        INSERT INTO operations (description, asset_id, amount, operation_type, operation_date, category_id, parent_operation_id)
        VALUES ($1, $2, $3, $4::operation_type, $5::date, $6, $7)
        RETURNING id
        "#,
        "Child 1",
        1,
        60.0,
        "expense",
        "2025-12-13",
        2,
        parent.id
    )
    .fetch_one(&pool)
    .await
    .expect("Failed to create child 1");

    let child2 = sqlx::query!(
        r#"
        INSERT INTO operations (description, asset_id, amount, operation_type, operation_date, category_id, parent_operation_id)
        VALUES ($1, $2, $3, $4::operation_type, $5::date, $6, $7)
        RETURNING id
        "#,
        "Child 2",
        1,
        40.0,
        "expense",
        "2025-12-13",
        3,
        parent.id
    )
    .fetch_one(&pool)
    .await
    .expect("Failed to create child 2");

    // Verify children have correct parent_operation_id
    let children = sqlx::query!(
        r#"
        SELECT id, parent_operation_id, is_split
        FROM operations
        WHERE parent_operation_id = $1
        "#,
        parent.id
    )
    .fetch_all(&pool)
    .await
    .expect("Failed to fetch children");

    assert_eq!(children.len(), 2);
    assert_eq!(children[0].parent_operation_id, Some(parent.id));
    assert_eq!(children[1].parent_operation_id, Some(parent.id));
    assert_eq!(children[0].is_split, Some(false));

    // Cleanup
    sqlx::query!("DELETE FROM operations WHERE id = ANY($1)", &vec![parent.id, child1.id, child2.id])
        .execute(&pool)
        .await
        .ok();
}

#[tokio::test]
async fn test_account_balance_trigger() {
    let database_url = env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgresql://postgres:postgres@localhost/home_budget_test".to_string());
    
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Failed to connect to database");

    // Get initial balance
    let initial_balance = sqlx::query!(
        "SELECT current_valuation FROM assets WHERE id = 1"
    )
    .fetch_one(&pool)
    .await
    .expect("Failed to get initial balance");

    let initial = initial_balance.current_valuation.unwrap_or(rust_decimal::Decimal::ZERO);

    // Create income operation
    let op = sqlx::query!(
        r#"
        INSERT INTO operations (description, asset_id, amount, operation_type, operation_date)
        VALUES ($1, $2, $3, $4::operation_type, $5::date)
        RETURNING id
        "#,
        "Test Income",
        1,
        500.0,
        "income",
        "2025-12-13"
    )
    .fetch_one(&pool)
    .await
    .expect("Failed to create operation");

    // Check balance after income
    let after_income = sqlx::query!(
        "SELECT current_valuation FROM assets WHERE id = 1"
    )
    .fetch_one(&pool)
    .await
    .expect("Failed to get balance after income");

    let after = after_income.current_valuation.unwrap_or(rust_decimal::Decimal::ZERO);
    
    assert_eq!(
        after, 
        initial + rust_decimal::Decimal::from(500),
        "Balance should increase by 500"
    );

    // Cleanup
    sqlx::query!("DELETE FROM operations WHERE id = $1", op.id)
        .execute(&pool)
        .await
        .ok();
}

#[tokio::test]
async fn test_split_children_not_counted_in_balance() {
    let database_url = env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgresql://postgres:postgres@localhost/home_budget_test".to_string());
    
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Failed to connect to database");

    // Get initial balance
    let initial_balance = sqlx::query!(
        "SELECT current_valuation FROM assets WHERE id = 1"
    )
    .fetch_one(&pool)
    .await
    .expect("Failed to get initial balance");

    let initial = initial_balance.current_valuation.unwrap_or(rust_decimal::Decimal::ZERO);

    // Create split parent
    let parent = sqlx::query!(
        r#"
        INSERT INTO operations (description, asset_id, amount, operation_type, operation_date, is_split)
        VALUES ($1, $2, $3, $4::operation_type, $5::date, TRUE)
        RETURNING id
        "#,
        "Split Test",
        1,
        100.0,
        "expense",
        "2025-12-13"
    )
    .fetch_one(&pool)
    .await
    .expect("Failed to create parent");

    // Create children (should NOT affect balance)
    let child = sqlx::query!(
        r#"
        INSERT INTO operations (description, asset_id, amount, operation_type, operation_date, category_id, parent_operation_id)
        VALUES ($1, $2, $3, $4::operation_type, $5::date, $6, $7)
        RETURNING id
        "#,
        "Child",
        1,
        100.0,
        "expense",
        "2025-12-13",
        2,
        parent.id
    )
    .fetch_one(&pool)
    .await
    .expect("Failed to create child");

    // Check balance - should only decrease by parent amount (100), not child (another 100)
    let after_split = sqlx::query!(
        "SELECT current_valuation FROM assets WHERE id = 1"
    )
    .fetch_one(&pool)
    .await
    .expect("Failed to get balance after split");

    let after = after_split.current_valuation.unwrap_or(rust_decimal::Decimal::ZERO);
    
    assert_eq!(
        after,
        initial - rust_decimal::Decimal::from(100),
        "Balance should decrease by parent amount only (100), not counting children"
    );

    // Cleanup
    sqlx::query!("DELETE FROM operations WHERE id = ANY($1)", &vec![parent.id, child.id])
        .execute(&pool)
        .await
        .ok();
}
