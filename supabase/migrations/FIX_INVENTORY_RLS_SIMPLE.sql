-- Drop existing inventory policies
DROP POLICY IF EXISTS "All users can view inventory" ON public.inventory;
DROP POLICY IF EXISTS "Admins and employees can insert inventory" ON public.inventory;
DROP POLICY IF EXISTS "Admins and employees can update inventory" ON public.inventory;
DROP POLICY IF EXISTS "Admins can delete inventory" ON public.inventory;
DROP POLICY IF EXISTS "Enable all operations for inventory" ON public.inventory;

-- Create new policies using user_roles table
CREATE POLICY "All authenticated users can view inventory"
  ON public.inventory FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users with role can insert inventory"
  ON public.inventory FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'employee')
  );

CREATE POLICY "Users with role can update inventory"
  ON public.inventory FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'employee')
  );

CREATE POLICY "Only admins can delete inventory"
  ON public.inventory FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Assign admin role to current user
INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'admin');

-- Verify
SELECT 
  auth.uid() as current_user,
  (SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1) as user_role;

