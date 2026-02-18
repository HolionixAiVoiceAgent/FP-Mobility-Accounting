# Employee Save Error Diagnostic Guide

## Issue: "Failed to save employee" Error

This guide helps diagnose why employee creation fails with "Failed to save employee" error.

---

## Root Causes (Ordered by Likelihood)

### 1. **RLS Policy Permission Denied (Error Code: 42501)**
**Most Common Cause**

The database RLS policy is blocking the insert because:
- JWT token doesn't have `role` claim set to `admin`, `manager`, or `hr_manager`
- OR user's auth role doesn't match policy requirements

**Check:**
```sql
-- In Supabase SQL Editor, run:
SELECT * FROM auth.users WHERE email = 'your-email';

-- Check your JWT role claim (may be null or 'authenticated')
```

**Fix:**
Option A: Configure JWT Claims in Supabase
- Go to: Supabase Project → Authentication → Providers → Supabase
- Set up a post-login hook to populate the JWT `role` claim from `user_roles` table

Option B: Use less restrictive policies (temporary)
- Migration `20251115_replace_security_definer_with_jwt_claims.sql` includes fallback for backward compatibility
- Run: `supabase db push` to apply the migration

**Error Message You'll See:**
```
Permission denied
(or: Only admins, managers, or HR managers can add employees.)
```

---

### 2. **Database Schema Mismatch (Column Not Found)**

The `employees` table is missing required columns:
- `hourly_rate`
- `base_salary`

**Check:**
```sql
-- In Supabase SQL Editor:
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'employees' AND table_schema = 'public'
ORDER BY column_name;
```

**Fix:**
Apply pending migrations:
```bash
supabase db push
```

This will add:
- `hourly_rate` column (from `20251114_add_hourly_rate_to_employees.sql`)
- `monthly_work_hours` setting (from `20251114_add_monthly_work_hours_to_company_settings.sql`)
- HRM tables and views (from `20251120_hrm_attendance_leaves_payroll.sql`)

**Error Message You'll See:**
```
column "hourly_rate" does not exist
(or: column "base_salary" does not exist)
```

---

### 3. **Network/Auth Issue**

The user is logged out or session is invalid.

**Check:**
1. Browser DevTools → Application → Cookies
2. Verify `sb-access-token` exists and is not expired

**Fix:**
- Log out and log back in
- Clear browser cache: Ctrl+Shift+Delete

---

### 4. **Validation Error in Frontend**

Form validation is blocking submission before it even reaches the database.

**Check:**
- Required fields: First Name, Last Name must not be empty
- Numeric fields: Base Salary and Hourly Rate must be valid numbers (no negative)

**Fix:**
- Fill all required fields
- Use numeric values only for salary/rate fields

---

## Debugging Steps

### Step 1: Check Browser Console for Details
1. Open DevTools: F12
2. Go to Console tab
3. Try adding an employee again
4. Look for logs starting with `[EmployeeManagement]`
5. Copy the full error details

**Sample output:**
```javascript
[EmployeeManagement] Save error: {
  errorMsg: "Permission denied",
  errorCode: "42501",
  hint: "Policy (All users can insert employees) was violated.",
  fullError: {...}
}
```

### Step 2: Check Network Tab
1. Open DevTools: F12
2. Go to Network tab
3. Try adding an employee
4. Look for request to `/rest/v1/employees`
5. Check the response status and body

**Red flags:**
- Status 403: Permission denied (RLS policy)
- Status 400: Bad request (missing columns)
- Status 401: Unauthorized (auth issue)

### Step 3: Check Supabase Logs
1. Go to: Supabase Dashboard → Project → Logs
2. Filter by table: `employees`
3. Look for INSERT operations and errors

---

## Complete Diagnostic Checklist

- [ ] **Check 1: JWT Role Claim**
  ```sql
  SELECT auth.jwt()->>'role' as role_claim;
  ```
  Expected: `admin`, `manager`, or `hr_manager`

- [ ] **Check 2: Employee Table Schema**
  ```sql
  SELECT column_name FROM information_schema.columns 
  WHERE table_name = 'employees' AND table_schema = 'public';
  ```
  Should include: `hourly_rate`, `base_salary`, `hire_date`, `is_active`

- [ ] **Check 3: RLS Policies**
  ```sql
  SELECT policyname, permissive, qual FROM pg_policies 
  WHERE tablename = 'employees';
  ```
  Should have policies for: INSERT, UPDATE, SELECT

- [ ] **Check 4: Auth Session**
  ```javascript
  // In browser console:
  supabase.auth.getSession().then(({data}) => console.log(data))
  ```
  Should show valid session with user info

- [ ] **Check 5: Browser Logs**
  - F12 → Console tab
  - Search for `[EmployeeManagement]` logs
  - Copy full error details

---

## Common Error Codes

| Code | Meaning | Fix |
|------|---------|-----|
| 42501 | Permission denied (RLS policy) | Check JWT role claim, ensure user is admin/manager/hr_manager |
| 42P01 | Undefined table | Run `supabase db push` to create tables |
| 42703 | Undefined column | Run `supabase db push` to add missing columns |
| 42000 | Syntax error | Check SQL format in migrations |
| 401 | Unauthorized | Log out and log back in |

---

## Step-by-Step Resolution

### If you get RLS Policy Error (42501):

1. **Option A: Configure JWT Claims (Recommended)**
   ```bash
   # In Supabase Dashboard:
   # 1. Go to Authentication → Providers → Supabase
   # 2. Under JWT Settings, enable Custom Claims
   # 3. Create a post-login hook:
   
   select auth.jwt() ->> 'role' = 'admin'
   
   # (Or set up a database hook to read from user_roles table)
   ```

2. **Option B: Apply Migration (Temporary)**
   ```bash
   # Run this to apply the JWT migration with fallback policies:
   supabase db push
   ```

3. **Verify:**
   - Log out and log back in
   - Try adding an employee again
   - Check Console logs for success

### If you get Column Not Found Error (42703):

```bash
# 1. Apply all pending migrations:
supabase db push

# 2. Verify in Supabase:
SELECT * FROM public.company_settings LIMIT 1;

# 3. Try adding employee again
```

### If all else fails:

1. **Check auth user role:**
   ```sql
   SELECT ur.* FROM public.user_roles ur
   JOIN public.profiles p ON ur.user_id = p.id
   WHERE p.email = 'your-email@example.com';
   ```
   Make sure `role` is `admin`, `manager`, or `hr_manager`

2. **Check RLS is enabled:**
   ```sql
   SELECT relname, pg_class.relrowsecurity 
   FROM pg_class 
   WHERE relname = 'employees';
   ```
   Should show `true` for relrowsecurity

3. **Contact support with:**
   - Full error message from Console
   - User email
   - Screenshot of Supabase Dashboard → Logs

---

## Prevention Tips

- ✅ Always run `supabase db push` after pulling code with migrations
- ✅ Ensure your user role is set correctly in `user_roles` table
- ✅ Check browser console regularly for errors
- ✅ Clear browser cache if you get strange auth errors
- ✅ Use the enhanced error messages in the UI to diagnose issues

---

## What Was Fixed in Recent Updates

### Enhanced Error Logging (`EmployeeManagement.tsx`)
- ✅ Captures error code (42501, 42703, etc.)
- ✅ Displays user-friendly messages
- ✅ Shows hint text from Supabase
- ✅ Logs detailed information to browser console

### JWT Migration (`20251115_replace_security_definer_with_jwt_claims.sql`)
- ✅ Updated RLS policies to use JWT claims
- ✅ Includes fallback for backward compatibility
- ✅ Removed SECURITY DEFINER dependency
- ✅ Complies with Supabase security best practices

### Resilient Insert Logic (`EmployeeManagement.tsx`)
- ✅ Detects "column not found" errors
- ✅ Automatically retries without problematic columns
- ✅ Allows graceful fallback if DB schema not fully migrated

---

## Next Steps

1. **Immediate:**
   - Open DevTools (F12) and go to Console
   - Try adding an employee
   - Note the `[EmployeeManagement]` error logs
   - Share the error code and message

2. **Quick Fix (Temporary):**
   ```bash
   supabase db push
   ```

3. **Proper Fix (Recommended):**
   - Configure JWT Claims in Supabase project settings
   - Verify user role in `user_roles` table
   - Test employee creation end-to-end

4. **Verification:**
   - Create a test employee
   - Verify in Supabase Dashboard → Tables → employees
   - Check payroll calculations show earned_so_far

---

## Questions?

If the issue persists after these steps:
1. Open DevTools Console
2. Try adding employee
3. Copy the full `[EmployeeManagement]` error log
4. Share: error code, error message, and hint text
