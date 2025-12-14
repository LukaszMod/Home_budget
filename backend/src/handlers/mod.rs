// Handlers modules
pub mod users;
pub mod categories;
pub mod operations;
pub mod budgets;
pub mod goals;
pub mod hashtags;
pub mod recurring_operations;
pub mod transfers;
pub mod accounts_compat;
pub mod import_templates;

// Re-export handlers for easier access
pub use users::*;
pub use categories::*;
pub use operations::*;
pub use budgets::*;
pub use goals::*;
pub use hashtags::*;
pub use recurring_operations::*;
pub use transfers::*;
pub use accounts_compat::*;
pub use import_templates::*;
