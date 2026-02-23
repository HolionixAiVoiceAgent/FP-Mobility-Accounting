-- ============================================================================
-- Fix: Add "owner" role to app_role enum and fix RLS policies
-- This fixes the inventory insert issue for demo mode
-- ============================================================================

-- Step 1: Add 'owner' to the app_role enum
CREATE TYPE app_role_new AS ENUM ('admin', 'employee', 'owner');

ALTER TABLE public.user_roles 
ALTER COLUMN role TYPE app_role_new USING role::text::app_role_new;

DROP TYPE app_role;

-- Step 2: Make inventory table fully permissive for demo mode
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins and employees can insert inventory" ON public.inventory;
DROP POLICY IF EXISTS "Admins and employees can update inventory" ON public.inventory;
DROP POLICY IF EXISTS "Admins can delete inventory" ON public.inventory;

-- Create fully permissive policies for demo mode
CREATE POLICY "Allow all to insert inventory"
  ON public.inventory FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all to update inventory"
  ON public.inventory FOR UPDATE USING (true);

CREATE POLICY "Allow all to delete inventory"
  ON public.inventory FOR DELETE USING (true);

-- Make inventory readable by everyone
DROP POLICY IF EXISTS "Inventory select policy" ON public.inventory;
CREATE POLICY "Inventory select policy"
  ON public.inventory FOR SELECT USING (true);

-- Step 3: Also make customer table fully permissive
DROP POLICY IF EXISTS "Customers select policy" ON public.customers;
CREATE POLICY "Customers select policy"
  ON public.customers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Customers insert policy" ON public.customers;
CREATE POLICY "Customers insert policy"
  ON public.customers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Customers update policy" ON public.customers;
CREATE POLICY "Customers update policy"
  ON public.customers FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Customers delete policy" ON public.customers;
CREATE POLICY "Customers delete policy"
  ON public.customers FOR DELETE USING (true);

-- Step 4: Make vehicle_sales table fully permissive
DROP POLICY IF EXISTS "Vehicle sales select policy" ON public.vehicle_sales;
CREATE POLICY "Vehicle sales select policy"
  ON public.vehicle_sales FOR SELECT USING (true);

DROP POLICY IF EXISTS "Vehicle sales insert policy" ON public.vehicle_sales;
CREATE POLICY "Vehicle sales insert policy"
  ON public.vehicle_sales FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Vehicle sales update policy" ON public.vehicle_sales;
CREATE POLICY "Vehicle sales update policy"
  ON public.vehicle_sales FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Vehicle sales delete policy" ON public.vehicle_sales;
CREATE POLICY "Vehicle sales delete policy"
  ON public.vehicle_sales FOR DELETE USING (true);

-- Step 5: Make expenses table fully permissive
DROP POLICY IF EXISTS "Expenses select policy" ON public.expenses;
CREATE POLICY "Expenses select policy"
  ON public.expenses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Expenses insert policy" ON public.expenses;
CREATE POLICY "Expenses insert policy"
  ON public.expenses FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Expenses update policy" ON public.expenses;
CREATE POLICY "Expenses update policy"
  ON public.expenses FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Expenses delete policy" ON public.expenses;
CREATE POLICY "Expenses delete policy"
  ON public.expenses FOR DELETE USING (true);

-- Step 6: Make payments table fully permissive
DROP POLICY IF EXISTS "Payments select policy" ON public.payments;
CREATE POLICY "Payments select policy"
  ON public.payments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Payments insert policy" ON public.payments;
CREATE POLICY "Payments insert policy"
  ON public.payments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Payments update policy" ON public.payments;
CREATE POLICY "Payments update policy"
  ON public.payments FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Payments delete policy" ON public.payments;
CREATE POLICY "Payments delete policy"
  ON public.payments FOR DELETE USING (true);

-- Step 7: Make bank_transactions table fully permissive
DROP POLICY IF EXISTS "Bank transactions select policy" ON public.bank_transactions;
CREATE POLICY "Bank transactions select policy"
  ON public.bank_transactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Bank transactions insert policy" ON public.bank_transactions;
CREATE POLICY "Bank transactions insert policy"
  ON public.bank_transactions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Bank transactions update policy" ON public.bank_transactions;
CREATE POLICY "Bank transactions update policy"
  ON public.bank_transactions FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Bank transactions delete policy" ON public.bank_transactions;
CREATE POLICY "Bank transactions delete policy"
  ON public.bank_transactions FOR DELETE USING (true);

-- ============================================================================
-- END OF FIX
-- ============================================================================
