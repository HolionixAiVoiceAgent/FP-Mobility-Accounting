-- ============================================================================
-- HRM (HUMAN RESOURCE MANAGEMENT) DATABASE SETUP
-- Run these migrations to enable attendance, leave, and payroll features
-- ============================================================================

-- ============================================================================
-- MIGRATION 1: Create Employee Attendance Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.employee_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in_time TIME NOT NULL,
  check_out_time TIME,
  status TEXT CHECK (status IN ('present', 'absent', 'leave')) DEFAULT 'present',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

ALTER TABLE public.employee_attendance ENABLE ROW LEVEL SECURITY;

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

CREATE INDEX IF NOT EXISTS idx_attendance_employee ON public.employee_attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.employee_attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON public.employee_attendance(status);

-- ============================================================================
-- MIGRATION 2: Create Employee Leaves Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.employee_leaves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL CHECK (leave_type IN ('sick', 'vacation', 'personal', 'unpaid')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  approved_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  approval_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.employee_leaves ENABLE ROW LEVEL SECURITY;

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

CREATE INDEX IF NOT EXISTS idx_leaves_employee ON public.employee_leaves(employee_id);
CREATE INDEX IF NOT EXISTS idx_leaves_start_date ON public.employee_leaves(start_date);
CREATE INDEX IF NOT EXISTS idx_leaves_status ON public.employee_leaves(status);

-- ============================================================================
-- MIGRATION 3: Create Leave Balance View
-- ============================================================================
CREATE OR REPLACE VIEW public.employee_leave_balance AS
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

-- ============================================================================
-- MIGRATION 4: Create Attendance Summary View
-- ============================================================================
CREATE OR REPLACE VIEW public.employee_attendance_summary AS
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
-- MIGRATION 5: Update Employees Table RLS Policies (if needed)
-- ============================================================================
DROP POLICY IF EXISTS "Employees can view own record" ON public.employees;

-- Ensure proper INSERT policy for employees table
DROP POLICY IF EXISTS "All users can insert employees" ON public.employees;
CREATE POLICY "All users can insert employees"
  ON public.employees FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "All users can update employees" ON public.employees;
CREATE POLICY "All users can update employees"
  ON public.employees FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- DONE! All HRM migrations applied successfully
-- ============================================================================
-- Verify setup:
-- SELECT * FROM public.employee_attendance;
-- SELECT * FROM public.employee_leaves;
-- SELECT * FROM public.employee_leave_balance;
-- SELECT * FROM public.employee_attendance_summary;
