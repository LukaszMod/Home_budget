use crate::handlers::*;

use axum::{
    routing::{get, post, put, delete},
    Router, extract::{Path, State}, Json
};

use crate::{AppState};
use crate::models::*;

pub fn router() -> Router<AppState> {
    Router::new()
        // Users
        .route("/users", post(create_user).get(list_users))
        .route("/users/:id", get(get_user).put(update_user).delete(delete_user))
        // Categories
        .route("/categories", post(create_category).get(list_categories))
        .route("/categories/:id", get(get_category).put(update_category).delete(delete_category))
        // Accounts
        .route("/accounts", post(create_account).get(list_accounts))
        .route("/accounts/:id", get(get_account).put(update_account).delete(delete_account))
        // Operations
        .route("/operations", post(create_operation).get(list_operations))
        .route("/operations/:id", get(get_operation).put(update_operation).delete(delete_operation))
        .route("/operations/:id/children", get(list_child_operations))
        // Budgets
        .route("/budgets", post(create_budget).get(list_budgets))
        .route("/budgets/:id", get(get_budget).put(update_budget).delete(delete_budget))
}
