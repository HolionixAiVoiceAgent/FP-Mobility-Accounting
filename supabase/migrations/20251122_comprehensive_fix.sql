-- ============================================================================
-- Comprehensive fix for vehicle_sales INSERT issues
-- Drops and recreates check constraints to allow all UI values
-- ============================================================================

-- Step 1: Drop all check constraints on vehicle_sales
ALTER TABLE public.vehicle_sales DROP CONSTRAINT IF EXISTS vehicle_sales_payment_method_check;
ALTER TABLE public.vehicle_sales DROP CONSTRAINT IF EXISTS vehicle_sales_payment_status_check;
ALTER TABLE public.vehicle_sales DROP CONSTRAINT IF EXISTS vehicle_sales_type_check;
ALTER TABLE public.vehicle_sales DROP CONSTRAINT IF EXISTS vehicle_sales_status_check;

-- Step 2: Drop the generated profit column and recreate as regular nullable column
ALTER TABLE public.vehicle_sales ALTER COLUMN profit DROP EXPRESSION;
ALTER TABLE public.vehicle_sales ALTER COLUMN profit DROP NOT NULL;

-- Step 3: Recreate check constraints with all allowed values
-- payment_method - allow all UI options
ALTER TABLE public.vehicle_sales ADD CONSTRAINT vehicle_sales_payment_method_check
CHECK (payment_method IS NULL OR payment_method IN (
  'cash', 'financing', 'bank_transfer', 'installments', 
  'debit_card', 'credit_card', 'leasing', 'check'
));

-- payment_status - allow all UI options
ALTER TABLE public.vehicle_sales ADD CONSTRAINT vehicle_sales_payment_status_check
CHECK (payment_status IN ('pending', 'partial', 'completed', 'overdue', 'paid'));

-- Ensure nullable columns
ALTER TABLE public.vehicle_sales ALTER COLUMN payment_method DROP NOT NULL;
ALTER TABLE public.vehicle_sales ALTER COLUMN notes DROP NOT NULL;

-- ============================================================================
-- END OF FIX
-- ============================================================================

