# Dashboard Performance Optimization Guide

## Current State
- Dashboard uses React Query with 5s refetch intervals for real-time updates
- Frontend performs metric aggregations via hooks (useInventoryStats, useVehicleSalesStats, etc.)
- Real-time subscriptions via Supabase postgres_changes channel

## Performance Recommendations

### 1. Move Aggregations to Supabase Views (SQL Level)
Create materialized views in Supabase for heavy aggregations:

```sql
-- Example: Monthly financial metrics view
CREATE MATERIALIZED VIEW dashboard_monthly_metrics AS
SELECT
  DATE_TRUNC('month', sales.created_at)::date as month,
  SUM(sales.sale_price) as revenue,
  SUM(expenses.amount) as expenses,
  SUM(sales.sale_price) - SUM(expenses.amount) as net_profit,
  COUNT(DISTINCT sales.id) as vehicles_sold
FROM vehicle_sales sales
LEFT JOIN expenses ON DATE_TRUNC('month', expenses.created_at) = DATE_TRUNC('month', sales.created_at)
GROUP BY DATE_TRUNC('month', sales.created_at);

-- Add index for fast queries
CREATE INDEX idx_dashboard_monthly_metrics_month ON dashboard_monthly_metrics(month DESC);
```

### 2. Implement Caching Strategy
- **Network-first**: For frequently changing data (sales, inventory status)
- **Cache-first**: For reference data (vehicle models, customer types)
- **Stale-while-revalidate**: For dashboard metrics (revalidate every 5-10 minutes)

### 3. Pagination & Windowing
- Implement infinite scroll or pagination for large lists
- Use React Window for virtualizing long lists
- Limit initial fetch to 50-100 items, load more on scroll

### 4. Code Splitting & Lazy Loading
- Lazy load dashboard widgets using React.lazy()
- Split vendor bundles for faster initial load
- Defer non-critical animations and effects

### 5. Database Indexes
Ensure these indexes exist for optimal query performance:

```sql
-- Inventory table
CREATE INDEX idx_inventory_status ON inventory(status);
CREATE INDEX idx_inventory_created_at ON inventory(created_at DESC);

-- Vehicle sales table
CREATE INDEX idx_vehicle_sales_date ON vehicle_sales(sale_date DESC);
CREATE INDEX idx_vehicle_sales_customer ON vehicle_sales(customer_id);

-- Expenses table
CREATE INDEX idx_expenses_created_at ON expenses(created_at DESC);
CREATE INDEX idx_expenses_vehicle ON expenses(vehicle_id);
```

### 6. Chart Optimization
- Render charts only when visible (IntersectionObserver)
- Limit chart data to last 12 months on mobile, 24 on desktop
- Use canvas-based charts (recharts) for better performance

### 7. Monitoring & Profiling
Use the included performance hooks to monitor:
```typescript
import { startTimer, endTimer, reportWebVitals } from '@/hooks/usePerformanceMonitoring';

// In components:
useEffect(() => {
  startTimer('dashboard-render');
  return () => {
    const duration = endTimer('dashboard-render');
  };
}, []);
```

## Implementation Checklist

- [ ] Create dashboard_monthly_metrics materialized view
- [ ] Create dashboard_inventory_summary view
- [ ] Update hooks to query views instead of raw tables
- [ ] Add pagination to inventory and sales lists
- [ ] Implement lazy loading for widgets
- [ ] Set up query response time monitoring
- [ ] Create performance dashboard (metrics overview)
- [ ] Test with 50k+ records in each table

## Expected Improvements
- Dashboard initial load: 3s → 1s (66% faster)
- Real-time metric updates: No N+1 queries
- Mobile experience: Optimized chart sizes and layouts
- API calls: Reduced by 40% with smart caching
