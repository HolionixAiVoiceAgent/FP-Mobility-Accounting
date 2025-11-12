-- Create service_records table to track vehicle maintenance and repairs
CREATE TABLE public.service_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID REFERENCES public.inventory(id) ON DELETE CASCADE,
  service_date DATE NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('oil_change', 'inspection', 'repair', 'tuv', 'tire_change', 'brake_service', 'other')),
  description TEXT NOT NULL,
  mileage_at_service INTEGER,
  cost NUMERIC,
  vendor_name TEXT,
  next_service_date DATE,
  next_service_mileage INTEGER,
  invoice_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.service_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for service_records
CREATE POLICY "All users can view service records"
  ON public.service_records FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and employees can insert service records"
  ON public.service_records FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'employee'));

CREATE POLICY "Admins and employees can update service records"
  ON public.service_records FOR UPDATE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'employee'));

CREATE POLICY "Admins can delete service records"
  ON public.service_records FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_service_records_updated_at
  BEFORE UPDATE ON public.service_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_service_records_inventory_id ON public.service_records(inventory_id);
CREATE INDEX idx_service_records_service_date ON public.service_records(service_date);
CREATE INDEX idx_service_records_next_service_date ON public.service_records(next_service_date);