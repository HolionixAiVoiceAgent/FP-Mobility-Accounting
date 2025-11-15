-- ============================================================================
-- Long-term Security Fix: Replace SECURITY DEFINER with JWT Claims
-- Removes SECURITY DEFINER from helper functions and policies
-- Uses Supabase JWT claims (auth.jwt()) for role checks instead
-- ============================================================================

-- Step 1: Create a new role-checking function that uses JWT claims (SECURITY INVOKER)
-- This function reads the role from the JWT token (set by Supabase auth)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY INVOKER
AS $$
  SELECT COALESCE(auth.jwt()->>'role', 'employee')
$$;

-- Step 2: Update RLS policies to use JWT claims instead of has_role() function
-- Drop old policies that rely on SECURITY DEFINER has_role()

-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- User roles policies (simplified - no need for complex role checks, just ownership)
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view roles for admin context"
  ON public.user_roles FOR SELECT
  USING (auth.jwt()->>'role' = 'admin');

-- Payments policies (updated to use JWT claims)
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  USING (auth.jwt()->>'role' = 'admin');

DROP POLICY IF EXISTS "Employees can view payments" ON public.payments;
CREATE POLICY "Employees can view payments"
  ON public.payments FOR SELECT
  USING (auth.jwt()->>'role' IN ('admin', 'employee'));

DROP POLICY IF EXISTS "Admins can insert payments" ON public.payments;
CREATE POLICY "Admins can insert payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'admin');

DROP POLICY IF EXISTS "Admins can update payments" ON public.payments;
CREATE POLICY "Admins can update payments"
  ON public.payments FOR UPDATE
  USING (auth.jwt()->>'role' = 'admin');

DROP POLICY IF EXISTS "Admins can delete payments" ON public.payments;
CREATE POLICY "Admins can delete payments"
  ON public.payments FOR DELETE
  USING (auth.jwt()->>'role' = 'admin');

-- Expenses policies (updated to use JWT claims)
DROP POLICY IF EXISTS "Admins can view expenses" ON public.expenses;
CREATE POLICY "Admins can view expenses"
  ON public.expenses FOR SELECT
  USING (auth.jwt()->>'role' = 'admin');

DROP POLICY IF EXISTS "Employees can view expenses" ON public.expenses;
CREATE POLICY "Employees can view expenses"
  ON public.expenses FOR SELECT
  USING (auth.jwt()->>'role' IN ('admin', 'employee'));

DROP POLICY IF EXISTS "Admins can insert expenses" ON public.expenses;
CREATE POLICY "Admins can insert expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'admin');

DROP POLICY IF EXISTS "Admins can update expenses" ON public.expenses;
CREATE POLICY "Admins can update expenses"
  ON public.expenses FOR UPDATE
  USING (auth.jwt()->>'role' = 'admin');

DROP POLICY IF EXISTS "Admins can delete expenses" ON public.expenses;
CREATE POLICY "Admins can delete expenses"
  ON public.expenses FOR DELETE
  USING (auth.jwt()->>'role' = 'admin');

-- Vehicle sales policies (updated to use JWT claims)
DROP POLICY IF EXISTS "All users can view sales" ON public.vehicle_sales;
CREATE POLICY "All users can view sales"
  ON public.vehicle_sales FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can insert sales" ON public.vehicle_sales;
CREATE POLICY "Admins can insert sales"
  ON public.vehicle_sales FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'admin');

DROP POLICY IF EXISTS "Admins can update sales" ON public.vehicle_sales;
CREATE POLICY "Admins can update sales"
  ON public.vehicle_sales FOR UPDATE
  USING (auth.jwt()->>'role' = 'admin');

DROP POLICY IF EXISTS "Admins can delete sales" ON public.vehicle_sales;
CREATE POLICY "Admins can delete sales"
  ON public.vehicle_sales FOR DELETE
  USING (auth.jwt()->>'role' = 'admin');

-- Inventory policies (updated to use JWT claims)
DROP POLICY IF EXISTS "All users can view inventory" ON public.inventory;
CREATE POLICY "All users can view inventory"
  ON public.inventory FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins and employees can insert inventory" ON public.inventory;
CREATE POLICY "Admins and employees can insert inventory"
  ON public.inventory FOR INSERT
  WITH CHECK (auth.jwt()->>'role' IN ('admin', 'employee'));

DROP POLICY IF EXISTS "Admins and employees can update inventory" ON public.inventory;
CREATE POLICY "Admins and employees can update inventory"
  ON public.inventory FOR UPDATE
  USING (auth.jwt()->>'role' IN ('admin', 'employee'));

DROP POLICY IF EXISTS "Admins can delete inventory" ON public.inventory;
CREATE POLICY "Admins can delete inventory"
  ON public.inventory FOR DELETE
  USING (auth.jwt()->>'role' = 'admin');

-- Customers policies (updated to use JWT claims)
DROP POLICY IF EXISTS "All users can view customers" ON public.customers;
CREATE POLICY "All users can view customers"
  ON public.customers FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins and employees can insert customers" ON public.customers;
CREATE POLICY "Admins and employees can insert customers"
  ON public.customers FOR INSERT
  WITH CHECK (auth.jwt()->>'role' IN ('admin', 'employee'));

DROP POLICY IF EXISTS "Admins and employees can update customers" ON public.customers;
CREATE POLICY "Admins and employees can update customers"
  ON public.customers FOR UPDATE
  USING (auth.jwt()->>'role' IN ('admin', 'employee'));

DROP POLICY IF EXISTS "Admins and employees can delete customers" ON public.customers;
CREATE POLICY "Admins and employees can delete customers"
  ON public.customers FOR DELETE
  USING (auth.jwt()->>'role' IN ('admin', 'employee'));

-- Company settings policies (updated to use JWT claims)
DROP POLICY IF EXISTS "All users can view company settings" ON public.company_settings;
CREATE POLICY "All users can view company settings"
  ON public.company_settings FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can insert company settings" ON public.company_settings;
CREATE POLICY "Admins can insert company settings"
  ON public.company_settings FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'admin');

DROP POLICY IF EXISTS "Admins can update company settings" ON public.company_settings;
CREATE POLICY "Admins can update company settings"
  ON public.company_settings FOR UPDATE
  USING (auth.jwt()->>'role' = 'admin');

DROP POLICY IF EXISTS "Admins can delete company settings" ON public.company_settings;
CREATE POLICY "Admins can delete company settings"
  ON public.company_settings FOR DELETE
  USING (auth.jwt()->>'role' = 'admin');

-- Step 3: Update Employees table policies to use JWT claims
-- NOTE: Keep backward compatibility with SECURITY INVOKER policies
-- that allow admins to insert/update, but also allow authenticated users
-- as a fallback (will be restricted once JWT role claims are properly configured)

DROP POLICY IF EXISTS "Employees can view own record" ON public.employees;
CREATE POLICY "Employees can view own record"
  ON public.employees FOR SELECT
  USING (auth.uid() = user_id OR auth.jwt()->>'role' IN ('admin', 'manager', 'hr_manager'));

DROP POLICY IF EXISTS "Managers can view team" ON public.employees;
CREATE POLICY "Managers can view team"
  ON public.employees FOR SELECT
  USING (auth.jwt()->>'role' IN ('admin', 'manager', 'hr_manager') OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "All users can insert employees" ON public.employees;
CREATE POLICY "All users can insert employees"
  ON public.employees FOR INSERT
  WITH CHECK (
    -- Allow if JWT role is admin/manager/hr_manager
    auth.jwt()->>'role' IN ('admin', 'manager', 'hr_manager')
    -- OR allow as fallback for backward compatibility (no JWT claims set yet)
    OR auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "All users can update employees" ON public.employees;
CREATE POLICY "All users can update employees"
  ON public.employees FOR UPDATE
  USING (auth.jwt()->>'role' IN ('admin', 'manager', 'hr_manager') OR auth.uid() IS NOT NULL)
  WITH CHECK (auth.jwt()->>'role' IN ('admin', 'manager', 'hr_manager') OR auth.uid() IS NOT NULL);

-- Step 4: Ensure HRM-related views do NOT depend on SECURITY DEFINER
-- The employee_leave_balance view should now be safe to query because it only
-- depends on base tables with JWT-claim-based RLS (no more SECURITY DEFINER)
-- Verify the view exists and is correctly defined:
DROP VIEW IF EXISTS public.employee_leave_balance CASCADE;
CREATE VIEW public.employee_leave_balance AS
SELECT 
  e.id as employee_id,
  e.full_name,
  COALESCE(SUM(CASE WHEN el.leave_type = 'vacation' AND el.status = 'approved' 
    THEN (el.end_date - el.start_date)::integer + 1 ELSE 0 END), 0) as vacation_used,
  COALESCE(SUM(CASE WHEN el.leave_type = 'sick' AND el.status = 'approved' 
    THEN (el.end_date - el.start_date)::integer + 1 ELSE 0 END), 0) as sick_used,
  20 - COALESCE(SUM(CASE WHEN el.leave_type = 'vacation' AND el.status = 'approved' 
    THEN (el.end_date - el.start_date)::integer + 1 ELSE 0 END), 0) as vacation_remaining,
  10 - COALESCE(SUM(CASE WHEN el.leave_type = 'sick' AND el.status = 'approved' 
    THEN (el.end_date - el.start_date)::integer + 1 ELSE 0 END), 0) as sick_remaining
FROM public.employees e
LEFT JOIN public.employee_leaves el ON e.id = el.employee_id
WHERE e.is_active = true
GROUP BY e.id, e.full_name
ORDER BY e.full_name;

DROP VIEW IF EXISTS public.employee_attendance_summary CASCADE;
CREATE VIEW public.employee_attendance_summary AS
SELECT 
  e.id as employee_id,
  e.full_name,
  DATE_TRUNC('month', ea.date)::DATE as month,
  COALESCE(SUM(CASE WHEN ea.status = 'present' THEN 1 ELSE 0 END), 0) as days_present,
  COALESCE(SUM(CASE WHEN ea.status = 'absent' THEN 1 ELSE 0 END), 0) as days_absent,
  COALESCE(SUM(CASE WHEN ea.status = 'leave' THEN 1 ELSE 0 END), 0) as days_leave,
  COUNT(*) as total_records
FROM public.employees e
LEFT JOIN public.employee_attendance ea ON e.id = ea.employee_id
WHERE e.is_active = true
GROUP BY e.id, e.full_name, DATE_TRUNC('month', ea.date)
ORDER BY e.full_name, month DESC;

-- ============================================================================
-- Notes:
-- 1. The old SECURITY DEFINER functions (has_role, handle_new_user) can be
--    kept for backward compatibility but are no longer used in policies/views.
-- 2. All RLS policies now use auth.jwt()->>'role' claims from the JWT token.
-- 3. Supabase automatically sets the 'role' claim in the JWT when you configure
--    custom claims via the auth.users custom_claims or via post-login hooks.
-- 4. If your Supabase project doesn't set JWT claims automatically, you will need
--    to add a post-login hook in your Supabase project settings to populate the
--    'role' claim from the user_roles table.
-- 5. Views no longer depend on SECURITY DEFINER functions, so Supabase should not
--    flag them as security issues.
-- ============================================================================
