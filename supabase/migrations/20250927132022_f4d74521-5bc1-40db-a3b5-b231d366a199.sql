-- Fix the function search path security issue
CREATE OR REPLACE FUNCTION calculate_vehicle_profit()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.profit = NEW.sale_price - NEW.purchase_price;
  RETURN NEW;
END;
$$;