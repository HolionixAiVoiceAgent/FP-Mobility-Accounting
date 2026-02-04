-- ============================================================================
-- Vehicle Sales RLS Fix
-- Fix INSERT/UPDATE operations that fail due to JWT claims not being set
-- ============================================================================

-- Fix vehicle_sales INSERT policy to check user_roles table directly
DROP POLICY IF EXISTS "Admins can insert sales" ON public.vehicle_sales;
CREATE POLICY "Admins can insert sales"
  ON public.vehicle_sales FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- Fix vehicle_sales UPDATE policy to check user_roles table directly
DROP POLICY IF EXISTS "Admins can update sales" ON public.vehicle_sales;
CREATE POLICY "Admins can update sales"
  ON public.vehicle_sales FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- Fix vehicle_sales DELETE policy to check user_roles table directly
DROP POLICY IF EXISTS "Admins can delete sales" ON public.vehicle_sales;
CREATE POLICY "Admins can delete sales"
  ON public.vehicle_sales FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- Fix customers INSERT/UPDATE policies similarly
DROP POLICY IF EXISTS "Admins and employees can insert customers" ON public.customers;
CREATE POLICY "Admins and employees can insert customers"
  ON public.customers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'employee')
    )
  );

DROP POLICY IF EXISTS "Admins and employees can update customers" ON public.customers;
CREATE POLICY "Admins and employees can update customers"
  ON public.customers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'employee')
    )
  );

DROP POLICY IF EXISTS "Admins and employees can delete customers" ON public.customers;
CREATE POLICY "Admins and employees can delete customers"
  ON public.customers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'employee')
    )
  );

-- Fix expenses policies
DROP POLICY IF EXISTS "Admins can insert expenses" ON public.expenses;
CREATE POLICY "Admins can insert expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update expenses" ON public.expenses;
CREATE POLICY "Admins can update expenses"
  ON public.expenses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete expenses" ON public.expenses;
CREATE POLICY "Admins can delete expenses"
  ON public.expenses FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- Fix payments policies
DROP POLICY IF EXISTS "Admins can insert payments" ON public.payments;
CREATE POLICY "Admins can insert payments"
  ON public.payments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update payments" ON public.payments;
CREATE POLICY "Admins can update payments"
  ON public.payments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete payments" ON public.payments;
CREATE POLICY "Admins can delete payments"
  ON public.payments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- Fix company_settings policies
DROP POLICY IF EXISTS "Admins can insert company settings" ON public.company_settings;
CREATE POLICY "Admins can insert company settings"
  ON public.company_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update company settings" ON public.company_settings;
CREATE POLICY "Admins can update company settings"
  ON public.company_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete company settings" ON public.company_settings;
CREATE POLICY "Admins can delete company settings"
  ON public.company_settings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- ============================================================================
-- END OF FIX
-- ============================================================================

