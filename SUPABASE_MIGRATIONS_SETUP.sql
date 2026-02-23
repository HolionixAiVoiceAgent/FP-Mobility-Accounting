-- ============================================================================
-- COMPLETE DATABASE SETUP FOR FP MOBILITY
-- Run all migrations in order in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- MIGRATION 1: Create Employees Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN (
    'owner', 'manager', 'sales_manager', 'salesperson', 'accountant', 
    'hr_manager', 'inventory_manager', 'service_advisor'
  )),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  email TEXT UNIQUE,
  phone TEXT,
  hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
  position TEXT,
  department TEXT CHECK (department IN (
    'sales', 'finance', 'operations', 'hr', 'inventory', 'management', 'admin'
  )),
  base_salary NUMERIC(12,2),
  commission_rate NUMERIC(5,2) DEFAULT 0,
  commission_structure JSONB DEFAULT '{"base_salary": 0, "commission_rate": 0, "bonus_per_vehicle": 0}',
  is_active BOOLEAN DEFAULT TRUE,
  manager_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Employees can view own record" ON public.employees;
DROP POLICY IF EXISTS "All users can view employees" ON public.employees;

CREATE POLICY "All users can view employees"
  ON public.employees FOR SELECT
  USING (true);

CREATE INDEX IF NOT EXISTS idx_employees_role ON public.employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_is_active ON public.employees(is_active);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON public.employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON public.employees(email);

-- Insert sample employees for testing
INSERT INTO public.employees (role, first_name, last_name, email, phone, hire_date, position, department, is_active)
VALUES 
  ('manager', 'Navid', 'Galadhari', 'gmbh@fahrzeugpunkt.de', '+49 30 123456', CURRENT_DATE, 'Head of Manager', 'sales', true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- MIGRATION 2: Add payment_type and employee_id columns to expenses
-- ============================================================================
ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'account',
  ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_expenses_payment_type ON public.expenses (payment_type);
CREATE INDEX IF NOT EXISTS idx_expenses_employee_id ON public.expenses (employee_id);

-- ============================================================================
-- MIGRATION 3: Create Employee Cash Advances Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.employee_cash_advances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  advance_amount NUMERIC(12,2) NOT NULL,
  advance_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.employee_cash_advances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "All users can view cash advances" ON public.employee_cash_advances;
DROP POLICY IF EXISTS "All users can insert cash advances" ON public.employee_cash_advances;
DROP POLICY IF EXISTS "All users can delete cash advances" ON public.employee_cash_advances;

CREATE POLICY "All users can view cash advances"
  ON public.employee_cash_advances FOR SELECT
  USING (true);

CREATE POLICY "All users can insert cash advances"
  ON public.employee_cash_advances FOR INSERT
  WITH CHECK (true);

CREATE POLICY "All users can delete cash advances"
  ON public.employee_cash_advances FOR DELETE
  USING (true);

CREATE INDEX IF NOT EXISTS idx_cash_advances_employee ON public.employee_cash_advances(employee_id);
CREATE INDEX IF NOT EXISTS idx_cash_advances_date ON public.employee_cash_advances(advance_date);

-- ============================================================================
-- MIGRATION 4: Create Employee Cash Summary View
-- ============================================================================
CREATE OR REPLACE VIEW public.employee_cash_summary AS
SELECT 
  e.id as employee_id,
  e.full_name,
  COALESCE(SUM(CASE WHEN ca.advance_amount IS NOT NULL THEN ca.advance_amount ELSE 0 END), 0) as total_advanced,
  COALESCE(SUM(CASE WHEN ex.amount IS NOT NULL AND ex.payment_type = 'cash' THEN ex.amount ELSE 0 END), 0) as total_spent,
  COALESCE(SUM(CASE WHEN ca.advance_amount IS NOT NULL THEN ca.advance_amount ELSE 0 END), 0) - 
  COALESCE(SUM(CASE WHEN ex.amount IS NOT NULL AND ex.payment_type = 'cash' THEN ex.amount ELSE 0 END), 0) as remaining
FROM public.employees e
LEFT JOIN public.employee_cash_advances ca ON e.id = ca.employee_id
LEFT JOIN public.expenses ex ON e.id = ex.employee_id
WHERE e.is_active = true
GROUP BY e.id, e.full_name
ORDER BY e.full_name;

-- ============================================================================
-- MIGRATION 5: Update Expenses Table RLS Policies
-- ============================================================================
DROP POLICY IF EXISTS "Enable all operations for expenses" ON public.expenses;
DROP POLICY IF EXISTS "Admins can view expenses" ON public.expenses;
DROP POLICY IF EXISTS "Employees can view expenses" ON public.expenses;
DROP POLICY IF EXISTS "All users can view expenses" ON public.expenses;
DROP POLICY IF EXISTS "All users can insert expenses" ON public.expenses;
DROP POLICY IF EXISTS "All users can update expenses" ON public.expenses;
DROP POLICY IF EXISTS "All users can delete expenses" ON public.expenses;

CREATE POLICY "All users can view expenses"
  ON public.expenses FOR SELECT
  USING (true);

CREATE POLICY "All users can insert expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "All users can update expenses"
  ON public.expenses FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "All users can delete expenses"
  ON public.expenses FOR DELETE
  USING (true);

-- ============================================================================
-- MIGRATION 6: Fix Financial Obligations RLS Policies
-- ============================================================================
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Financial obligations select policy" ON public.financial_obligations;
DROP POLICY IF EXISTS "Financial obligations insert policy" ON public.financial_obligations;
DROP POLICY IF EXISTS "Financial obligations update policy" ON public.financial_obligations;
DROP POLICY IF EXISTS "Financial obligations delete policy" ON public.financial_obligations;

-- Create permissive RLS policies for demo mode (allow all operations)
CREATE POLICY "Financial obligations select policy" ON public.financial_obligations FOR SELECT USING (true);
CREATE POLICY "Financial obligations insert policy" ON public.financial_obligations FOR INSERT WITH CHECK (true);
CREATE POLICY "Financial obligations update policy" ON public.financial_obligations FOR UPDATE USING (true);
CREATE POLICY "Financial obligations delete policy" ON public.financial_obligations FOR DELETE USING (true);

-- ============================================================================
-- DONE! All migrations applied successfully
-- ============================================================================
-- Verify setup:
-- SELECT * FROM public.employees;
-- SELECT * FROM public.employee_cash_advances;
-- SELECT * FROM public.employee_cash_summary;
