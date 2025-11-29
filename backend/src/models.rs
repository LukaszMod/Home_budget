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
    pub account_id: i32,
    pub amount: f64,
    pub operation_type: String,
    pub operation_date: NaiveDate,
}

#[derive(Deserialize)]
pub struct CreateOperation {
    pub creation_date: Option<String>,
    pub category_id: Option<i32>,
    pub description: Option<String>,
    pub account_id: i32,
    pub amount: f64,
    pub operation_type: String,
    pub operation_date: String,
}

#[derive(Serialize, FromRow)]
pub struct Budget {
    pub id: i32,
    pub account_id: i32,
    pub category_id: i32,
    pub month: NaiveDate,
    pub planned_amount: f64,
}

#[derive(Deserialize)]
pub struct CreateBudget {
    pub account_id: i32,
    pub category_id: i32,
    pub month: NaiveDate,
    pub planned_amount: f64,
}

#[derive(Serialize, FromRow)]
pub struct Goal {
    pub id: i32,
    pub user_id: i32,
    pub account_id: i32,
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
    pub account_id: i32,
    pub name: String,
    pub target_amount: f64,
    pub target_date: String,
}
