# URGENT: Apply Database Migrations to Fix Employee Save Error

## Current Issue
```
Error: Could not find the 'hourly_rate' column of 'employees' in the schema cache
```

**Root Cause:** The database migrations have NOT been applied to your Supabase instance yet. The `hourly_rate` column doesn't exist in the `employees` table.

---

## Solution: Apply Pending Migrations

### Option 1: Using Supabase CLI (Recommended)

1. **Open Terminal/PowerShell**

2. **Navigate to project folder:**
   ```bash
   cd "p:\FP Mobility GmbH\Software\Complete_Accounting_Software"
   ```

3. **Make sure Supabase CLI is installed:**
   ```bash
   supabase --version
   ```
   If not installed:
   ```bash
   npm install -g @supabase/cli
   ```

4. **Link your Supabase project (if not already linked):**
   ```bash
   supabase link --project-ref YOUR_PROJECT_ID
   ```
   You can find `PROJECT_ID` in: Supabase Dashboard → Project Settings → General

5. **Apply all pending migrations:**
   ```bash
   supabase db push
   ```

   **What this will do:**
   - ✅ Add `hourly_rate` column to `employees` table
   - ✅ Add `monthly_work_hours` setting to `company_settings` table
   - ✅ Create `employee_attendance`, `employee_leaves`, `payroll` tables
   - ✅ Create `employee_leave_balance` and `employee_attendance_summary` views
   - ✅ Update all RLS policies to use JWT claims instead of SECURITY DEFINER

6. **Verify the migrations were applied:**
   ```bash
   supabase migration list
   ```

---

### Option 2: Manual SQL in Supabase Dashboard

1. **Go to Supabase Dashboard**
   - URL: https://app.supabase.com/project/YOUR_PROJECT_ID/sql/new

2. **Copy SQL from migration files:**
   - File 1: `supabase/migrations/20251114_add_hourly_rate_to_employees.sql`
   - File 2: `supabase/migrations/20251114_add_monthly_work_hours_to_company_settings.sql`
   - File 3: `supabase/migrations/20251120_hrm_attendance_leaves_payroll.sql`
   - File 4: `supabase/migrations/20251115_replace_security_definer_with_jwt_claims.sql`

3. **For each file:**
   - Open in text editor
   - Copy all SQL code
   - Paste into Supabase SQL Editor
   - Click "Run" or Cmd+Enter

4. **Execute in order:**
   ```
   1. 20251114_add_hourly_rate_to_employees.sql
   2. 20251114_add_monthly_work_hours_to_company_settings.sql
   3. 20251120_hrm_attendance_leaves_payroll.sql
   4. 20251115_replace_security_definer_with_jwt_claims.sql
   ```

---

### Option 3: Quick SQL (Minimal Columns Only)

If you just want to get it working NOW (not recommended for production):

```sql
-- Add hourly_rate column to employees table
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10, 2);

-- Add base_salary column if missing
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS base_salary DECIMAL(12, 2);

-- Update RLS policies to allow all authenticated users
DROP POLICY IF EXISTS "All users can insert employees" ON public.employees;
CREATE POLICY "All users can insert employees"
  ON public.employees FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "All users can update employees" ON public.employees;
CREATE POLICY "All users can update employees"
  ON public.employees FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
```

---

## After Applying Migrations

### Step 1: Refresh Your Browser
```
Ctrl+Shift+Delete to open Delete Browsing Data
Select "Cookies and other site data"
Click Delete
```

### Step 2: Log Out and Log Back In
1. Click "Logout" in the app
2. Log in again with your credentials
3. Go to HRM → Employees

### Step 3: Test Employee Creation
1. Click "Add Employee" button
2. Fill in required fields:
   - First Name: `John`
   - Last Name: `Doe`
   - Email: `john@example.com`
   - Role: `salesperson`
   - Department: `sales`

3. Leave Hourly Rate blank (will auto-calculate)
4. Enter Base Salary: `3000`
5. Click "Save"

### Step 4: Verify in Supabase
```sql
-- Check if employee was created:
SELECT id, first_name, last_name, hourly_rate, base_salary 
FROM public.employees 
WHERE is_active = true 
ORDER BY created_at DESC 
LIMIT 1;
```

Should show the new employee with hourly_rate calculated from base_salary.

---

## Troubleshooting

### "Still getting schema cache error after running migrations"

1. **Wait 30 seconds** - Supabase caches schemas
2. **Clear browser cache:**
   ```
   F12 → Application → Cookies → Delete all for localhost
   ```
3. **Log out and log back in**
4. **Hard refresh browser:** Ctrl+Shift+R or Cmd+Shift+R
5. **Try again**

### "supabase command not found"

```bash
# Install globally:
npm install -g @supabase/cli

# Or run locally:
npx supabase db push
```

### "Permission denied when running migrations"

Your Supabase user may not have sufficient permissions. Try:
1. Go to Supabase Dashboard
2. Use SQL Editor (top right → SQL)
3. Paste the migration SQL manually
4. Run it directly

### "Error: Project not linked"

Link your Supabase project:
```bash
supabase link --project-ref YOUR_PROJECT_ID
```

Find YOUR_PROJECT_ID:
- Supabase Dashboard → Project Settings → General → Project ID (copy it)

---

## Migration Checklist

After applying migrations, verify each was successful:

```sql
-- Check 1: hourly_rate column exists
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'employees' AND column_name = 'hourly_rate';
-- Should return: hourly_rate

-- Check 2: monthly_work_hours in company_settings
SELECT monthly_work_hours FROM public.company_settings LIMIT 1;
-- Should return a number (default: 160)

-- Check 3: HRM tables exist
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN ('employee_attendance', 'employee_leaves', 'payroll');
-- Should return: employee_attendance, employee_leaves, payroll

-- Check 4: Views exist
SELECT viewname FROM pg_views 
WHERE schemaname = 'public' AND viewname IN ('employee_leave_balance', 'employee_attendance_summary');
-- Should return: employee_leave_balance, employee_attendance_summary

-- Check 5: RLS policies are JWT-based
SELECT policyname FROM pg_policies 
WHERE tablename = 'employees' AND policyname ILIKE '%insert%';
-- Should return: "All users can insert employees"
```

---

## What Was Changed

### Frontend (Auto-Retry Logic)
✅ Enhanced `EmployeeManagement.tsx` to:
- Detect schema cache errors
- Automatically retry without `hourly_rate`/`base_salary` if columns don't exist
- Show clear error message: "Database schema not updated. Please run: supabase db push"
- Log detailed diagnostic info to browser console

### Database (4 Migrations Created)
1. ✅ `20251114_add_hourly_rate_to_employees.sql` - Adds hourly_rate column
2. ✅ `20251114_add_monthly_work_hours_to_company_settings.sql` - Configurable monthly hours
3. ✅ `20251120_hrm_attendance_leaves_payroll.sql` - Full HRM schema
4. ✅ `20251115_replace_security_definer_with_jwt_claims.sql` - JWT-based RLS policies

---

## Quick Reference: Migration Files Location

All migration files are in:
```
p:\FP Mobility GmbH\Software\Complete_Accounting_Software\supabase\migrations\
```

Files to apply:
- `20251114_add_hourly_rate_to_employees.sql`
- `20251114_add_monthly_work_hours_to_company_settings.sql`
- `20251120_hrm_attendance_leaves_payroll.sql`
- `20251115_replace_security_definer_with_jwt_claims.sql`

---

## Getting Help

If you're still stuck:

1. **Screenshot the error:**
   - Press F12 to open DevTools
   - Go to Console tab
   - Take screenshot of error message

2. **Check Supabase logs:**
   - Supabase Dashboard → Logs
   - Filter by table: `employees`
   - Look for failed queries

3. **Run diagnostic query:**
   ```sql
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_schema = 'public' 
   AND table_name = 'employees' 
   ORDER BY column_name;
   ```
   If `hourly_rate` is missing, migrations weren't applied.

---

## Next Steps (Priority Order)

1. **IMMEDIATE:** Apply migrations using Option 1 (supabase db push)
2. **Then:** Clear browser cache and log out/in
3. **Test:** Try adding an employee again
4. **Verify:** Check employee appears in Supabase dashboard

Once migrations are applied, employee creation will work!
