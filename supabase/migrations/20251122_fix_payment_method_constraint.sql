-- ============================================================================
-- Fix vehicle_sales payment_method check constraint
-- Add 'installments' to allowed payment methods
-- ============================================================================

-- Drop the existing check constraint
ALTER TABLE public.vehicle_sales DROP CONSTRAINT IF EXISTS vehicle_sales_payment_method_check;

-- Add the check constraint with installments included
ALTER TABLE public.vehicle_sales ADD CONSTRAINT vehicle_sales_payment_method_check
CHECK (payment_method IN ('cash', 'financing', 'bank_transfer', 'installments', 'debit_card', 'credit_card', 'leasing'));

-- ============================================================================
-- END OF FIX
-- ============================================================================

