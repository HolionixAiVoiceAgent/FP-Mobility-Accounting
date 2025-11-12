-- Create vehicle_purchases table to track purchases from customers/dealers with deferred payments
CREATE TABLE public.vehicle_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID REFERENCES public.inventory(id) ON DELETE SET NULL,
  seller_type TEXT NOT NULL CHECK (seller_type IN ('customer', 'dealer', 'auction', 'trade_in')),
  seller_name TEXT NOT NULL,
  seller_contact TEXT,
  seller_address TEXT,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  purchase_price NUMERIC NOT NULL,
  payment_terms_days INTEGER DEFAULT 0,
  payment_due_date DATE NOT NULL,
  amount_paid NUMERIC DEFAULT 0,
  outstanding_balance NUMERIC NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue')),
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create purchase_payments table to track partial/full payments
CREATE TABLE public.purchase_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_purchase_id UUID REFERENCES public.vehicle_purchases(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC NOT NULL,
  payment_method TEXT,
  reference_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.vehicle_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vehicle_purchases
CREATE POLICY "Admins can view all vehicle purchases"
  ON public.vehicle_purchases FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Employees can view vehicle purchases"
  ON public.vehicle_purchases FOR SELECT
  USING (has_role(auth.uid(), 'employee'));

CREATE POLICY "Admins can insert vehicle purchases"
  ON public.vehicle_purchases FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update vehicle purchases"
  ON public.vehicle_purchases FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete vehicle purchases"
  ON public.vehicle_purchases FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for purchase_payments
CREATE POLICY "Admins can view all purchase payments"
  ON public.purchase_payments FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Employees can view purchase payments"
  ON public.purchase_payments FOR SELECT
  USING (has_role(auth.uid(), 'employee'));

CREATE POLICY "Admins can insert purchase payments"
  ON public.purchase_payments FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update purchase payments"
  ON public.purchase_payments FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete purchase payments"
  ON public.purchase_payments FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_vehicle_purchases_updated_at
  BEFORE UPDATE ON public.vehicle_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update purchase status based on payments
CREATE OR REPLACE FUNCTION public.update_purchase_payment_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the outstanding balance and payment status
  UPDATE public.vehicle_purchases
  SET 
    amount_paid = COALESCE((
      SELECT SUM(amount)
      FROM public.purchase_payments
      WHERE vehicle_purchase_id = NEW.vehicle_purchase_id
    ), 0),
    outstanding_balance = purchase_price - COALESCE((
      SELECT SUM(amount)
      FROM public.purchase_payments
      WHERE vehicle_purchase_id = NEW.vehicle_purchase_id
    ), 0),
    payment_status = CASE
      WHEN purchase_price <= COALESCE((
        SELECT SUM(amount)
        FROM public.purchase_payments
        WHERE vehicle_purchase_id = NEW.vehicle_purchase_id
      ), 0) THEN 'paid'
      WHEN COALESCE((
        SELECT SUM(amount)
        FROM public.purchase_payments
        WHERE vehicle_purchase_id = NEW.vehicle_purchase_id
      ), 0) > 0 THEN 'partial'
      WHEN payment_due_date < CURRENT_DATE THEN 'overdue'
      ELSE 'pending'
    END,
    updated_at = NOW()
  WHERE id = NEW.vehicle_purchase_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-update purchase status when payment is recorded
CREATE TRIGGER update_purchase_status_on_payment
  AFTER INSERT OR UPDATE OR DELETE ON public.purchase_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_purchase_payment_status();

-- Create indexes for better query performance
CREATE INDEX idx_vehicle_purchases_inventory_id ON public.vehicle_purchases(inventory_id);
CREATE INDEX idx_vehicle_purchases_payment_status ON public.vehicle_purchases(payment_status);
CREATE INDEX idx_vehicle_purchases_payment_due_date ON public.vehicle_purchases(payment_due_date);
CREATE INDEX idx_purchase_payments_vehicle_purchase_id ON public.purchase_payments(vehicle_purchase_id);