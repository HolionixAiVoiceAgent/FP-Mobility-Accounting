-- ============================================================================
-- Fix: RLS policies for vehicle_purchases and purchase_payments tables
-- Run this in Supabase SQL Editor to allow demo mode access
-- ============================================================================

-- Step 1: Drop existing restrictive policies for vehicle_purchases
DROP POLICY IF EXISTS "Admins can view all vehicle purchases" ON public.vehicle_purchases;
DROP POLICY IF EXISTS "Employees can view vehicle purchases" ON public.vehicle_purchases;
DROP POLICY IF EXISTS "Admins can insert vehicle purchases" ON public.vehicle_purchases;
DROP POLICY IF EXISTS "Admins can update vehicle purchases" ON public.vehicle_purchases;
DROP POLICY IF EXISTS "Admins can delete vehicle purchases" ON public.vehicle_purchases;

-- Step 2: Create permissive policies for demo mode - vehicle_purchases
CREATE POLICY "Vehicle purchases select policy"
  ON public.vehicle_purchases FOR SELECT USING (true);

CREATE POLICY "Vehicle purchases insert policy"
  ON public.vehicle_purchases FOR INSERT WITH CHECK (true);

CREATE POLICY "Vehicle purchases update policy"
  ON public.vehicle_purchases FOR UPDATE USING (true);

CREATE POLICY "Vehicle purchases delete policy"
  ON public.vehicle_purchases FOR DELETE USING (true);

-- Step 3: Drop existing restrictive policies for purchase_payments
DROP POLICY IF EXISTS "Admins can view purchase payments" ON public.purchase_payments;
DROP POLICY IF EXISTS "Employees can view purchase payments" ON public.purchase_payments;
DROP POLICY IF EXISTS "Admins can insert purchase payments" ON public.purchase_payments;
DROP POLICY IF EXISTS "Admins can update purchase payments" ON public.purchase_payments;
DROP POLICY IF EXISTS "Admins can delete purchase payments" ON public.purchase_payments;

-- Step 4: Create permissive policies for demo mode - purchase_payments
CREATE POLICY "Purchase payments select policy"
  ON public.purchase_payments FOR SELECT USING (true);

CREATE POLICY "Purchase payments insert policy"
  ON public.purchase_payments FOR INSERT WITH CHECK (true);

CREATE POLICY "Purchase payments update policy"
  ON public.purchase_payments FOR UPDATE USING (true);

CREATE POLICY "Purchase payments delete policy"
  ON public.purchase_payments FOR DELETE USING (true);

-- ============================================================================
-- END OF FIX
-- ============================================================================

