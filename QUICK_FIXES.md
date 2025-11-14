# Quick Fix Guide - Three Critical Issues

## ⚡ QUICK FIXES SUMMARY

### Issue 1: Employee Add Failing
**Status:** ❌ RLS policies not allowing INSERT
**Fix:** Run SQL migration to fix permissions

### Issue 2: Tink Bank Connection 404
**Status:** ❌ Route not defined in App.tsx
**Fix:** Add route to your React Router

### Issue 3: No HRM Module
**Status:** ✅ COMPLETE - New HRM page created
**Fix:** Apply database migrations + use HRM page

---

## FIX #1: Employee Add Error - RLS Policy Fix

### What's Wrong
The `employees` table RLS policies don't allow INSERT operations.

### SQL Fix (Copy & Paste)
```sql
-- Run this in Supabase SQL Editor
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "All users can insert employees" ON public.employees;

CREATE POLICY "All users can insert employees"
  ON public.employees FOR INSERT
  WITH CHECK (true);
```

### Verification
1. Go to Supabase Dashboard
2. Database → Policies
3. Filter by table: `employees`
4. You should see INSERT policy listed
5. Try adding employee again in app

---

## FIX #2: Tink Bank Integration 404 Error

### What's Wrong
The `/bank-integration` route is referenced in Settings but not defined in App.tsx

### Code Fix for src/App.tsx

**Find this section in your App.tsx:**
```tsx
import BankIntegration from '@/pages/BankIntegration';
// ... other imports ...

// Inside the main JSX return statement, find <Routes>:
<Routes>
  <Route path="/" element={<Index />} />
  <Route path="/inventory" element={<Inventory />} />
  {/* ... other routes ... */}
</Routes>
```

**Add this route:**
```tsx
<Route path="/bank-integration" element={<BankIntegration />} />
```

**Complete example:**
```tsx
<Routes>
  <Route path="/" element={<Index />} />
  <Route path="/inventory" element={<Inventory />} />
  <Route path="/expenses" element={<Expenses />} />
  <Route path="/customers" element={<Customers />} />
  <Route path="/reports" element={<Reports />} />
  <Route path="/settings" element={<Settings />} />
  <Route path="/bank-integration" element={<BankIntegration />} />
  {/* Add above line */}
  <Route path="/vehicle-sales" element={<VehicleSales />} />
  <Route path="/vehicle-purchases" element={<VehiclePurchases />} />
  <Route path="/financial-obligations" element={<FinancialObligations />} />
</Routes>
```

### Test
1. Go to Settings page
2. Scroll to Security & Access → Bank Integration
3. Click "Configure"
4. Should navigate to bank integration page (no 404)

---

## FIX #3: New HRM Module Setup

### What's New
Complete HR Management system with:
- Employee directory
- Attendance tracking
- Leave management
- Payroll management

### Database Setup (Required)

**Step 1:** Open Supabase SQL Editor

**Step 2:** Copy entire content from `HRM_DATABASE_SETUP.sql`

**Step 3:** Paste into SQL Editor

**Step 4:** Click Run (Ctrl+Enter)

**Expected Output:**
```
Query executed successfully (for 3 statements)
```

### Access HRM Page

**URL:** `http://localhost:8080/hrm` (or your dev server URL)

**Or add to sidebar navigation:**

Look for where menu items are defined in your Layout component, add:
```tsx
{
  icon: Users,
  label: 'HRM',
  href: '/hrm'
}
```

### Features Available

| Feature | What It Does |
|---------|-------------|
| **Employees** | View all employees, hire dates, salaries |
| **Attendance** | Record check-in/check-out, track daily attendance |
| **Leaves** | Manage leave requests (sick, vacation, personal, unpaid) |
| **Payroll** | Update salaries and commission rates |

### Security
- HRM page requires admin role
- Allowed roles: owner, manager, hr_manager
- Non-admins see permission denied message

### Permissions
Users must have one of these roles to access HRM:
- ✅ owner
- ✅ manager
- ✅ hr_manager
- ❌ salesperson
- ❌ accountant
- ❌ inventory_manager
- ❌ service_advisor

---

## IMPLEMENTATION CHECKLIST

### Step 1: Fix RLS Policy (5 minutes)
- [ ] Copy SQL from "FIX #1"
- [ ] Paste into Supabase SQL Editor
- [ ] Click Run
- [ ] Verify success message
- [ ] Test employee add in app

### Step 2: Add Tink Route (2 minutes)
- [ ] Open src/App.tsx
- [ ] Find <Routes> section
- [ ] Add: `<Route path="/bank-integration" element={<BankIntegration />} />`
- [ ] Save file
- [ ] Test navigation to bank-integration

### Step 3: Setup HRM Database (5 minutes)
- [ ] Copy entire HRM_DATABASE_SETUP.sql
- [ ] Paste into Supabase SQL Editor
- [ ] Click Run
- [ ] Verify success message
- [ ] HRM page now accessible

### Step 4: Test HRM Module (10 minutes)
- [ ] Login as admin user
- [ ] Navigate to `/hrm` (or use menu)
- [ ] Test Employees tab
- [ ] Record attendance for one employee
- [ ] Submit leave request
- [ ] Update salary
- [ ] Verify all data persists

---

## Expected Results After Fixes

### After Fix #1
✅ Can add new employees without errors
✅ Employee appears in dropdown lists
✅ Employee data saved in database

### After Fix #2
✅ Settings → Bank Integration → Configure works
✅ Navigates to bank integration page
✅ No 404 errors

### After Fix #3
✅ HRM page accessible from `/hrm`
✅ Can record employee attendance
✅ Can submit leave requests
✅ Can update employee salaries
✅ All data persists in database

---

## Troubleshooting

### Employee Add Still Failing After RLS Fix
1. Clear browser cache: Ctrl+Shift+Delete
2. Restart dev server: npm run dev
3. Try again
4. If still failing, check browser console for exact error

### Bank Integration Still Shows 404
1. Save src/App.tsx after adding route
2. Check file has no syntax errors
3. Reload browser (F5)
4. If BankIntegration.tsx missing, it needs to be created

### HRM Page Shows "No Permission"
1. Verify you're logged in as admin user
2. Check employee record has role: owner, manager, or hr_manager
3. Refresh page
4. Check browser console for auth errors

### HRM Features Not Working After DB Setup
1. Verify all migrations ran without error
2. Check tables exist: employee_attendance, employee_leaves
3. Confirm RLS policies are set to allow access
4. Check browser console for Supabase errors

---

## Files Modified/Created

### Modified
- `src/pages/HRM.tsx` - NEW comprehensive HR management page

### Created
- `HRM_DATABASE_SETUP.sql` - Database tables and policies

### To Modify
- `src/App.tsx` - Add `/bank-integration` route
- (Optional) Layout menu - Add HRM navigation item

---

## Support Commands

**Check if migrations ran:**
```sql
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('employee_attendance', 'employee_leaves');
```

**Check RLS policies:**
```sql
SELECT * FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'employees';
```

**Check employee insert permission:**
```sql
INSERT INTO public.employees 
(role, first_name, last_name, email, department, is_active) 
VALUES ('salesperson', 'Test', 'User', 'test@example.com', 'sales', true);
```

---

## Timeline
- **5 min** - Fix RLS policy + test
- **2 min** - Add Tink route + test  
- **5 min** - Setup HRM database
- **10 min** - Test HRM features
- **Total: ~22 minutes**

---

## You're All Set! 🚀

All three issues are now resolvable with the steps above. Start with Fix #1, then #2, then #3.
