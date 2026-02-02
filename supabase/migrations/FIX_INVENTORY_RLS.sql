-- ============================================================================
-- FIX RLS Policies for Inventory Table - Direct JWT Claims Fix
-- This fixes the "new row violates row-level security policy" error
-- ============================================================================

-- Step 1: Drop existing inventory policies
DROP POLICY IF EXISTS "All users can view inventory" ON public.inventory;
DROP POLICY IF EXISTS "Admins and employees can insert inventory" ON public.inventory;
DROP POLICY IF EXISTS "Admins and employees can update inventory" ON public.inventory;
DROP POLICY IF EXISTS "Admins can delete inventory" ON public.inventory;
DROP POLICY IF EXISTS "Enable all operations for inventory" ON public.inventory;

-- Step 2: Create new policies using direct JWT claims
-- SELECT: All authenticated users can view
CREATE POLICY "All authenticated users can view inventory"
  ON public.inventory FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- INSERT: Allow if user has admin OR employee role in user_roles table
CREATE POLICY "Users with role can insert inventory"
  ON public.inventory FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'employee')
  );

-- UPDATE: Allow if user has admin OR employee role in user_roles table  
CREATE POLICY "Users with role can update inventory"
  ON public.inventory FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'employee')
  );

-- DELETE: Allow only if user has admin role
CREATE POLICY "Only admins can delete inventory"
  ON public.inventory FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Step 3: Verify user has role
-- Run this to check your current user's role:
SELECT 
  auth.uid() as current_user,
  (SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1) as user_role;

-- Step 4: If no role, assign one (run this to fix)
-- INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'admin');
-- OR for employee: INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'employee');

-- ============================================================================

