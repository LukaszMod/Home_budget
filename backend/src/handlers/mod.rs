// Handlers modules
pub mod accounts_compat;
pub mod assets;
pub mod budgets;
pub mod categories;
pub mod goals;
pub mod hashtags;
pub mod import_templates;
pub mod operations;
pub mod recurring_operations;
pub mod transfers;
pub mod users;

// Re-export handlers for easier access
pub use accounts_compat::*;
pub use assets::*;
pub use budgets::*;
pub use categories::*;
pub use goals::*;
pub use hashtags::*;
pub use import_templates::*;
pub use operations::*;
pub use recurring_operations::*;
pub use transfers::*;
pub use users::*;
