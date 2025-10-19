-- Create inventory table for vehicle management
CREATE TABLE public.inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_id TEXT NOT NULL UNIQUE,
  vin TEXT NOT NULL UNIQUE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  color TEXT,
  mileage INTEGER,
  purchase_price NUMERIC NOT NULL,
  expected_sale_price NUMERIC,
  actual_sale_price NUMERIC,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold', 'pending_repair', 'reserved', 'in_transit')),
  location TEXT,
  tuv_expiry DATE,
  last_service_date DATE,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sale_date DATE,
  images_count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- Create policies for inventory access
CREATE POLICY "Enable all operations for inventory" 
ON public.inventory 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_inventory_status ON public.inventory(status);
CREATE INDEX idx_inventory_make_model ON public.inventory(make, model);
CREATE INDEX idx_inventory_year ON public.inventory(year);
CREATE INDEX idx_inventory_purchase_date ON public.inventory(purchase_date);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_inventory_updated_at
BEFORE UPDATE ON public.inventory
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample inventory data
INSERT INTO public.inventory (
  inventory_id, vin, make, model, year, color, mileage, 
  purchase_price, expected_sale_price, status, location, 
  tuv_expiry, last_service_date, purchase_date, images_count, notes
) VALUES
('INV2024001', 'WBA3A5G50FNS12345', 'BMW', '320i', 2023, 'Schwarz Metallic', 25000, 22000, 28500, 'available', 'Lot A-12', '2025-08-15', '2024-01-05', '2023-11-01', 3, 'Excellent condition, one owner'),
('INV2024002', 'WDD2050461F123456', 'Mercedes', 'C200', 2022, 'Weiß', 35000, 26000, 32000, 'sold', 'Delivered', '2024-11-20', '2024-01-10', '2023-12-15', 5, 'Sold to regular customer'),
('INV2024003', 'WAUZZZF4XNA123456', 'Audi', 'A4', 2023, 'Grau Metallic', 18000, 28000, 35500, 'pending_repair', 'Workshop Bay 2', '2026-03-10', '2024-01-08', '2023-10-15', 4, 'Minor cosmetic repairs needed'),
('INV2024004', 'WVWZZZ1KZAW123456', 'Volkswagen', 'Golf GTI', 2022, 'Rot', 42000, 19000, 24000, 'reserved', 'Lot B-05', '2025-05-22', '2023-12-15', '2023-12-20', 6, 'Reserved for customer Meyer'),
('INV2024005', 'WBAVA31090A123456', 'BMW', 'X3', 2021, 'Schwarz', 58000, 32000, 38000, 'available', 'Lot A-08', '2024-09-15', '2023-11-20', '2023-11-25', 4, 'Popular SUV model'),
('INV2024006', 'WF0AXXGCDA123456', 'Ford', 'Focus', 2020, 'Blau', 75000, 12000, 16500, 'available', 'Lot C-03', '2024-06-10', '2023-10-05', '2023-12-01', 2, 'Good value for money'),
('INV2024007', 'VF1KZ000A12345678', 'Renault', 'Clio', 2019, 'Silber', 82000, 8500, 12000, 'in_transit', 'En Route', '2024-03-20', '2023-09-15', '2024-01-10', 1, 'Being transported from auction'),
('INV2024008', 'WAUZZZ8V9KA123456', 'Audi', 'Q5', 2022, 'Grau', 28000, 38000, 45000, 'available', 'Lot A-15', '2025-12-01', '2024-01-12', '2023-12-10', 6, 'Premium SUV, excellent condition');

-- Add some vehicles with longer stock times for testing aging alerts
UPDATE public.inventory 
SET purchase_date = '2023-10-01'
WHERE inventory_id IN ('INV2024003', 'INV2024006');

UPDATE public.inventory 
SET purchase_date = '2023-09-01'
WHERE inventory_id = 'INV2024007';