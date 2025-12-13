-- Add function to calculate and update account balance
CREATE OR REPLACE FUNCTION calculate_account_balance(p_asset_id INTEGER)
RETURNS DECIMAL(15, 2) AS $$
DECLARE
    v_balance DECIMAL(15, 2);
BEGIN
    -- Calculate balance from operations
    -- Income adds to balance, expense subtracts from balance
    -- Skip operations that are children of split operations (parent_operation_id IS NOT NULL)
    SELECT COALESCE(
        SUM(
            CASE 
                WHEN operation_type = 'income' THEN amount
                WHEN operation_type = 'expense' THEN -amount
                ELSE 0
            END
        ), 
        0
    )
    INTO v_balance
    FROM operations
    WHERE asset_id = p_asset_id
      AND parent_operation_id IS NULL;  -- Skip split children
    
    RETURN v_balance;
END;
$$ LANGUAGE plpgsql;

-- Function to update account balance in assets table
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
DECLARE
    v_old_asset_id INTEGER;
    v_new_asset_id INTEGER;
    v_balance DECIMAL(15, 2);
BEGIN
    -- Determine which asset_id(s) to update
    IF TG_OP = 'DELETE' THEN
        v_old_asset_id := OLD.asset_id;
    ELSIF TG_OP = 'UPDATE' THEN
        v_old_asset_id := OLD.asset_id;
        v_new_asset_id := NEW.asset_id;
    ELSIF TG_OP = 'INSERT' THEN
        v_new_asset_id := NEW.asset_id;
    END IF;

    -- Update old asset if it exists and operation is not a split child
    IF v_old_asset_id IS NOT NULL AND (TG_OP = 'DELETE' OR OLD.parent_operation_id IS NULL) THEN
        v_balance := calculate_account_balance(v_old_asset_id);
        UPDATE assets 
        SET current_valuation = v_balance
        WHERE id = v_old_asset_id;
    END IF;

    -- Update new asset if it exists and is different from old, and operation is not a split child
    IF v_new_asset_id IS NOT NULL 
       AND (v_old_asset_id IS NULL OR v_new_asset_id != v_old_asset_id)
       AND (TG_OP = 'INSERT' AND NEW.parent_operation_id IS NULL) THEN
        v_balance := calculate_account_balance(v_new_asset_id);
        UPDATE assets 
        SET current_valuation = v_balance
        WHERE id = v_new_asset_id;
    END IF;

    -- Return appropriate value based on operation
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on operations table
DROP TRIGGER IF EXISTS trigger_update_account_balance ON operations;
CREATE TRIGGER trigger_update_account_balance
    AFTER INSERT OR UPDATE OR DELETE ON operations
    FOR EACH ROW
    EXECUTE FUNCTION update_account_balance();

-- Initial calculation: Update all existing liquid and liability accounts
DO $$
DECLARE
    v_asset RECORD;
    v_balance DECIMAL(15, 2);
BEGIN
    FOR v_asset IN 
        SELECT a.id, a.asset_type_id, at.category
        FROM assets a
        JOIN asset_types at ON a.asset_type_id = at.id
        WHERE at.category IN ('liquid', 'liability')
    LOOP
        v_balance := calculate_account_balance(v_asset.id);
        UPDATE assets 
        SET current_valuation = v_balance
        WHERE id = v_asset.id;
        
        RAISE NOTICE 'Updated asset % balance to %', v_asset.id, v_balance;
    END LOOP;
END $$;
