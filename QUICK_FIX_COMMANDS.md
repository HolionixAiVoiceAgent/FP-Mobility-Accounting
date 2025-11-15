# Quick Commands to Fix Employee Save Error

## Problem
```
Error: Could not find the 'hourly_rate' column of 'employees' in the schema cache
```

## Solution: Copy & Paste These Commands

### Command 1: Navigate to Project
```bash
cd "p:\FP Mobility GmbH\Software\Complete_Accounting_Software"
```

### Command 2: Verify Supabase CLI is installed
```bash
supabase --version
```

**If NOT installed, run:**
```bash
npm install -g @supabase/cli
```

### Command 3: Link your Supabase project (one-time setup)
```bash
supabase link --project-ref xxxxxxxx
```
Replace `xxxxxxxx` with your Project ID from: https://app.supabase.com → Project Settings → General

### Command 4: Apply all migrations
```bash
supabase db push
```

This will:
- Add `hourly_rate` column to employees table ✅
- Add `monthly_work_hours` to company_settings ✅
- Create HRM tables (attendance, leaves, payroll) ✅
- Create views (leave_balance, attendance_summary) ✅
- Update RLS policies to use JWT claims ✅

### Command 5: Verify migrations were applied
```bash
supabase migration list
```

---

## Expected Output

After running `supabase db push`:

```
✔ Applied migration 20251114_add_hourly_rate_to_employees
✔ Applied migration 20251114_add_monthly_work_hours_to_company_settings
✔ Applied migration 20251120_hrm_attendance_leaves_payroll
✔ Applied migration 20251115_replace_security_definer_with_jwt_claims

✓ All migrations applied successfully
```

---

## After Migrations: Complete These Steps

### Step 1: Clear Browser Cache
```
Press: Ctrl+Shift+Delete
Select: "Cookies and other site data"
Click: Delete
```

### Step 2: Reload App
1. Close all browser tabs with the app
2. Go to: http://localhost:8080 (or 8081)
3. Log out (top right menu)
4. Log back in

### Step 3: Test Employee Creation
1. Navigate to: HRM → Employees
2. Click: "Add Employee" button
3. Fill form:
   - First Name: John
   - Last Name: Doe
   - Email: john@test.com
   - Role: salesperson
   - Department: sales
   - Base Salary: 3000 (hourly_rate will auto-calculate)
4. Click: "Save"

### Step 4: Verify in Supabase
Go to: https://app.supabase.com → Project → SQL Editor

Run:
```sql
SELECT * FROM public.employees ORDER BY created_at DESC LIMIT 1;
```

Should show your new employee with `hourly_rate` filled in.

---

## Troubleshooting: Still Not Working?

### Error: "supabase: The term 'supabase' is not recognized"

```bash
# Use npm to run it instead:
npx supabase db push
```

### Error: "Project not linked"

```bash
# Get your project ID from: https://app.supabase.com
# Project Settings → General → Project ID (copy it)

supabase link --project-ref YOUR_PROJECT_ID_HERE
```

### Error: "Permission denied" or "403"

1. Go to: https://app.supabase.com
2. Click: SQL Editor (top right)
3. Create new query
4. Copy-paste SQL from migration files manually
5. Click "Run"

### Still getting "hourly_rate column not found" error?

1. **Wait 30 seconds** (Supabase caches schema)
2. **Hard refresh browser:** Ctrl+Shift+R
3. **Clear cache in DevTools:**
   ```
   F12 → Application → Cookies → Delete all localhost
   ```
4. **Log out and back in**
5. **Try again**

---

## Manual SQL Option (If CLI doesn't work)

1. Go to: https://app.supabase.com → SQL Editor
2. Open files in project:
   - `supabase/migrations/20251114_add_hourly_rate_to_employees.sql`
   - `supabase/migrations/20251114_add_monthly_work_hours_to_company_settings.sql`
   - `supabase/migrations/20251120_hrm_attendance_leaves_payroll.sql`
   - `supabase/migrations/20251115_replace_security_definer_with_jwt_claims.sql`

3. For each file:
   - Copy all SQL code
   - Paste into SQL Editor
   - Click "Run"

---

## Final Check: Verify Everything Works

```sql
-- Run this in Supabase SQL Editor:

-- Check 1: Table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'employees' 
ORDER BY column_name;

-- Should include: hourly_rate, base_salary, hire_date, is_active

-- Check 2: Company settings
SELECT monthly_work_hours FROM public.company_settings LIMIT 1;

-- Should return: 160 (or your configured value)

-- Check 3: HRM tables exist
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('employee_attendance', 'employee_leaves', 'payroll')
ORDER BY tablename;

-- Should return all 3 tables
```

---

## Done! ✅

After these commands and steps:
- ✅ Employee creation will work
- ✅ Hourly rate will auto-calculate from base salary
- ✅ Payroll calculations will show earned_so_far
- ✅ No more schema cache errors

Try adding an employee again!
