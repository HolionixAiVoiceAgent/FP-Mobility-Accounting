-- Fix for: null value in column "vehicle make" of relation "vehicle sales" violated not null constraint
-- This migration ensures all inventory vehicles have valid make values

-- Step 1: Check and fix any null or empty make values in inventory
-- First, let's see what we have
SELECT id, inventory_id, make, model, vin FROM inventory WHERE make IS NULL OR make = '';

-- Update any null or empty make values to 'Unknown' as a fallback
-- This ensures the database constraint is never violated
UPDATE inventory 
SET make = COALESCE(NULLIF(trim(make), ''), 'Unknown')
WHERE make IS NULL OR make = '' OR trim(make) = '';

-- Step 2: Also ensure model is not null
UPDATE inventory 
SET model = COALESCE(NULLIF(trim(model), ''), 'Unknown')
WHERE model IS NULL OR model = '' OR trim(model) = '';

-- Step 3: Ensure year is not null
UPDATE inventory 
SET year = COALESCE(year, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER)
WHERE year IS NULL;

-- Verify the fixes
SELECT id, inventory_id, make, model, year, vin, status 
FROM inventory 
WHERE make IS NULL OR make = '' OR model IS NULL OR model = '';

-- Step 4: Add a NOT NULL constraint to make and model if they don't have one
-- (Run these manually in Supabase dashboard if needed)
-- ALTER TABLE inventory ALTER COLUMN make SET NOT NULL;
-- ALTER TABLE inventory ALTER COLUMN model SET NOT NULL;

