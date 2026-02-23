-- ============================================================================
-- ADD SAMPLE DATA FOR DASHBOARD ANALYTICS
-- This provides sample vehicle sales and expenses to test the dashboard charts
-- ============================================================================

-- Insert sample vehicle sales data for the last 6 months
INSERT INTO public.vehicle_sales (
  sale_id, customer_id, vehicle_make, vehicle_model, vehicle_year, vin,
  purchase_price, sale_price, sale_date, payment_status, payment_method
)
SELECT 
  'SALE-' || generate_series || '-' || substring(md5(random()::text) from 1 for 4) as sale_id,
  (SELECT id FROM public.customers ORDER BY RANDOM() LIMIT 1) as customer_id,
  CASE (random() * 4)::int
    WHEN 0 THEN 'BMW'
    WHEN 1 THEN 'Mercedes'
    WHEN 2 THEN 'Audi'
    WHEN 3 THEN 'Volkswagen'
    ELSE 'Ford'
  END as vehicle_make,
  CASE (random() * 5)::int
    WHEN 0 THEN '320i'
    WHEN 1 THEN 'C200'
    WHEN 2 THEN 'A4'
    WHEN 3 THEN 'Golf GTI'
    WHEN 4 THEN 'Focus'
    ELSE 'X3'
  END as vehicle_model,
  2020 + (random() * 4)::int as vehicle_year,
  'VIN' || generate_series || '-' || substring(md5(random()::text) from 1 for 8) as vin,
  15000 + (random() * 20000)::int as purchase_price,
  20000 + (random() * 25000)::int as sale_price,
  CURRENT_DATE - (random() * 180)::int * INTERVAL '1 day' as sale_date,
  (ARRAY['paid', 'pending', 'partial'])[1 + (random() * 2)::int] as payment_status,
  (ARRAY['cash', 'financing', 'bank_transfer'])[1 + (random() * 2)::int] as payment_method
FROM generate_series(1, 50);

-- Insert sample expenses data for the last 6 months
INSERT INTO public.expenses (
  expense_id, category, description, amount, date, vendor
)
SELECT 
  'EXP-' || generate_series || '-' || substring(md5(random()::text) from 1 for 4) as expense_id,
  (ARRAY['Office Rent', 'Vehicle Insurance', 'Staff Salaries', 'Maintenance', 'Marketing', 'Utilities', 'Office Supplies'])[1 + (random() * 6)::int] as category,
  'Sample expense ' || generate_series as description,
  100 + (random() * 5000)::int as amount,
  CURRENT_DATE - (random() * 180)::int * INTERVAL '1 day' as date,
  (ARRAY['Landlord Inc', 'Insurance Co', 'Staff Payroll', 'Auto Shop', 'Marketing Agency', 'Utility Co', 'Office Store'])[1 + (random() * 6)::int] as vendor
FROM generate_series(1, 100);

-- Verify data was inserted
SELECT 
  'Vehicle Sales' as table_name,
  COUNT(*) as record_count,
  SUM(sale_price) as total_revenue,
  COUNT(DISTINCT TO_CHAR(sale_date, 'YYYY-MM')) as months_with_sales
FROM public.vehicle_sales
UNION ALL
SELECT 
  'Expenses' as table_name,
  COUNT(*) as record_count,
  SUM(amount) as total_amount,
  COUNT(DISTINCT TO_CHAR(date, 'YYYY-MM')) as months_with_expenses
FROM public.expenses;

-- Show monthly breakdown
SELECT 
  'Sales' as data_type,
  TO_CHAR(sale_date, 'YYYY-MM') as month,
  COUNT(*) as count,
  SUM(sale_price) as amount
FROM public.vehicle_sales
GROUP BY TO_CHAR(sale_date, 'YYYY-MM')
UNION ALL
SELECT 
  'Expenses' as data_type,
  TO_CHAR(date, 'YYYY-MM') as month,
  COUNT(*) as count,
  SUM(amount) as amount
FROM public.expenses
GROUP BY TO_CHAR(date, 'YYYY-MM')
ORDER BY month DESC, data_type;

