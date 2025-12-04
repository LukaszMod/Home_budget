use serde::{Serialize, Deserialize};
use chrono::{NaiveDateTime, NaiveDate};
use sqlx::FromRow;

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
}

#[derive(Deserialize)]
pub struct CreateCategory {
    pub name: String,
    pub parent_id: Option<i32>,
    pub r#type: String,
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
    pub quantity: Option<f64>,
    pub average_purchase_price: Option<f64>,
    pub current_valuation: Option<f64>,
    pub currency: String,
    pub is_active: bool,
    pub created_date: Option<NaiveDateTime>,
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
}

// Investment Transactions
#[derive(Serialize, FromRow)]
pub struct InvestmentTransaction {
    pub id: i32,
    pub asset_id: i32,
    pub transaction_type: String,
    pub quantity: Option<f64>,
    pub price_per_unit: Option<f64>,
    pub total_value: f64,
    pub transaction_date: NaiveDate,
    pub notes: Option<String>,
    pub created_date: Option<NaiveDateTime>,
}

#[derive(Deserialize)]
pub struct CreateInvestmentTransaction {
    pub asset_id: i32,
    pub transaction_type: String,
    pub quantity: Option<f64>,
    pub price_per_unit: Option<f64>,
    pub total_value: f64,
    pub transaction_date: String,
    pub notes: Option<String>,
}

// Asset Valuations
#[derive(Serialize, FromRow)]
pub struct AssetValuation {
    pub id: i32,
    pub asset_id: i32,
    pub valuation_date: NaiveDate,
    pub value: f64,
    pub notes: Option<String>,
    pub created_date: Option<NaiveDateTime>,
}

#[derive(Deserialize)]
pub struct CreateAssetValuation {
    pub asset_id: i32,
    pub valuation_date: String,
    pub value: f64,
    pub notes: Option<String>,
}

// Legacy Account structs (for backwards compatibility during migration)
#[derive(Serialize, FromRow)]
pub struct Account {
    pub id: i32,
    pub user_id: i32,
    pub name: String,
    pub account_number: Option<String>,
    pub is_closed: bool,
}

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
    pub amount: f64,
    pub operation_type: String,
    pub operation_date: NaiveDate,
}

#[derive(Serialize)]
pub struct OperationWithHashtags {
    pub id: i32,
    pub creation_date: Option<NaiveDateTime>,
    pub category_id: Option<i32>,
    pub description: Option<String>,
    pub asset_id: i32,
    pub amount: f64,
    pub operation_type: String,
    pub operation_date: NaiveDate,
    pub hashtags: Vec<Hashtag>,
}

#[derive(Deserialize)]
pub struct CreateOperation {
    pub creation_date: Option<String>,
    pub category_id: Option<i32>,
    pub description: Option<String>,
    pub asset_id: i32,
    pub amount: f64,
    pub operation_type: String,
    pub operation_date: String,
}

#[derive(Serialize, FromRow)]
pub struct Budget {
    pub id: i32,
    pub asset_id: i32,
    pub category_id: i32,
    pub month: NaiveDate,
    pub planned_amount: f64,
}

#[derive(Deserialize)]
pub struct CreateBudget {
    pub asset_id: i32,
    pub category_id: i32,
    pub month: NaiveDate,
    pub planned_amount: f64,
}

#[derive(Serialize, FromRow)]
pub struct Goal {
    pub id: i32,
    pub user_id: i32,
    pub asset_id: i32,
    pub name: String,
    pub target_amount: f64,
    pub current_amount: f64,
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
    pub target_amount: f64,
    pub target_date: String,
}

#[derive(Serialize, FromRow, Clone)]
pub struct Hashtag {
    pub id: i32,
    pub name: String,
    pub created_date: Option<NaiveDateTime>,
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
    pub amount: f64,
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
    pub amount: f64,
    pub operation_type: String,
    pub frequency: String,
    pub start_date: String,
    pub end_date: Option<String>,
}

#[derive(Deserialize)]
pub struct UpdateRecurringOperation {
    pub description: Option<String>,
    pub amount: Option<f64>,
    pub category_id: Option<i32>,
    pub end_date: Option<String>,
    pub is_active: Option<bool>,
}
