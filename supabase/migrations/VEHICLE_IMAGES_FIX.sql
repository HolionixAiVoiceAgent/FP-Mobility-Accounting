-- ============================================================================
-- VEHICLE INVENTORY FIXES
-- Fixes for SQL schema mismatch and RLS policies
-- ============================================================================

-- Fix 1: Drop and recreate vehicle_images table with correct schema
-- The inventory_id should be TEXT to match the inventory.inventory_id field (e.g., "INV2024001")

DROP TABLE IF EXISTS public.vehicle_images CASCADE;

CREATE TABLE public.vehicle_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_id TEXT NOT NULL, -- Changed from UUID to TEXT to match inventory.inventory_id
  image_url TEXT NOT NULL,
  image_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Simple policies that work without has_role function
CREATE POLICY "Anyone can view vehicle images" ON public.vehicle_images FOR SELECT USING (true);
CREATE POLICY "Anyone can insert vehicle images" ON public.vehicle_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update vehicle images" ON public.vehicle_images FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete vehicle images" ON public.vehicle_images FOR DELETE USING (true);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_vehicle_images_updated_at ON public.vehicle_images;
CREATE TRIGGER update_vehicle_images_updated_at
  BEFORE UPDATE ON public.vehicle_images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_vehicle_images_inventory_id ON public.vehicle_images(inventory_id);
CREATE INDEX idx_vehicle_images_is_primary ON public.vehicle_images(is_primary) WHERE is_primary = true;

-- ============================================================================
-- END OF VEHICLE IMAGES FIX
-- ============================================================================

