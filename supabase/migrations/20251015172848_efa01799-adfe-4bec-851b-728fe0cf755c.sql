-- Create vehicle_images table
CREATE TABLE public.vehicle_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_id UUID NOT NULL REFERENCES public.inventory(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vehicle_images
CREATE POLICY "All users can view vehicle images"
ON public.vehicle_images
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and employees can insert vehicle images"
ON public.vehicle_images
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'employee'::app_role));

CREATE POLICY "Admins and employees can update vehicle images"
ON public.vehicle_images
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'employee'::app_role));

CREATE POLICY "Admins and employees can delete vehicle images"
ON public.vehicle_images
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'employee'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_vehicle_images_updated_at
BEFORE UPDATE ON public.vehicle_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('vehicle-images', 'vehicle-images', true);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('expense-receipts', 'expense-receipts', false);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('company-logos', 'company-logos', true);

-- Storage policies for vehicle-images
CREATE POLICY "Public can view vehicle images"
ON storage.objects FOR SELECT
USING (bucket_id = 'vehicle-images');

CREATE POLICY "Authenticated users can upload vehicle images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vehicle-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update vehicle images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'vehicle-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete vehicle images"
ON storage.objects FOR DELETE
USING (bucket_id = 'vehicle-images' AND auth.uid() IS NOT NULL);

-- Storage policies for expense-receipts
CREATE POLICY "Admins can view expense receipts"
ON storage.objects FOR SELECT
USING (bucket_id = 'expense-receipts' AND (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'employee'::app_role)
));

CREATE POLICY "Admins can upload expense receipts"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'expense-receipts' AND (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'employee'::app_role)
));

CREATE POLICY "Admins can delete expense receipts"
ON storage.objects FOR DELETE
USING (bucket_id = 'expense-receipts' AND (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'employee'::app_role)
));

-- Storage policies for company-logos
CREATE POLICY "Public can view company logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-logos');

CREATE POLICY "Admins can upload company logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'company-logos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete company logos"
ON storage.objects FOR DELETE
USING (bucket_id = 'company-logos' AND has_role(auth.uid(), 'admin'::app_role));