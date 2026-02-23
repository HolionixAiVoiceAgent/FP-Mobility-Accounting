-- ============================================================================
-- Drop ALL check constraints from vehicle_sales table
-- This handles any constraint name variations
-- ============================================================================

-- First, let's drop constraints by pattern (Supabase generates names)
DO $$ 
DECLARE 
    constraint_name TEXT;
BEGIN
    FOR constraint_name IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'public.vehicle_sales'::regclass
        AND contype = 'c'
    LOOP
        EXECUTE 'ALTER TABLE public.vehicle_sales DROP CONSTRAINT IF EXISTS ' || quote_ident(constraint_name);
        RAISE NOTICE 'Dropped constraint: %', constraint_name;
    END LOOP;
END $$;

-- Now recreate the payment_method constraint with NULL allowed
ALTER TABLE public.vehicle_sales ADD CONSTRAINT vehicle_sales_payment_method_check
CHECK (payment_method IS NULL OR payment_method IN (
    'cash', 'financing', 'bank_transfer', 'installments', 
    'debit_card', 'credit_card', 'leasing', 'check', ''
));

-- Recreate payment_status constraint
ALTER TABLE public.vehicle_sales ADD CONSTRAINT vehicle_sales_payment_status_check
CHECK (payment_status IN ('pending', 'partial', 'completed', 'overdue', 'paid'));

-- Make sure nullable columns don't require values
ALTER TABLE public.vehicle_sales ALTER COLUMN payment_method DROP NOT NULL;
ALTER TABLE public.vehicle_sales ALTER COLUMN notes DROP NOT NULL;
ALTER TABLE public.vehicle_sales ALTER COLUMN profit DROP NOT NULL;

-- ============================================================================
-- END OF FIX
-- ============================================================================

