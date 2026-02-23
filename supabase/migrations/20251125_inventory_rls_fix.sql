-- ============================================================================
-- Fix Inventory RLS Policy for Demo Mode
-- This allows demo users to add vehicles without RLS errors
-- Makes inventory table fully accessible for demo purposes
-- ============================================================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins and employees can insert inventory" ON public.inventory;
DROP POLICY IF EXISTS "Admins and employees can update inventory" ON public.inventory;
DROP POLICY IF EXISTS "Admins can delete inventory" ON public.inventory;

-- Create fully permissive policies for demo mode
-- INSERT - allow all
CREATE POLICY "Allow all to insert inventory"
  ON public.inventory FOR INSERT
  WITH CHECK (true);

-- UPDATE - allow all
CREATE POLICY "Allow all to update inventory"
  ON public.inventory FOR UPDATE
  USING (true);

-- DELETE - allow all (for demo purposes)
CREATE POLICY "Allow all to delete inventory"
  ON public.inventory FOR DELETE
  USING (true);

-- SELECT - already allow all
-- ============================================================================
-- END OF FIX
-- ============================================================================

