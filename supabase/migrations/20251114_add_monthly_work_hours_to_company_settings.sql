-- Add monthly_work_hours to company_settings
ALTER TABLE IF EXISTS public.company_settings
  ADD COLUMN IF NOT EXISTS monthly_work_hours INTEGER DEFAULT 160;

-- Backfill any NULLs with 160
UPDATE public.company_settings
SET monthly_work_hours = 160
WHERE monthly_work_hours IS NULL;

-- Verify
-- SELECT id, company_name, monthly_work_hours FROM public.company_settings LIMIT 10;
