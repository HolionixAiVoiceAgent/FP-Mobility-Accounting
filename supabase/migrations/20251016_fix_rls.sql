-- ============================================================================
-- FIX RLS POLICIES FOR VEHICLE_IMAGES TABLE
-- This fixes the restrictive policies that prevent image operations
-- ============================================================================

-- Fix the RLS policies to be less restrictive
DROP POLICY IF EXISTS "All users can view vehicle images" ON public.vehicle_images;
DROP POLICY IF EXISTS "Admins and employees can insert vehicle images" ON public.vehicle_images;
DROP POLICY IF EXISTS "Admins and employees can update vehicle images" ON public.vehicle_images;
DROP POLICY IF EXISTS "Admins and employees can delete vehicle images" ON public.vehicle_images;

-- Simple policies that work without the has_role function
CREATE POLICY "Anyone can view vehicle images" ON public.vehicle_images FOR SELECT USING (true);

CREATE POLICY "Anyone can insert vehicle images" ON public.vehicle_images FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update vehicle images" ON public.vehicle_images FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can delete vehicle images" ON public.vehicle_images FOR DELETE USING (true);

-- Also fix storage policies for vehicle-images bucket
DROP POLICY IF EXISTS "Public can view vehicle images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload vehicle images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update vehicle images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete vehicle images" ON storage.objects;

CREATE POLICY "Public can view vehicle images" ON storage.objects FOR SELECT USING (bucket_id = 'vehicle-images');

CREATE POLICY "Anyone can upload vehicle images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vehicle-images');

CREATE POLICY "Anyone can update vehicle images" ON storage.objects FOR UPDATE USING (bucket_id = 'vehicle-images');

CREATE POLICY "Anyone can delete vehicle images" ON storage.objects FOR DELETE USING (bucket_id = 'vehicle-images');

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'vehicle_images' 
ORDER BY ordinal_position;

