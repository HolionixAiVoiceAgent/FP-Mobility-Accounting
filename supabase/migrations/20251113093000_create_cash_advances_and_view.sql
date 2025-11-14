-- Migration: create employee_cash_advances table and employee_cash_summary view
BEGIN;

-- Create table to track cash advances given to employees
CREATE TABLE IF NOT EXISTS public.employee_cash_advances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL,
  advance_amount numeric NOT NULL,
  advance_date date DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_employee_cash_advances_employee_id ON public.employee_cash_advances (employee_id);

-- Create a view that aggregates advances and cash expenses per employee
-- Assumes `employees` table exists with columns (id, full_name)
CREATE OR REPLACE VIEW public.employee_cash_summary AS
  SELECT
    emp.id AS employee_id,
    emp.full_name,
    COALESCE(SUM(a.advance_amount), 0) AS total_advanced,
    COALESCE(SUM(e.amount), 0) AS total_spent,
    COALESCE(SUM(a.advance_amount), 0) - COALESCE(SUM(e.amount), 0) AS remaining
  FROM (
    SELECT id, full_name FROM public.employees
  ) emp
  LEFT JOIN public.employee_cash_advances a ON a.employee_id = emp.id
  LEFT JOIN (
    SELECT employee_id, SUM(amount) AS amount
    FROM public.expenses
    WHERE payment_type = 'cash'
    GROUP BY employee_id
  ) e ON e.employee_id = emp.id
  GROUP BY emp.id, emp.full_name;

COMMIT;
