-- Add vehicle_id column to expenses table to track expenses per vehicle
ALTER TABLE public.expenses 
ADD COLUMN vehicle_id uuid REFERENCES public.inventory(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_expenses_vehicle_id ON public.expenses(vehicle_id);