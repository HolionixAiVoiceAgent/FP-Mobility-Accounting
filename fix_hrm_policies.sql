-- Fix employees table permissions (drop first, then create)
DROP POLICY IF EXISTS "Owners manage all employees" ON public.employees;
DROP POLICY IF EXISTS "All users can insert employees" ON public.employees;
DROP POLICY IF EXISTS "All users can update employees" ON public.employees;
DROP POLICY IF EXISTS "All users can delete employees" ON public.employees;
DROP POLICY IF EXISTS "All users can select employees" ON public.employees;

CREATE POLICY "emp_select" ON public.employees FOR SELECT USING (true);
CREATE POLICY "emp_insert" ON public.employees FOR INSERT WITH CHECK (true);
CREATE POLICY "emp_update" ON public.employees FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "emp_delete" ON public.employees FOR DELETE USING (true);

-- Fix HRM attendance table
DROP POLICY IF EXISTS "All users can view attendance" ON public.employee_attendance;
DROP POLICY IF EXISTS "All users can insert attendance" ON public.employee_attendance;
DROP POLICY IF EXISTS "All users can update attendance" ON public.employee_attendance;
DROP POLICY IF EXISTS "All users can delete attendance" ON public.employee_attendance;

CREATE POLICY "att_select" ON public.employee_attendance FOR SELECT USING (true);
CREATE POLICY "att_insert" ON public.employee_attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "att_update" ON public.employee_attendance FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "att_delete" ON public.employee_attendance FOR DELETE USING (true);

-- Fix HRM leaves table
DROP POLICY IF EXISTS "All users can view leaves" ON public.employee_leaves;
DROP POLICY IF EXISTS "All users can insert leaves" ON public.employee_leaves;
DROP POLICY IF EXISTS "All users can update leaves" ON public.employee_leaves;
DROP POLICY IF EXISTS "All users can delete leaves" ON public.employee_leaves;

CREATE POLICY "leave_select" ON public.employee_leaves FOR SELECT USING (true);
CREATE POLICY "leave_insert" ON public.employee_leaves FOR INSERT WITH CHECK (true);
CREATE POLICY "leave_update" ON public.employee_leaves FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "leave_delete" ON public.employee_leaves FOR DELETE USING (true);

SELECT 'HRM policies fixed successfully' as result;
