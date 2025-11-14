-- Add hourly_rate column to employees and backfill from base_salary
ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(10,2);

-- Backfill hourly_rate where base_salary exists and hourly_rate is null
-- Default monthly working hours assumed: 160 (configurable in app if desired)
UPDATE public.employees
SET hourly_rate = ROUND((base_salary / 160.0)::numeric, 2)
WHERE hourly_rate IS NULL AND base_salary IS NOT NULL;

-- Optional: ensure future inserts include hourly_rate in API or UI
-- Done: EmployeeManagement component now writes hourly_rate when provided

-- Verify
-- SELECT id, full_name, base_salary, hourly_rate FROM public.employees LIMIT 10;
