-- ============================================================================
-- Fix: Complete RLS policies for all tables - Demo Mode
-- Run this in Supabase SQL Editor to allow full access for demo mode
-- ============================================================================

-- ============================================================================
-- CUSTOMERS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "All users can view customers" ON public.customers;
DROP POLICY IF EXISTS "Admins and employees can insert customers" ON public.customers;
DROP POLICY IF EXISTS "Admins and employees can update customers" ON public.customers;
DROP POLICY IF EXISTS "Admins and employees can delete customers" ON public.customers;
DROP POLICY IF EXISTS "Customers select policy" ON public.customers;
DROP POLICY IF EXISTS "Customers insert policy" ON public.customers;
DROP POLICY IF EXISTS "Customers update policy" ON public.customers;
DROP POLICY IF EXISTS "Customers delete policy" ON public.customers;

CREATE POLICY "Customers select policy" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Customers insert policy" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Customers update policy" ON public.customers FOR UPDATE USING (true);
CREATE POLICY "Customers delete policy" ON public.customers FOR DELETE USING (true);

-- ============================================================================
-- VEHICLE_PURCHASES TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Admins can view all vehicle purchases" ON public.vehicle_purchases;
DROP POLICY IF EXISTS "Employees can view vehicle purchases" ON public.vehicle_purchases;
DROP POLICY IF EXISTS "Admins can insert vehicle purchases" ON public.vehicle_purchases;
DROP POLICY IF EXISTS "Admins can update vehicle purchases" ON public.vehicle_purchases;
DROP POLICY IF EXISTS "Admins can delete vehicle purchases" ON public.vehicle_purchases;

CREATE POLICY "Vehicle purchases select policy" ON public.vehicle_purchases FOR SELECT USING (true);
CREATE POLICY "Vehicle purchases insert policy" ON public.vehicle_purchases FOR INSERT WITH CHECK (true);
CREATE POLICY "Vehicle purchases update policy" ON public.vehicle_purchases FOR UPDATE USING (true);
CREATE POLICY "Vehicle purchases delete policy" ON public.vehicle_purchases FOR DELETE USING (true);

-- ============================================================================
-- PURCHASE_PAYMENTS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Admins can view purchase payments" ON public.purchase_payments;
DROP POLICY IF EXISTS "Employees can view purchase payments" ON public.purchase_payments;
DROP POLICY IF EXISTS "Admins can insert purchase payments" ON public.purchase_payments;
DROP POLICY IF EXISTS "Admins can update purchase payments" ON public.purchase_payments;
DROP POLICY IF EXISTS "Admins can delete purchase payments" ON public.purchase_payments;

CREATE POLICY "Purchase payments select policy" ON public.purchase_payments FOR SELECT USING (true);
CREATE POLICY "Purchase payments insert policy" ON public.purchase_payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Purchase payments update policy" ON public.purchase_payments FOR UPDATE USING (true);
CREATE POLICY "Purchase payments delete policy" ON public.purchase_payments FOR DELETE USING (true);

-- ============================================================================
-- INVENTORY TABLE (already fixed but ensure it's correct)
-- ============================================================================
DROP POLICY IF EXISTS "Admins and employees can insert inventory" ON public.inventory;
DROP POLICY IF EXISTS "Admins and employees can update inventory" ON public.inventory;
DROP POLICY IF EXISTS "Admins can delete inventory" ON public.inventory;
DROP POLICY IF EXISTS "Allow all to insert inventory" ON public.inventory;
DROP POLICY IF EXISTS "Allow all to update inventory" ON public.inventory;
DROP POLICY IF EXISTS "Allow all to delete inventory" ON public.inventory;
DROP POLICY IF EXISTS "Inventory select policy" ON public.inventory;

CREATE POLICY "Inventory select policy" ON public.inventory FOR SELECT USING (true);
CREATE POLICY "Inventory insert policy" ON public.inventory FOR INSERT WITH CHECK (true);
CREATE POLICY "Inventory update policy" ON public.inventory FOR UPDATE USING (true);
CREATE POLICY "Inventory delete policy" ON public.inventory FOR DELETE USING (true);

-- ============================================================================
-- VEHICLE_SALES TABLE (already fixed but ensure it's correct)
-- ============================================================================
DROP POLICY IF EXISTS "Vehicle sales select policy" ON public.vehicle_sales;
DROP POLICY IF EXISTS "Vehicle sales insert policy" ON public.vehicle_sales;
DROP POLICY IF EXISTS "Vehicle sales update policy" ON public.vehicle_sales;
DROP POLICY IF EXISTS "Vehicle sales delete policy" ON public.vehicle_sales;

CREATE POLICY "Vehicle sales select policy" ON public.vehicle_sales FOR SELECT USING (true);
CREATE POLICY "Vehicle sales insert policy" ON public.vehicle_sales FOR INSERT WITH CHECK (true);
CREATE POLICY "Vehicle sales update policy" ON public.vehicle_sales FOR UPDATE USING (true);
CREATE POLICY "Vehicle sales delete policy" ON public.vehicle_sales FOR DELETE USING (true);

-- ============================================================================
-- EXPENSES TABLE (already fixed but ensure it's correct)
-- ============================================================================
DROP POLICY IF EXISTS "Expenses select policy" ON public.expenses;
DROP POLICY IF EXISTS "Expenses insert policy" ON public.expenses;
DROP POLICY IF EXISTS "Expenses update policy" ON public.expenses;
DROP POLICY IF EXISTS "Expenses delete policy" ON public.expenses;

CREATE POLICY "Expenses select policy" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Expenses insert policy" ON public.expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Expenses update policy" ON public.expenses FOR UPDATE USING (true);
CREATE POLICY "Expenses delete policy" ON public.expenses FOR DELETE USING (true);

-- ============================================================================
-- PAYMENTS TABLE (already fixed but ensure it's correct)
-- ============================================================================
DROP POLICY IF EXISTS "Payments select policy" ON public.payments;
DROP POLICY IF EXISTS "Payments insert policy" ON public.payments;
DROP POLICY IF EXISTS "Payments update policy" ON public.payments;
DROP POLICY IF EXISTS "Payments delete policy" ON public.payments;

CREATE POLICY "Payments select policy" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Payments insert policy" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Payments update policy" ON public.payments FOR UPDATE USING (true);
CREATE POLICY "Payments delete policy" ON public.payments FOR DELETE USING (true);

-- ============================================================================
-- BANK_TRANSACTIONS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Bank transactions select policy" ON public.bank_transactions;
DROP POLICY IF EXISTS "Bank transactions insert policy" ON public.bank_transactions;
DROP POLICY IF EXISTS "Bank transactions update policy" ON public.bank_transactions;
DROP POLICY IF EXISTS "Bank transactions delete policy" ON public.bank_transactions;

CREATE POLICY "Bank transactions select policy" ON public.bank_transactions FOR SELECT USING (true);
CREATE POLICY "Bank transactions insert policy" ON public.bank_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Bank transactions update policy" ON public.bank_transactions FOR UPDATE USING (true);
CREATE POLICY "Bank transactions delete policy" ON public.bank_transactions FOR DELETE USING (true);

-- ============================================================================
-- SERVICE_RECORDS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Service records select policy" ON public.service_records;
DROP POLICY IF EXISTS "Service records insert policy" ON public.service_records;
DROP POLICY IF EXISTS "Service records update policy" ON public.service_records;
DROP POLICY IF EXISTS "Service records delete policy" ON public.service_records;

CREATE POLICY "Service records select policy" ON public.service_records FOR SELECT USING (true);
CREATE POLICY "Service records insert policy" ON public.service_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Service records update policy" ON public.service_records FOR UPDATE USING (true);
CREATE POLICY "Service records delete policy" ON public.service_records FOR DELETE USING (true);

-- ============================================================================
-- VEHICLE_IMAGES TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Vehicle images select policy" ON public.vehicle_images;
DROP POLICY IF EXISTS "Vehicle images insert policy" ON public.vehicle_images;
DROP POLICY IF EXISTS "Vehicle images update policy" ON public.vehicle_images;
DROP POLICY IF EXISTS "Vehicle images delete policy" ON public.vehicle_images;

CREATE POLICY "Vehicle images select policy" ON public.vehicle_images FOR SELECT USING (true);
CREATE POLICY "Vehicle images insert policy" ON public.vehicle_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Vehicle images update policy" ON public.vehicle_images FOR UPDATE USING (true);
CREATE POLICY "Vehicle images delete policy" ON public.vehicle_images FOR DELETE USING (true);

-- ============================================================================
-- FINANCIAL_OBLIGATIONS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Financial obligations select policy" ON public.financial_obligations;
DROP POLICY IF EXISTS "Financial obligations insert policy" ON public.financial_obligations;
DROP POLICY IF EXISTS "Financial obligations update policy" ON public.financial_obligations;
DROP POLICY IF EXISTS "Financial obligations delete policy" ON public.financial_obligations;

CREATE POLICY "Financial obligations select policy" ON public.financial_obligations FOR SELECT USING (true);
CREATE POLICY "Financial obligations insert policy" ON public.financial_obligations FOR INSERT WITH CHECK (true);
CREATE POLICY "Financial obligations update policy" ON public.financial_obligations FOR UPDATE USING (true);
CREATE POLICY "Financial obligations delete policy" ON public.financial_obligations FOR DELETE USING (true);

-- ============================================================================
-- END OF FIX
-- ============================================================================

