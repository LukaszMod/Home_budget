use crate::handlers::*;
use crate::asset_handlers;

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
        // Accounts (legacy - backward compatibility)
        .route("/accounts", post(create_account).get(list_accounts))
        .route("/accounts/:id", get(get_account).put(update_account).delete(delete_account))
        .route("/accounts/:id/toggle-closed", post(toggle_account_closed))
        // Assets (new system)
        .route("/asset-types", get(asset_handlers::list_asset_types))
        .route("/assets", post(asset_handlers::create_asset).get(asset_handlers::list_assets))
        .route("/assets/:id", get(asset_handlers::get_asset).put(asset_handlers::update_asset).delete(asset_handlers::delete_asset))
        .route("/assets/:id/toggle-active", post(asset_handlers::toggle_asset_active))
        // Investment Transactions
        .route("/investment-transactions", post(asset_handlers::create_investment_transaction))
        .route("/assets/:id/investment-transactions", get(asset_handlers::list_investment_transactions))
        .route("/investment-transactions/:id", delete(asset_handlers::delete_investment_transaction))
        // Asset Valuations
        .route("/asset-valuations", post(asset_handlers::create_asset_valuation))
        .route("/assets/:id/valuations", get(asset_handlers::list_asset_valuations))
        .route("/asset-valuations/:id", delete(asset_handlers::delete_asset_valuation))
        // Operations
        .route("/operations", post(create_operation).get(list_operations))
        .route("/operations/:id", get(get_operation).put(update_operation).delete(delete_operation))
        // Budgets
        .route("/budgets", post(create_budget).get(list_budgets))
        .route("/budgets/:id", get(get_budget).put(update_budget).delete(delete_budget))
        // Goals
        .route("/goals", post(create_goal).get(list_goals))
        .route("/goals/:id", get(get_goal).put(update_goal).delete(delete_goal))
        .route("/goals/:id/complete", post(complete_goal))
        // Hashtags
        .route("/hashtags", post(create_hashtag).get(get_hashtags))
        .route("/hashtags/:id", delete(delete_hashtag))
        .route("/hashtags/extract", post(extract_hashtags_from_text))
        // Recurring Operations
        .route("/recurring-operations", post(create_recurring_operation).get(list_recurring_operations))
        .route("/recurring-operations/:id", get(get_recurring_operation).put(update_recurring_operation).delete(delete_recurring_operation))
}

