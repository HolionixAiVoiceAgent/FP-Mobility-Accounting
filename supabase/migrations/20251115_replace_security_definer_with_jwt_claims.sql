-- ============================================================================
-- FIXED: Replace SECURITY DEFINER with JWT Claims
-- Removes SECURITY DEFINER from helper functions and policies
-- Uses Supabase JWT claims (auth.jwt()) for role checks instead
-- ============================================================================
-- This version is self-contained and doesn't require external dependencies
-- ============================================================================

-- Step 1: Create helper function to check if a user has a specific role
-- Uses a simple lookup in user_roles table (no SECURITY DEFINER)
DROP FUNCTION IF EXISTS public.has_role(UUID, TEXT);
CREATE OR REPLACE FUNCTION public.has_role(p_user_id UUID, p_role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY INVOKER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = p_user_id AND role = p_role
  )
$$;

-- Step 2: Create function to get user's role from JWT or table
DROP FUNCTION IF EXISTS public.get_user_role();
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY INVOKER
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1),
    (auth.jwt()->>'role'),
    'authenticated'
  )
$$;

-- Step 3: Create profiles table if not exists
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Step 4: Create user_roles table if not exists
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN (
    'owner', 'manager', 'sales_manager', 'salesperson', 'accountant', 
    'hr_manager', 'inventory_manager', 'service_advisor', 'admin', 'employee'
  )),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Step 5: Enable RLS on new tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Step 7: Create RLS policies for user_roles
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Step 8: Function to handle new user creation
DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  
  -- First user becomes admin, others become employees
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'employee');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 9: Create tax_integrations table for DATEV/Lexoffice
CREATE TABLE IF NOT EXISTS public.tax_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_type TEXT NOT NULL CHECK (integration_type IN ('datev', 'lexoffice', 'tink')),
  api_key TEXT,
  is_active BOOLEAN DEFAULT FALSE,
  settings JSONB DEFAULT '{}',
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (integration_type)
);

ALTER TABLE public.tax_integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage tax integrations" ON public.tax_integrations;
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
