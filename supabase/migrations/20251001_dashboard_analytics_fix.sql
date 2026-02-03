-- ============================================================================
-- DASHBOARD ANALYTICS OPTIMIZATION MIGRATION
-- Fixes for dashboard analytical SQL queries
-- ============================================================================

-- Create a view for monthly revenue aggregation
CREATE OR REPLACE VIEW public.monthly_revenue AS
SELECT 
  TO_CHAR(sale_date, 'YYYY-MM') as month,
  COUNT(*) as vehicles_sold,
  SUM(sale_price) as total_revenue,
  AVG(sale_price) as avg_price,
  SUM(sale_price - purchase_price) as total_profit
FROM public.vehicle_sales
GROUP BY TO_CHAR(sale_date, 'YYYY-MM')
ORDER BY month DESC;

-- Create a view for monthly expenses aggregation
CREATE OR REPLACE VIEW public.monthly_expenses AS
SELECT 
  TO_CHAR(date, 'YYYY-MM') as month,
  COUNT(*) as expense_count,
  SUM(amount) as total_amount,
  category
FROM public.expenses
GROUP BY TO_CHAR(date, 'YYYY-MM'), category
ORDER BY month DESC;

-- Create a comprehensive dashboard metrics view
CREATE OR REPLACE VIEW public.dashboard_metrics AS
WITH revenue_data AS (
  SELECT 
    TO_CHAR(sale_date, 'YYYY-MM') as month,
    SUM(sale_price) as revenue,
    SUM(sale_price - purchase_price) as profit,
    COUNT(*) as vehicles_sold
  FROM public.vehicle_sales
  GROUP BY TO_CHAR(sale_date, 'YYYY-MM')
),
expense_data AS (
  SELECT 
    TO_CHAR(date, 'YYYY-MM') as month,
    SUM(amount) as expenses
  FROM public.expenses
  GROUP BY TO_CHAR(date, 'YYYY-MM')
)
SELECT 
  COALESCE(r.month, e.month) as month,
  COALESCE(r.revenue, 0) as revenue,
  COALESCE(e.expenses, 0) as expenses,
  COALESCE(r.revenue, 0) - COALESCE(e.expenses, 0) as net_profit,
  CASE 
    WHEN COALESCE(r.revenue, 0) > 0 
    THEN ((COALESCE(r.revenue, 0) - COALESCE(e.expenses, 0)) / COALESCE(r.revenue, 0)) * 100 
    ELSE 0 
  END as margin_percent,
  COALESCE(r.vehicles_sold, 0) as vehicles_sold
FROM revenue_data r
FULL OUTER JOIN expense_data e ON r.month = e.month
ORDER BY month DESC;

-- Create function for current month stats
CREATE OR REPLACE FUNCTION public.get_current_month_stats()
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
  current_month TEXT;
  current_year INTEGER;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE);
  current_month := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
  
  SELECT json_build_object(
    'month', current_month,
    'total_sales', (
      SELECT COALESCE(SUM(sale_price), 0)
      FROM public.vehicle_sales
      WHERE TO_CHAR(sale_date, 'YYYY-MM') = current_month
    ),
    'vehicles_sold', (
      SELECT COUNT(*)
      FROM public.vehicle_sales
      WHERE TO_CHAR(sale_date, 'YYYY-MM') = current_month
    ),
    'total_expenses', (
      SELECT COALESCE(SUM(amount), 0)
      FROM public.expenses
      WHERE TO_CHAR(date, 'YYYY-MM') = current_month
    ),
    'expense_count', (
      SELECT COUNT(*)
      FROM public.expenses
      WHERE TO_CHAR(date, 'YYYY-MM') = current_month
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Create function for last 12 months analytics
CREATE OR REPLACE FUNCTION public.get_last_12_months_analytics()
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'month', month,
      'revenue', revenue,
      'expenses', expenses,
      'net_profit', net_profit,
      'margin', margin_percent,
      'vehicles_sold', vehicles_sold
    ) ORDER BY month ASC
  ) INTO result
  FROM public.dashboard_metrics
  WHERE month >= TO_CHAR(CURRENT_DATE - INTERVAL '12 months', 'YYYY-MM');
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Create function for expense breakdown by category
CREATE OR REPLACE FUNCTION public.get_expense_breakdown(p_month TEXT DEFAULT NULL)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
  target_month TEXT;
BEGIN
  IF p_month IS NULL THEN
    target_month := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
  ELSE
    target_month := p_month;
  END IF;
  
  SELECT json_agg(
    json_build_object(
      'category', category,
      'total', total_amount,
      'count', expense_count
    ) ORDER BY total_amount DESC
  ) INTO result
  FROM (
    SELECT 
      category,
      SUM(amount) as total_amount,
      COUNT(*) as expense_count
    FROM public.expenses
    WHERE TO_CHAR(date, 'YYYY-MM') = target_month
    GROUP BY category
  ) sub;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Create function for inventory statistics
CREATE OR REPLACE FUNCTION public.get_inventory_stats()
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_vehicles', (SELECT COUNT(*) FROM public.inventory),
    'available_vehicles', (SELECT COUNT(*) FROM public.inventory WHERE status = 'available'),
    'sold_this_month', (
      SELECT COUNT(*) 
      FROM public.inventory 
      WHERE status = 'sold' 
      AND TO_CHAR(sale_date, 'YYYY-MM') = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
    ),
    'avg_days_in_stock', (
      SELECT CASE 
        WHEN COUNT(*) > 0 
        THEN AVG(EXTRACT(DAY FROM (COALESCE(sale_date, CURRENT_DATE) - purchase_date)))
        ELSE 0 
      END
      FROM public.inventory
    ),
    'total_inventory_value', (
      SELECT COALESCE(SUM(expected_sale_price), 0)
      FROM public.inventory
      WHERE status = 'available'
    ),
    'pending_repairs', (SELECT COUNT(*) FROM public.inventory WHERE status = 'pending_repair')
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_vehicle_sales_sale_date ON public.vehicle_sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_vehicle_sales_month ON public.vehicle_sales((TO_CHAR(sale_date, 'YYYY-MM')));
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_month ON public.expenses((TO_CHAR(date, 'YYYY-MM')));
CREATE INDEX IF NOT EXISTS idx_inventory_status ON public.inventory(status);
CREATE INDEX IF NOT EXISTS idx_inventory_sale_date ON public.inventory(sale_date);

-- Grant access to the views and functions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Verify the migration
-- SELECT * FROM public.dashboard_metrics LIMIT 12;
-- SELECT public.get_current_month_stats();
-- SELECT public.get_last_12_months_analytics();
-- SELECT public.get_expense_breakdown();
-- SELECT public.get_inventory_stats();

