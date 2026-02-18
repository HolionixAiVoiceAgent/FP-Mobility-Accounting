# 🚀 Deployment & Migration Guide

**System:** FP Mobility Complete Accounting Software  
**Version:** 1.0 Release  
**Date:** November 13, 2025

---

## Pre-Deployment Checklist

- [ ] All code committed to `main` branch
- [ ] Environment variables configured:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `VITE_TINK_CLIENT_ID` (if using bank integration)
  - [ ] `VITE_TINK_ENV` (production or sandbox)
- [ ] Supabase project created and initialized
- [ ] Database migrations tested locally
- [ ] Team members added to Supabase project
- [ ] Backup of any existing data taken

---

## Part 1: Database Setup (Supabase)

### Step 1: Apply Migrations

**Option A: Using Supabase CLI (Recommended)**

```powershell
# Navigate to project root
cd "p:\FP Mobility GmbH\Software\Complete_Accounting_Software"

# Start Supabase local development environment (if using local)
supabase start

# Push migrations to your Supabase project
supabase db push

# Verify migrations applied
supabase db list-migrations
```

**Option B: Manual SQL (if CLI not available)**

1. Go to Supabase Dashboard → SQL Editor
2. Create a new query
3. Copy-paste content from `supabase/migrations/20251113091500_add_expense_payment_columns.sql`
4. Run the query
5. Repeat for `20251113093000_create_cash_advances_and_view.sql`

### Step 2: Verify Tables Created

```sql
-- In Supabase SQL Editor, run:

-- Check expense columns added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'expenses' AND column_name IN ('payment_type', 'employee_id');

-- Check advances table exists
SELECT * FROM public.employee_cash_advances LIMIT 1;

-- Check summary view exists
SELECT * FROM public.employee_cash_summary LIMIT 1;
```

**Expected output:**
- ✅ `payment_type` (text, default 'account')
- ✅ `employee_id` (uuid, nullable)
- ✅ `employee_cash_advances` table
- ✅ `employee_cash_summary` view

### Step 3: Enable Real-Time Subscriptions

```sql
-- In Supabase SQL Editor, ensure publication is enabled:

-- Check publication exists
SELECT * FROM pg_publication WHERE pubname = 'supabase_realtime';

-- Enable it for critical tables (if not already)
ALTER PUBLICATION supabase_realtime ADD TABLE expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE employee_cash_advances;
ALTER PUBLICATION supabase_realtime ADD TABLE vehicle_sales;
ALTER PUBLICATION supabase_realtime ADD TABLE inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE customers;
```

---

## Part 2: Environment Configuration

### Step 1: Create `.env.local` File

```bash
# In project root directory, create .env.local with:

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc... (your anon key from Supabase)
VITE_TINK_CLIENT_ID=your-tink-client-id
VITE_TINK_ENV=production  # or 'sandbox' for testing
```

**To find your Supabase credentials:**
1. Go to Supabase Dashboard
2. Settings → API
3. Copy `Project URL` and `Anon public key`

### Step 2: Verify Environment

```powershell
# Test that environment variables are loaded
npm run dev

# Check browser console - should NOT show "undefined" for Supabase URL
```

---

## Part 3: Frontend Build & Deployment

### Step 1: Install Dependencies

```powershell
cd "p:\FP Mobility GmbH\Software\Complete_Accounting_Software"
npm install
```

### Step 2: Local Testing

```powershell
# Start development server
npm run dev

# Open in browser: http://localhost:8080
# Test:
# - Login with a test user
# - Navigate dashboard (should load data in real-time)
# - Try adding an expense (should see cash/account toggle)
# - Try adding a cash advance
# - Check notifications appear
```

### Step 3: Production Build

```powershell
# Build for production
npm run build

# Output: dist/ folder (~2.4 MB)
# Verify no errors in terminal
```

### Step 4: Deploy Frontend

**Option A: Vercel (Easiest)**

```powershell
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Answer prompts:
# - Framework: Vite
# - Build command: npm run build
# - Output directory: dist
# - Environment variables: add VITE_SUPABASE_* and VITE_TINK_*
```

**Option B: Netlify**

```powershell
# Connect repo to Netlify via web UI
# Configure build settings:
# - Build command: npm run build
# - Publish directory: dist
# - Add environment variables
# - Deploy
```

**Option C: Self-Hosted (Docker)**

```dockerfile
# Create Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["npm", "run", "preview"]
```

```powershell
# Build and run
docker build -t fp-mobility-accounting .
docker run -p 8080:8080 -e VITE_SUPABASE_URL=... -e VITE_SUPABASE_ANON_KEY=... fp-mobility-accounting
```

---

## Part 4: Edge Functions Deployment (Tink Integration)

If using bank integration, deploy Supabase Edge Functions:

```powershell
# Deploy tink-sync-all function
supabase functions deploy tink-sync-all

# Deploy tink-create-link function
supabase functions deploy tink-create-link

# Verify deployment
supabase functions list
```

---

## Part 5: User Setup

### Step 1: Create Admin User

```sql
-- In Supabase Auth section, create first admin user via UI

-- Then in SQL, assign role:
INSERT INTO public.user_roles (user_id, role) 
VALUES ('uuid-from-auth', 'admin');
```

### Step 2: Create Test Users (Optional)

```sql
-- Create test data for each role
INSERT INTO public.user_roles (user_id, role) VALUES ('...', 'employee');
INSERT INTO public.user_roles (user_id, role) VALUES ('...', 'manager');
```

### Step 3: Seed Initial Data (Optional)

```powershell
# Import customers, vehicles from CSV if needed
# Use the import feature in Customers/Inventory pages
# Or use Supabase SQL:

INSERT INTO public.customers (customer_id, name, email, phone, status) 
VALUES ('CUST-001', 'Test Customer', 'test@example.com', '555-0001', 'active');
```

---

## Part 6: Monitoring & Verification

### Dashboard Health Check

After deployment, verify all systems working:

1. **Login** ✅
   - [ ] Supabase auth working
   - [ ] Redirected to dashboard

2. **Real-Time Data** ✅
   - [ ] Dashboard metrics updating every 5 seconds
   - [ ] Refresh button responsive

3. **Add Expense** ✅
   - [ ] Payment Type selector visible
   - [ ] Cash advance form appears
   - [ ] Data saved and visible immediately

4. **Notifications** ✅
   - [ ] Add expense → toast notification appears
   - [ ] Record cash advance → notification appears

5. **Keyboard Shortcuts** ✅
   - [ ] Cmd+K opens search
   - [ ] Cmd+D navigates to dashboard
   - [ ] Cmd+? shows help

6. **Bank Integration** (if enabled) ✅
   - [ ] Tink account connected
   - [ ] Transactions syncing (check Bank page)

### Performance Check

```javascript
// In browser console:
// Measure page load time
performance.mark('page-load-start');
// ... navigate around ...
console.log(performance.measure('page-load'));

// Should be <2 seconds for dashboard load
```

### Database Check

```sql
-- Verify data is flowing
SELECT COUNT(*) FROM public.expenses;
SELECT COUNT(*) FROM public.vehicle_sales;
SELECT COUNT(*) FROM public.customers;

-- Check real-time is working
SELECT * FROM public.employee_cash_summary;
```

---

## Part 7: Backup & Recovery

### Database Backup

```powershell
# Supabase auto-backups daily; view in Dashboard → Backups

# Manual backup (SQL export)
supabase db pull > backup_$(Get-Date -Format 'yyyyMMdd_HHmm').sql
```

### Code Backup

```powershell
# Push all code to git
git add .
git commit -m "Pre-production backup: $(Get-Date)"
git push origin main
```

---

## Part 8: Troubleshooting

### Issue: "Cannot connect to Supabase"

**Solution:**
```powershell
# Check environment variables
$env:VITE_SUPABASE_URL
$env:VITE_SUPABASE_ANON_KEY

# Verify in browser console
console.log(import.meta.env.VITE_SUPABASE_URL)

# Check Supabase project status (Dashboard)
# Ensure project is not paused
```

### Issue: "Real-time updates not working"

**Solution:**
```sql
-- Check publication
SELECT * FROM pg_publication WHERE pubname = 'supabase_realtime';

-- If missing, create:
CREATE PUBLICATION supabase_realtime FOR TABLE expenses, vehicle_sales;

-- Restart your app
```

### Issue: "Bank transactions not syncing"

**Solution:**
1. Check Tink API credentials in `.env.local`
2. Verify Tink account connected (Bank page)
3. Check Tink API status: https://status.tink.com
4. Manually trigger sync via button (Bank page)

### Issue: "Build fails with TypeScript errors"

**Solution:**
```powershell
# Clear node_modules and reinstall
rm node_modules -Recurse -Force
npm install

# Clear build cache
rm dist -Recurse -Force

# Retry build
npm run build
```

---

## Part 9: Post-Deployment Tasks

- [ ] Set up automated backups (Supabase Dashboard)
- [ ] Configure email notifications
- [ ] Set up error tracking (Sentry/equivalent)
- [ ] Create admin documentation
- [ ] Schedule user training
- [ ] Monitor performance for first week
- [ ] Gather user feedback
- [ ] Plan Phase 3 enhancements

---

## Support URLs

- **Supabase Docs:** https://supabase.com/docs
- **Tink API Docs:** https://docs.tink.com
- **React Query:** https://tanstack.com/query/latest
- **Vite:** https://vitejs.dev

---

## Rollback Plan

If critical issue discovered post-deployment:

```powershell
# Revert to previous frontend
vercel rollback  # (if on Vercel)
# or redeploy previous commit

# Revert database
supabase db reset  # (WARNING: clears all data)
# or restore from backup via Supabase Dashboard
```

---

**Deployment checklist version: 1.0**  
**Last updated:** November 13, 2025  
**Ready for production.** ✅
