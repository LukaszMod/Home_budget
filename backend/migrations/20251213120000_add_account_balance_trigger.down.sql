-- Remove trigger
DROP TRIGGER IF EXISTS trigger_update_account_balance ON operations;

-- Remove functions
DROP FUNCTION IF EXISTS update_account_balance();
DROP FUNCTION IF EXISTS calculate_account_balance(INTEGER);
