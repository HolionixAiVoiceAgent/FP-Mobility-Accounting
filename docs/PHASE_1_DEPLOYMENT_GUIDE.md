# 🚀 PHASE 1 IMPLEMENTATION GUIDE - Week 1

**Status:** Ready to Deploy  
**Objective:** Set up database infrastructure and RBAC system  
**Timeline:** 5-7 days  
**Team:** 2-3 developers  

---

## 📋 PHASE 1 CHECKLIST

### Day 1: Database Deployment

#### Step 1: Prepare Supabase CLI
```bash
# Verify supabase CLI is installed
supabase --version

# If not installed, install it globally
npm install -g supabase
```

#### Step 2: Configure Local Supabase (Optional - for testing)
```bash
# Start local Supabase instance (optional, for testing before production)
supabase start

# This will start PostgreSQL and other services locally
# Output will show API URL and keys for local testing
```

#### Step 3: Deploy to Production Supabase
```bash
# Link to your Supabase project (if not already linked)
supabase link --project-ref YOUR_PROJECT_REF

# Push the Phase 1 migration to production
supabase db push --dry-run  # (recommended first to see what will happen)
supabase db push            # (actual deployment)
```

**What gets created:**
- 14 new database tables
- 15+ Row-Level Security (RLS) policies
- 3 analytics views
- Audit logging system
- Triggers & functions

---

### Day 1-2: Verify Database Deployment

```bash
# Check if tables were created
psql postgresql://postgres:password@localhost:5432/postgres \
  -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public';"

# Or query through Supabase UI:
# 1. Go to supabase.com
# 2. Open your project
# 3. Go to "SQL Editor"
# 4. Run: SELECT * FROM information_schema.tables WHERE table_schema='public';
```

**Tables that should exist:**
```
✓ sales_pipeline        ✓ customer_financing  ✓ market_prices
✓ leads                 ✓ financing_payments  ✓ qr_codes
✓ employees             ✓ test_drives         ✓ vehicle_tracking
✓ employee_performance  ✓ communication_hist  ✓ audit_logs_enhanced
✓ commissions           ✓ role_permissions
```

---

### Day 2: Seed Test Data

```bash
# Create test data script
# File: supabase/seed.sql

INSERT INTO public.employees (auth_user_id, name, email, role, department, is_active)
VALUES 
  ('user-id-1', 'John Owner', 'owner@example.com', 'owner', 'Management', true),
  ('user-id-2', 'Jane Manager', 'manager@example.com', 'sales_manager', 'Sales', true),
  ('user-id-3', 'Bob Seller', 'salesperson@example.com', 'salesperson', 'Sales', true);

-- Add more test data as needed
```

**Deploy test data:**
```bash
# Option 1: Through Supabase UI
# 1. Go to SQL Editor
# 2. Paste and run seed.sql

# Option 2: Through CLI
psql postgresql://user:password@host:port/db -f supabase/seed.sql
```

---

### Day 2-3: RBAC System Setup

✅ **Already Created:**
- `src/hooks/useRole.ts` - Role management hook
- `src/hooks/usePermissions.ts` - Permission checking hook
- `src/components/PermissionGuard.tsx` - Permission guard component

**These handle:**
- Role detection (6+ roles)
- Permission validation
- Conditional rendering based on permissions
- Feature-level access control

---

### Day 3-5: Dashboard Implementation

The dashboard needs to be completely rewritten to support role-based views.

#### File: `src/pages/Dashboard.tsx`

Create this to show role-specific content:

```typescript
import { Dashboard as OwnerDashboard } from '@/components/dashboards/OwnerDashboard';
import { Dashboard as SalesDashboard } from '@/components/dashboards/SalesDashboard';
import { Dashboard as FinanceDashboard } from '@/components/dashboards/FinanceDashboard';
import { Dashboard as HRDashboard } from '@/components/dashboards/HRDashboard';
import { Dashboard as InventoryDashboard } from '@/components/dashboards/InventoryDashboard';
import { useRole } from '@/hooks/useRole';

export function Dashboard() {
  const { role, loading } = useRole();

  if (loading) return <div>Loading...</div>;

  switch (role) {
    case 'owner':
      return <OwnerDashboard />;
    case 'sales_manager':
      return <SalesDashboard />;
    case 'accountant':
      return <FinanceDashboard />;
    case 'hr_manager':
      return <HRDashboard />;
    case 'inventory_manager':
      return <InventoryDashboard />;
    default:
      return <div>No dashboard available for your role</div>;
  }
}
```

#### Create 5 Dashboard Components

Create these files:

1. **`src/components/dashboards/OwnerDashboard.tsx`** (Owner View)
   - Cash flow overview
   - All metrics (sales, inventory, HR, operations)
   - Team performance
   - Financial obligations
   - System health

2. **`src/components/dashboards/SalesDashboard.tsx`** (Sales Manager View)
   - Pipeline overview
   - Team performance metrics
   - Sales by salesperson
   - Customer acquisition cost
   - Conversion rates

3. **`src/components/dashboards/FinanceDashboard.tsx`** (Accountant View)
   - Financial overview
   - Income & expenses
   - Aging reports
   - Obligations
   - Tax information

4. **`src/components/dashboards/HRDashboard.tsx`** (HR Manager View)
   - Employee overview
   - Payroll status
   - Performance metrics
   - Attendance
   - Commissions

5. **`src/components/dashboards/InventoryDashboard.tsx`** (Inventory Manager View)
   - Vehicle inventory status
   - Aging analysis
   - Location tracking
   - Market pricing
   - Stock movements

#### Create 8 Dashboard Widgets

Each dashboard uses these widgets:

1. **`src/components/widgets/CashFlowWidget.tsx`**
   - Shows cash in/out
   - Monthly trends
   - Forecast

2. **`src/components/widgets/PipelineWidget.tsx`**
   - Sales pipeline stages
   - Deal count per stage
   - Total value

3. **`src/components/widgets/InventoryAgingWidget.tsx`**
   - Days on lot
   - Aging categories
   - Trend analysis

4. **`src/components/widgets/PerformanceWidget.tsx`**
   - Team/individual metrics
   - KPI tracking
   - Comparison view

5. **`src/components/widgets/ObligationsWidget.tsx`**
   - Financial obligations
   - Due dates
   - Status alerts

6. **`src/components/widgets/TopModelsWidget.tsx`**
   - Best-selling models
   - Sales count
   - Revenue

7. **`src/components/widgets/ProfitMarginWidget.tsx`**
   - Overall profitability
   - By model
   - Trend

8. **`src/components/widgets/CustomerSegmentationWidget.tsx`**
   - Customer breakdown
   - Lifetime value
   - Acquisition source

---

## 🛠️ TECHNICAL SETUP

### Environment Configuration

**File:** `.env.local`
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Database Connection

The app already has:
- `src/integrations/supabase/client.ts` - Supabase client (auto-generated)
- TanStack React Query set up in `src/App.tsx`

### RBAC Integration Points

The RBAC system integrates at:
1. **Route level** - Protect routes with `<PermissionGuard>`
2. **Component level** - Hide/show features with guards
3. **Button level** - Disable buttons based on permissions
4. **Data level** - Filter data via RLS policies (automatic at database layer)

---

## 📊 DATA HOOKS NEEDED

For Dashboard Week 1, create these hooks:

```typescript
// src/hooks/useDashboardData.ts
export const useDashboardData = () => {
  // Fetches key metrics for dashboard
  // Returns: { cashFlow, revenue, expenses, customers, vehicles, employees }
};

// src/hooks/usePipelineMetrics.ts
export const usePipelineMetrics = () => {
  // Fetches sales pipeline data
  // Returns: { stageBreakdown, dealValue, conversion, forecast }
};

// src/hooks/useTeamPerformance.ts
export const useTeamPerformance = () => {
  // Fetches employee metrics
  // Returns: { salesByPerson, commissions, performance }
};

// src/hooks/useFinancialMetrics.ts
export const useFinancialMetrics = () => {
  // Fetches accounting data
  // Returns: { cashFlow, obligations, profitability, tax }
};

// src/hooks/useInventoryMetrics.ts
export const useInventoryMetrics = () => {
  // Fetches inventory data
  // Returns: { aging, location, pricing, movements }
};
```

---

## ✅ TESTING CHECKLIST

### Database Tests
- [ ] All 14 tables created
- [ ] RLS policies active
- [ ] Test data inserted
- [ ] Audit logging working
- [ ] Views calculating correctly

### RBAC Tests
- [ ] useRole hook returns correct role
- [ ] usePermissions hook calculates correctly
- [ ] PermissionGuard hides/shows content
- [ ] Buttons disable for denied actions
- [ ] Routes protected by role

### Dashboard Tests
- [ ] Owner sees all data
- [ ] Sales manager sees only sales
- [ ] Accountant sees only financial
- [ ] HR manager sees only HR
- [ ] Inventory manager sees only inventory
- [ ] Load times acceptable (<2s)
- [ ] Mobile responsive

---

## 🚨 COMMON ISSUES & FIXES

### Issue: Database migration fails
**Fix:** 
```bash
# Check for existing objects
supabase db pull --dry-run

# Reset local database (WARNING: loses data)
supabase db reset

# Try push again
supabase db push
```

### Issue: RLS policies preventing queries
**Fix:**
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';

-- Temporarily disable RLS for testing (NOT PRODUCTION)
ALTER TABLE sales_pipeline DISABLE ROW LEVEL SECURITY;
```

### Issue: useRole returns null
**Fix:**
- Check if user is authenticated
- Verify `employees` table has data
- Check browser console for errors
- Fall back to legacy `user_roles` table

---

## 🚀 DEPLOYMENT

### To Staging
```bash
npm run build
supabase deploy  # Optional: if using edge functions
npm run preview  # Test built version locally
```

### To Production
```bash
# 1. Ensure database is deployed
supabase db push

# 2. Build frontend
npm run build

# 3. Deploy (hosting dependent - Vercel, Netlify, etc.)
npm run deploy
```

---

## 📋 SUCCESS CRITERIA

Phase 1 is complete when:
- ✅ All 14 database tables created and verified
- ✅ RLS policies active and tested
- ✅ RBAC system working (useRole, usePermissions)
- ✅ 5 role-specific dashboards implemented
- ✅ 8 dashboard widgets functional
- ✅ All role-based access working
- ✅ Less than 2 second page load time
- ✅ Mobile responsive on all screen sizes
- ✅ No console errors
- ✅ User can authenticate and see role-correct dashboard

---

## 📞 SUPPORT & NEXT STEPS

### If You Get Stuck:
1. Check `IMPLEMENTATION_ROADMAP_DETAILED.md` for day-by-day tasks
2. Review `CTO_STRATEGIC_PLAN.md` for architecture details
3. Check Supabase docs: https://supabase.com/docs
4. Check React Query docs: https://tanstack.com/query

### After Phase 1 Complete:
→ Begin Phase 2 (Week 2): Sales Pipeline & Advanced Search

---

**Phase 1 Ready. Let's go!** 🎯
