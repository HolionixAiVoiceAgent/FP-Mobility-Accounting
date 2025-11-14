-- Migration: add payment_type and employee_id columns to expenses
BEGIN;

ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'account',
  ADD COLUMN IF NOT EXISTS employee_id UUID;

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_expenses_payment_type ON public.expenses (payment_type);
CREATE INDEX IF NOT EXISTS idx_expenses_employee_id ON public.expenses (employee_id);

COMMIT;
