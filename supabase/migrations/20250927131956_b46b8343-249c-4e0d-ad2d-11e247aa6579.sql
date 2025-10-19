-- Fix the profit column - drop expression and make it a regular column
ALTER TABLE vehicle_sales ALTER COLUMN profit DROP EXPRESSION;
ALTER TABLE vehicle_sales ALTER COLUMN profit SET NOT NULL;

-- Create function to calculate profit automatically
CREATE OR REPLACE FUNCTION calculate_vehicle_profit()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profit = NEW.sale_price - NEW.purchase_price;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate profit
CREATE TRIGGER calculate_profit_trigger
  BEFORE INSERT OR UPDATE ON vehicle_sales
  FOR EACH ROW
  EXECUTE FUNCTION calculate_vehicle_profit();