-- migrate:up

-- Dodaj kolumnę do śledzenia powiązanych operacji transferowych
ALTER TABLE operations ADD COLUMN IF NOT EXISTS linked_operation_id INT REFERENCES operations(id) ON DELETE SET NULL;

-- Create system categories for transfers
DO $$
DECLARE
    v_parent_id INT;
    v_outgoing_id INT;
    v_incoming_id INT;
BEGIN
    -- Check if "Transfer" category already exists
    SELECT id INTO v_parent_id FROM categories WHERE name = 'Transfer' AND parent_id IS NULL AND is_system = TRUE;
    
    IF v_parent_id IS NULL THEN
        -- Create parent category "Transfer"
        INSERT INTO categories (name, parent_id, type, is_system)
        VALUES ('Transfer', NULL, 'expense', TRUE)
        RETURNING id INTO v_parent_id;
        
        RAISE NOTICE 'Created parent category "Transfer" with id: %', v_parent_id;
    END IF;
    
    -- Check and create "Outgoing"
    SELECT id INTO v_outgoing_id FROM categories WHERE name = 'Outgoing' AND parent_id = v_parent_id;
    
    IF v_outgoing_id IS NULL THEN
        INSERT INTO categories (name, parent_id, type, is_system)
        VALUES ('Outgoing', v_parent_id, 'expense', TRUE)
        RETURNING id INTO v_outgoing_id;
        
        RAISE NOTICE 'Created subcategory "Outgoing" with id: %', v_outgoing_id;
    END IF;
    
    -- Check and create "Incoming"
    SELECT id INTO v_incoming_id FROM categories WHERE name = 'Incoming' AND parent_id = v_parent_id;
    
    IF v_incoming_id IS NULL THEN
        INSERT INTO categories (name, parent_id, type, is_system)
        VALUES ('Incoming', v_parent_id, 'income', TRUE)
        RETURNING id INTO v_incoming_id;
        
        RAISE NOTICE 'Created subcategory "Incoming" with id: %', v_incoming_id;
    END IF;
END $$;

-- Funkcja do automatycznej klasyfikacji operacji bez kategorii jako przelew
CREATE OR REPLACE FUNCTION classify_uncategorized_as_transfers()
RETURNS TABLE(
    operation_id INT,
    old_category_id INT,
    new_category_id INT,
    amount NUMERIC,
    operation_type operation_type
) AS $$
DECLARE
    v_outgoing_category_id INT;
    v_incoming_category_id INT;
    v_operation RECORD;
    v_updated_count INT := 0;
BEGIN
    -- Get transfer category IDs
    SELECT c_out.id, c_in.id 
    INTO v_outgoing_category_id, v_incoming_category_id
    FROM categories c_parent
    LEFT JOIN categories c_out ON c_out.parent_id = c_parent.id AND c_out.name = 'Outgoing'
    LEFT JOIN categories c_in ON c_in.parent_id = c_parent.id AND c_in.name = 'Incoming'
    WHERE c_parent.name = 'Transfer' AND c_parent.parent_id IS NULL;
    
    IF v_outgoing_category_id IS NULL OR v_incoming_category_id IS NULL THEN
        RAISE EXCEPTION 'Transfer categories not found. Please ensure migration has been run properly.';
    END IF;
    
    -- Iteruj przez wszystkie operacje bez kategorii
    FOR v_operation IN 
        SELECT o.id, o.category_id, o.amount, o.operation_type
        FROM operations o
        WHERE o.category_id IS NULL
    LOOP
        -- If amount is negative (expense), assign "Outgoing"
        IF v_operation.amount < 0 THEN
            UPDATE operations 
            SET category_id = v_outgoing_category_id,
                operation_type = 'expense'
            WHERE id = v_operation.id;
            
            operation_id := v_operation.id;
            old_category_id := v_operation.category_id;
            new_category_id := v_outgoing_category_id;
            amount := v_operation.amount;
            operation_type := 'expense';
            v_updated_count := v_updated_count + 1;
            RETURN NEXT;
            
        -- If amount is positive (income), assign "Incoming"
        ELSIF v_operation.amount > 0 THEN
            UPDATE operations 
            SET category_id = v_incoming_category_id,
                operation_type = 'income'
            WHERE id = v_operation.id;
            
            operation_id := v_operation.id;
            old_category_id := v_operation.category_id;
            new_category_id := v_incoming_category_id;
            amount := v_operation.amount;
            operation_type := 'income';
            v_updated_count := v_updated_count + 1;
            RETURN NEXT;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Classified % operations as transfers', v_updated_count;
END;
$$ LANGUAGE plpgsql;

-- Funkcja do tworzenia pary powiązanych operacji transferowych
CREATE OR REPLACE FUNCTION create_linked_transfer(
    p_source_account_id INT,
    p_target_account_id INT,
    p_amount NUMERIC,
    p_operation_date DATE,
    p_description TEXT DEFAULT NULL
)
RETURNS TABLE(
    outgoing_operation_id INT,
    incoming_operation_id INT
) AS $$
DECLARE
    v_outgoing_category_id INT;
    v_incoming_category_id INT;
    v_outgoing_id INT;
    v_incoming_id INT;
BEGIN
    -- Get transfer category IDs
    SELECT c_out.id, c_in.id 
    INTO v_outgoing_category_id, v_incoming_category_id
    FROM categories c_parent
    LEFT JOIN categories c_out ON c_out.parent_id = c_parent.id AND c_out.name = 'Outgoing'
    LEFT JOIN categories c_in ON c_in.parent_id = c_parent.id AND c_in.name = 'Incoming'
    WHERE c_parent.name = 'Transfer' AND c_parent.parent_id IS NULL;
    
    IF v_outgoing_category_id IS NULL OR v_incoming_category_id IS NULL THEN
        RAISE EXCEPTION 'Transfer categories not found';
    END IF;
    
    -- Create outgoing operation (negative amount)
    INSERT INTO operations (category_id, description, account_id, amount, operation_type, operation_date)
    VALUES (v_outgoing_category_id, p_description, p_source_account_id, -ABS(p_amount), 'expense', p_operation_date)
    RETURNING id INTO v_outgoing_id;
    
    -- Create incoming operation (positive amount)
    INSERT INTO operations (category_id, description, account_id, amount, operation_type, operation_date, linked_operation_id)
    VALUES (v_incoming_category_id, p_description, p_target_account_id, ABS(p_amount), 'income', p_operation_date, v_outgoing_id)
    RETURNING id INTO v_incoming_id;
    
    -- Update outgoing operation to point to incoming
    UPDATE operations SET linked_operation_id = v_incoming_id WHERE id = v_outgoing_id;
    
    outgoing_operation_id := v_outgoing_id;
    incoming_operation_id := v_incoming_id;
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Trigger do automatycznego usuwania powiązanych operacji transferowych
CREATE OR REPLACE FUNCTION delete_linked_transfer()
RETURNS TRIGGER AS $$
BEGIN
    -- If deleted operation has a linked operation, delete it too
    IF OLD.linked_operation_id IS NOT NULL THEN
        DELETE FROM operations WHERE id = OLD.linked_operation_id;
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_delete_linked_transfer
    BEFORE DELETE ON operations
    FOR EACH ROW
    WHEN (OLD.linked_operation_id IS NOT NULL)
    EXECUTE FUNCTION delete_linked_transfer();

-- Automatically classify existing uncategorized operations
SELECT * FROM classify_uncategorized_as_transfers();
