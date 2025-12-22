use serde::{Serialize, Deserialize};
use chrono::{NaiveDateTime, NaiveDate};
use sqlx::FromRow;
use sqlx::types::BigDecimal;

#[derive(Serialize, FromRow)]
pub struct User {
    pub id: i32,
    pub full_name: String,
    pub nick: String,
    pub creation_date: Option<NaiveDateTime>,
}

#[derive(Deserialize)]
pub struct CreateUser {
    pub full_name: String,
    pub nick: String,
}

#[derive(Serialize, FromRow)]
pub struct Category {
    pub id: i32,
    pub name: String,
    pub parent_id: Option<i32>,
    #[sqlx(rename = "type")]
    pub r#type: String,
    pub sort_order: i32,
    pub is_system: bool,
    pub is_hidden: bool,
}

#[derive(Deserialize)]
pub struct CreateCategory {
    pub name: String,
    pub parent_id: Option<i32>,
    pub r#type: String,
}

#[derive(Deserialize)]
pub struct ReorderCategories {
    pub items: Vec<ReorderItem>,
}

#[derive(Deserialize)]
pub struct ReorderAssets {
    pub items: Vec<ReorderItem>,
}

#[derive(Deserialize)]
pub struct ReorderItem {
    pub id: i32,
    pub sort_order: i32,
}

// Asset Types
#[derive(Serialize, FromRow)]
pub struct AssetType {
    pub id: i32,
    pub name: String,
    pub category: String,
    pub icon: Option<String>,
    pub allows_operations: bool,
    pub created_date: Option<NaiveDateTime>,
}

// Assets (replaces Account)
#[derive(Serialize, FromRow)]
pub struct Asset {
    pub id: i32,
    pub user_id: i32,
    pub asset_type_id: i32,
    pub name: String,
    pub description: Option<String>,
    pub account_number: Option<String>,
    pub quantity: Option<BigDecimal>,
    pub average_purchase_price: Option<BigDecimal>,
    pub current_valuation: Option<BigDecimal>,
    pub currency: String,
    pub is_active: bool,
    pub created_date: Option<NaiveDateTime>,
    pub sort_order: i32,
}

#[derive(Deserialize)]
pub struct CreateAsset {
    pub user_id: i32,
    pub asset_type_id: i32,
    pub name: String,
    pub description: Option<String>,
    pub account_number: Option<String>,
    pub quantity: Option<f64>,
    pub average_purchase_price: Option<f64>,
    pub current_valuation: Option<f64>,
    pub currency: Option<String>,
    pub initial_balance: Option<f64>,
}

// Investment Transactions
#[derive(Serialize, FromRow)]
pub struct InvestmentTransaction {
    pub id: i32,
    pub asset_id: i32,
    pub transaction_type: String,
    pub quantity: Option<BigDecimal>,
    pub price_per_unit: Option<BigDecimal>,
    pub total_value: BigDecimal,
    pub transaction_date: NaiveDate,
    pub notes: Option<String>,
    pub created_date: Option<NaiveDateTime>,
}

#[derive(Deserialize)]
pub struct CreateInvestmentTransaction {
    pub asset_id: i32,
    pub transaction_type: String,
    pub quantity: Option<BigDecimal>,
    pub price_per_unit: Option<BigDecimal>,
    pub total_value: BigDecimal,
    pub transaction_date: String,
    pub notes: Option<String>,
}

// Asset Valuations
#[derive(Serialize, FromRow)]
pub struct AssetValuation {
    pub id: i32,
    pub asset_id: i32,
    pub valuation_date: NaiveDate,
    pub value: BigDecimal,
    pub notes: Option<String>,
    pub created_date: Option<NaiveDateTime>,
}

#[derive(Deserialize)]
pub struct CreateAssetValuation {
    pub asset_id: i32,
    pub valuation_date: String,
    pub value: BigDecimal,
    pub notes: Option<String>,
}

// Legacy Account structs (for backwards compatibility during migration)
#[allow(dead_code)]
#[derive(Serialize, FromRow)]
pub struct Account {
    pub id: i32,
    pub user_id: i32,
    pub name: String,
    pub account_number: Option<String>,
    pub is_closed: bool,
}

#[allow(dead_code)]
#[derive(Deserialize)]
pub struct CreateAccount {
    pub user_id: i32,
    pub name: String,
    pub account_number: Option<String>,
}

#[derive(Serialize, FromRow)]
pub struct Operation {
    pub id: i32,
    pub creation_date: Option<NaiveDateTime>,
    pub category_id: Option<i32>,
    pub description: Option<String>,
    pub asset_id: i32,
    pub amount: BigDecimal,
    pub operation_type: String,
    pub operation_date: NaiveDate,
    pub parent_operation_id: Option<i32>,
    pub is_split: bool,
    pub linked_operation_id: Option<i32>,
}

#[derive(Serialize)]
pub struct OperationWithHashtags {
    pub id: i32,
    pub creation_date: Option<NaiveDateTime>,
    pub category_id: Option<i32>,
    pub description: Option<String>,
    pub asset_id: i32,
    pub amount: BigDecimal,
    pub operation_type: String,
    pub operation_date: NaiveDate,
    pub parent_operation_id: Option<i32>,
    pub is_split: bool,
    pub linked_operation_id: Option<i32>,
    pub hashtags: Vec<Hashtag>,
}

// Extended operation with JOINed data for frontend
#[derive(Serialize)]
pub struct OperationWithDetails {
    pub id: i32,
    pub creation_date: Option<NaiveDateTime>,
    pub category_id: Option<i32>,
    pub category_name: Option<String>,
    pub parent_category_name: Option<String>,
    pub description: Option<String>,
    pub asset_id: i32,
    pub asset_name: Option<String>,
    pub amount: BigDecimal,
    pub operation_type: String,
    pub operation_date: NaiveDate,
    pub parent_operation_id: Option<i32>,
    pub is_split: bool,
    pub linked_operation_id: Option<i32>,
    pub hashtags: Vec<Hashtag>,
}

#[derive(Deserialize)]
pub struct CreateOperation {
    #[allow(dead_code)]
    pub creation_date: Option<String>,
    pub category_id: Option<i32>,
    pub description: Option<String>,
    pub asset_id: i32,
    pub amount: BigDecimal,
    pub operation_type: String,
    pub operation_date: String,
    pub split_items: Option<Vec<SplitItem>>,
}

// Split operations
#[derive(Deserialize)]
pub struct SplitOperationRequest {
    pub items: Vec<SplitItem>,
}

#[derive(Deserialize, Clone)]
pub struct SplitItem {
    pub category_id: i32,
    pub amount: BigDecimal,
    pub description: Option<String>,
}

#[derive(Serialize, FromRow)]
pub struct Budget {
    pub id: i32,
    pub asset_id: i32,
    pub category_id: i32,
    pub month: NaiveDate,
    pub planned_amount: BigDecimal,
}

#[derive(Deserialize)]
pub struct CreateBudget {
    pub asset_id: i32,
    pub category_id: i32,
    pub month: NaiveDate,
    pub planned_amount: BigDecimal,
}

// Budget with JOINed category data for frontend
#[derive(Serialize)]
pub struct BudgetWithCategory {
    pub id: i32,
    pub asset_id: i32,
    pub category_id: i32,
    pub category_name: String,
    pub category_type: String,
    pub parent_id: Option<i32>,
    pub month: NaiveDate,
    pub planned_amount: BigDecimal,
}

// Complete budget data response with spending
#[derive(Serialize)]
pub struct BudgetDataResponse {
    pub budgets: Vec<BudgetWithCategory>,
    pub spending: Vec<CategorySpending>,
}

#[derive(Serialize)]
pub struct CategorySpending {
    pub category_id: i32,
    pub amount: BigDecimal,
}

#[derive(Serialize, FromRow)]
pub struct Goal {
    pub id: i32,
    pub user_id: i32,
    pub asset_id: i32,
    pub name: String,
    pub target_amount: BigDecimal,
    pub current_amount: BigDecimal,
    pub target_date: NaiveDate,
    pub created_date: NaiveDateTime,
    pub completed_date: Option<NaiveDateTime>,
    pub is_completed: bool,
}

#[derive(Deserialize)]
pub struct CreateGoal {
    pub user_id: i32,
    pub asset_id: i32,
    pub name: String,
    pub target_amount: BigDecimal,
    pub target_date: String,
}

#[derive(Serialize, FromRow, Clone)]
pub struct Hashtag {
    pub id: i32,
    pub name: String,
    pub created_date: Option<NaiveDateTime>,
    pub usage_count: i32,
}

#[derive(Deserialize)]
pub struct CreateHashtag {
    pub name: String,
}

#[derive(Serialize, FromRow)]
pub struct RecurringOperation {
    pub id: i32,
    pub asset_id: i32,
    pub category_id: Option<i32>,
    pub description: Option<String>,
    pub amount: BigDecimal,
    pub operation_type: String,
    pub frequency: String,
    pub start_date: NaiveDate,
    pub end_date: Option<NaiveDate>,
    pub is_active: bool,
    pub creation_date: Option<NaiveDateTime>,
    pub last_generated: Option<NaiveDate>,
}

// Extended recurring operation with JOINed data
#[derive(Serialize)]
pub struct RecurringOperationWithDetails {
    pub id: i32,
    pub asset_id: i32,
    pub asset_name: Option<String>,
    pub category_id: Option<i32>,
    pub category_name: Option<String>,
    pub description: Option<String>,
    pub amount: BigDecimal,
    pub operation_type: String,
    pub frequency: String,
    pub start_date: NaiveDate,
    pub end_date: Option<NaiveDate>,
    pub is_active: bool,
    pub creation_date: Option<NaiveDateTime>,
    pub last_generated: Option<NaiveDate>,
}

#[derive(Deserialize)]
pub struct CreateRecurringOperation {
    pub asset_id: i32,
    pub category_id: Option<i32>,
    pub description: Option<String>,
    pub amount: BigDecimal,
    pub operation_type: String,
    pub frequency: String,
    pub start_date: String,
    pub end_date: Option<String>,
}

#[derive(Deserialize)]
pub struct UpdateRecurringOperation {
    pub description: Option<String>,
    pub amount: Option<BigDecimal>,
    pub category_id: Option<i32>,
    pub end_date: Option<String>,
    pub is_active: Option<bool>,
}

// Transfer structures
#[derive(Deserialize)]
pub struct NewAssetData {
    pub asset_type_id: i32,
    pub name: String,
    pub description: Option<String>,
    pub account_number: Option<String>,
    pub currency: Option<String>,
}

#[derive(Deserialize)]
pub struct TransferRequest {
    pub from_asset_id: i32,
    pub to_asset_id: Option<i32>,
    pub amount: f64,
    pub transfer_type: String, // "liquid_to_liquid", "liquid_to_investment", "liquid_to_property", etc.
    pub description: Option<String>,
    pub operation_date: String,
    
    // For creating new assets
    pub new_asset: Option<NewAssetData>,
    
    // For investment transactions
    pub investment_quantity: Option<f64>,
    
    // For liability payments - interest amount
    pub interest_amount: Option<f64>,
}

#[derive(Serialize)]
pub struct TransferResponse {
    pub success: bool,
    pub from_operation_id: Option<i32>,
    pub to_operation_id: Option<i32>,
    pub new_asset_id: Option<i32>,
    pub investment_transaction_id: Option<i32>,
    pub interest_operation_id: Option<i32>,
}

// Import Templates
#[derive(Serialize, FromRow)]
pub struct ImportTemplate {
    pub id: i32,
    pub user_id: i32,
    pub name: String,
    pub template_data: sqlx::types::JsonValue,
    pub created_at: Option<NaiveDateTime>,
    pub updated_at: Option<NaiveDateTime>,
}

#[derive(Deserialize)]
pub struct CreateImportTemplate {
    pub name: String,
    pub template_data: sqlx::types::JsonValue,
}

#[derive(Deserialize)]
pub struct UpdateImportTemplate {
    pub name: Option<String>,
    pub template_data: Option<sqlx::types::JsonValue>,
}

#[derive(Deserialize)]
pub struct CorrectBalanceRequest {
    pub target_balance: f64,
}
