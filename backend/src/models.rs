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
    pub main_category: Option<String>,
    pub parent_id: Option<i32>,
}

#[derive(Deserialize)]
pub struct CreateCategory {
    pub name: String,
    pub main_category: Option<String>,
    pub parent_id: Option<i32>,
}

#[derive(Serialize, FromRow)]
pub struct Account {
    pub id: i32,
    pub name: String,
    pub owner: i32,
    pub account_number: Option<String>,
}

#[derive(Deserialize)]
pub struct CreateAccount {
    pub name: String,
    pub owner: i32,
    pub account_number: Option<String>,
}

#[derive(Serialize, FromRow)]
pub struct Operation {
    pub id: i32,
    pub creation_date: Option<NaiveDateTime>,
    pub category: Option<i32>,
    pub description: Option<String>,
    pub user_id: i32,
    pub parent_operation: Option<i32>,
    pub account_id: i32,
    pub amount: f64, // mapujemy NUMERIC do f64 dla prostoty
    pub r#type: String, // 'income' lub 'expense'
}

#[derive(Deserialize)]
pub struct CreateOperation {
    pub category: Option<i32>,
    pub description: Option<String>,
    pub user_id: i32,
    pub parent_operation: Option<i32>,
    pub account_id: i32,
    pub amount: f64,
    pub r#type: String,
}

#[derive(Serialize, FromRow)]
pub struct Budget {
    pub id: i32,
    pub user_id: i32,
    pub category_id: i32,
    pub month: NaiveDate,
    pub limit_amount: f64,
}

#[derive(Deserialize)]
pub struct CreateBudget {
    pub user_id: i32,
    pub category_id: i32,
    pub month: NaiveDate,
    pub limit_amount: f64,
}
