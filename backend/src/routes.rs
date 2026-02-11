use crate::handlers::*;

use axum::{
    routing::{get, post, delete},
    Router,
};

use crate::AppState;

pub fn router() -> Router<AppState> {
    Router::new()
        // Users
        .route("/users", post(create_user).get(list_users))
        .route("/users/:id", get(get_user).put(update_user).delete(delete_user))
        // Categories
        .route("/categories", post(create_category).get(list_categories))
        .route("/categories/reorder", post(reorder_categories))
        .route("/categories/:id", get(get_category).put(update_category).delete(delete_category))
        .route("/categories/:id/toggle-hidden", post(toggle_category_hidden))
        .route("/categories/in-use", get(is_category_used))
        // Accounts (backward compatibility - maps to liquid assets)
        .route("/accounts", get(list_accounts_compat))
        .route("/accounts/:id/toggle-closed", post(toggle_account_closed_compat))
        // Assets (new system)
        .route("/asset-types", get(list_asset_types))
        .route("/assets", post(create_asset).get(list_assets))
        .route("/assets/reorder", post(reorder_assets))
        .route("/assets/:id", get(get_asset).put(update_asset).delete(delete_asset))
        .route("/assets/:id/toggle-active", post(toggle_asset_active))
        .route("/assets/:id/correct-balance", post(correct_balance))
        // Investment Transactions
        .route("/investment-transactions", post(create_investment_transaction))
        .route("/assets/:id/investment-transactions", get(list_investment_transactions))
        .route("/investment-transactions/:id", delete(delete_investment_transaction))
        // Asset Valuations
        .route("/asset-valuations", post(create_asset_valuation))
        .route("/assets/:id/valuations", get(list_asset_valuations))
        .route("/asset-valuations/:id", delete(delete_asset_valuation))
        // Operations
        .route("/operations", post(create_operation).get(list_operations))
        .route("/operations/classify-transfers", post(classify_uncategorized_operations))
        .route("/operations/transfer", post(transfer_operation))
        .route("/operations/:id/split", post(split_operation))
        .route("/operations/:id/unsplit", delete(unsplit_operation))
        .route("/operations/:id/children", get(get_operation_children))
        .route("/operations/:id", get(get_operation).put(update_operation).delete(delete_operation))
        // Budgets
        .route("/budgets", post(create_budget).get(list_budgets))
        .route("/budgets/data/:month", get(get_budget_data_for_month))
        .route("/budgets/:id", get(get_budget).delete(delete_budget))
        .route("/budgets/update", post(update_budgets))
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
        // Import Templates
        .route("/import-templates", post(create_import_template).get(list_import_templates))
        .route("/import-templates/:id", get(get_import_template).put(update_import_template).delete(delete_import_template))
}

