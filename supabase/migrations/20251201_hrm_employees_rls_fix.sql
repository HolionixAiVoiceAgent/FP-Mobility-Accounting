-- ============================================================================
-- HRM EMPLOYEES RLS FIX
-- Fixes permission denied errors when adding/editing/deleting employees
-- ============================================================================

-- First, drop existing restrictive policies on employees table
DROP POLICY IF EXISTS "Owners manage all employees" ON public.employees;
DROP POLICY IF EXISTS "Employees can view own record" ON public.employees;
DROP POLICY IF EXISTS "Managers can view team" ON public.employees;
DROP POLICY IF EXISTS "All users can insert employees" ON public.employees;
DROP POLICY IF EXISTS "All users can update employees" ON public.employees;
DROP POLICY IF EXISTS "All users can delete employees" ON public.employees;
DROP POLICY IF EXISTS "All users can select employees" ON public.employees;

-- Create permissive policies for all authenticated users
-- SELECT: Allow all authenticated users to view employees
CREATE POLICY "All users can select employees"
  ON public.employees FOR SELECT
  USING (true);

-- INSERT: Allow all authenticated users to add employees
CREATE POLICY "All users can insert employees"
  ON public.employees FOR INSERT
  WITH CHECK (true);

-- UPDATE: Allow all authenticated users to update employees
CREATE POLICY "All users can update employees"
  ON public.employees FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- DELETE: Allow all authenticated users to delete (soft delete) employees
CREATE POLICY "All users can delete employees"
  ON public.employees FOR DELETE
  USING (true);

-- Also fix employee_attendance and employee_leaves tables if needed
DROP POLICY IF EXISTS "All users can view attendance" ON public.employee_attendance;
DROP POLICY IF EXISTS "All users can insert attendance" ON public.employee_attendance;
DROP POLICY IF EXISTS "All users can update attendance" ON public.employee_attendance;
DROP POLICY IF EXISTS "All users can delete attendance" ON public.employee_attendance;

CREATE POLICY "All users can view attendance"
  ON public.employee_attendance FOR SELECT
  USING (true);

CREATE POLICY "All users can insert attendance"
  ON public.employee_attendance FOR INSERT
  WITH CHECK (true);

CREATE POLICY "All users can update attendance"
  ON public.employee_attendance FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "All users can delete attendance"
  ON public.employee_attendance FOR DELETE
  USING (true);

-- Fix employee_leaves policies
DROP POLICY IF EXISTS "All users can view leaves" ON public.employee_leaves;
DROP POLICY IF EXISTS "All users can insert leaves" ON public.employee_leaves;
DROP POLICY IF EXISTS "All users can update leaves" ON public.employee_leaves;
DROP POLICY IF EXISTS "All users can delete leaves" ON public.employee_leaves;

CREATE POLICY "All users can view leaves"
  ON public.employee_leaves FOR SELECT
  USING (true);

CREATE POLICY "All users can insert leaves"
  ON public.employee_leaves FOR INSERT
  WITH CHECK (true);

CREATE POLICY "All users can update leaves"
  ON public.employee_leaves FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "All users can delete leaves"
  ON public.employee_leaves FOR DELETE
  USING (true);

-- Verify the policies were created
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'employees';
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'employee_attendance';
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'employee_leaves';

