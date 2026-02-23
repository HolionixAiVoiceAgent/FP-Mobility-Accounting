-- ============================================================================
-- Fix: Financial Obligations RLS Policy
-- This migration ensures the financial_obligations table has proper RLS policies
-- Run this in Supabase SQL Editor to fix the insert issue
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Financial obligations select policy" ON public.financial_obligations;
DROP POLICY IF EXISTS "Financial obligations insert policy" ON public.financial_obligations;
DROP POLICY IF EXISTS "Financial obligations update policy" ON public.financial_obligations;
DROP POLICY IF EXISTS "Financial obligations delete policy" ON public.financial_obligations;

-- Create permissive RLS policies for demo mode (allow all operations)
CREATE POLICY "Financial obligations select policy" ON public.financial_obligations FOR SELECT USING (true);
CREATE POLICY "Financial obligations insert policy" ON public.financial_obligations FOR INSERT WITH CHECK (true);
CREATE POLICY "Financial obligations update policy" ON public.financial_obligations FOR UPDATE USING (true);
CREATE POLICY "Financial obligations delete policy" ON public.financial_obligations FOR DELETE USING (true);

-- Verify the table exists and RLS is enabled
ALTER TABLE public.financial_obligations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- END OF FIX
-- ============================================================================

