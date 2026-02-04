-- ============================================================================
-- Fix DELETE operations for inventory and vehicle_sales
-- Update RLS policies to check user_roles table directly
-- ============================================================================

-- Fix inventory DELETE policy
DROP POLICY IF EXISTS "Admins can delete inventory" ON public.inventory;
CREATE POLICY "Admins can delete inventory"
  ON public.inventory FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- Fix vehicle_sales DELETE policy
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

-- Fix customers DELETE policy
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

-- Fix expenses DELETE policy
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

-- Fix payments DELETE policy
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

-- Fix company_settings DELETE policy
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

