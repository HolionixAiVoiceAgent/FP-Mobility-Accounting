-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'employee');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on profiles and user_roles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  
  -- First user becomes admin, others become employees
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'employee');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  vehicle_sale_id UUID REFERENCES public.vehicle_sales(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  payment_date DATE DEFAULT CURRENT_DATE NOT NULL,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Employees can view payments"
  ON public.payments FOR SELECT
  USING (public.has_role(auth.uid(), 'employee'));

CREATE POLICY "Admins can insert payments"
  ON public.payments FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update payments"
  ON public.payments FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete payments"
  ON public.payments FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Add tax settings to company_settings
ALTER TABLE public.company_settings
ADD COLUMN IF NOT EXISTS vat_rate NUMERIC DEFAULT 19.00,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR',
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Update RLS policies for existing tables to use roles
DROP POLICY IF EXISTS "Enable all operations for expenses" ON public.expenses;

CREATE POLICY "Admins can view expenses"
  ON public.expenses FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Employees can view expenses"
  ON public.expenses FOR SELECT
  USING (public.has_role(auth.uid(), 'employee'));

CREATE POLICY "Admins can insert expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update expenses"
  ON public.expenses FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete expenses"
  ON public.expenses FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Enable all operations for vehicle_sales" ON public.vehicle_sales;

CREATE POLICY "All users can view sales"
  ON public.vehicle_sales FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can insert sales"
  ON public.vehicle_sales FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update sales"
  ON public.vehicle_sales FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete sales"
  ON public.vehicle_sales FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Enable all operations for inventory" ON public.inventory;

CREATE POLICY "All users can view inventory"
  ON public.inventory FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and employees can insert inventory"
  ON public.inventory FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'employee'));

CREATE POLICY "Admins and employees can update inventory"
  ON public.inventory FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'employee'));

CREATE POLICY "Admins can delete inventory"
  ON public.inventory FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Enable all operations for customers" ON public.customers;

CREATE POLICY "All users can view customers"
  ON public.customers FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and employees can insert customers"
  ON public.customers FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'employee'));

CREATE POLICY "Admins and employees can update customers"
  ON public.customers FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'employee'));

CREATE POLICY "Admins and employees can delete customers"
  ON public.customers FOR DELETE
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'employee'));

DROP POLICY IF EXISTS "Enable all operations for company_settings" ON public.company_settings;

CREATE POLICY "All users can view company settings"
  ON public.company_settings FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can insert company settings"
  ON public.company_settings FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update company settings"
  ON public.company_settings FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete company settings"
  ON public.company_settings FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for payments updated_at
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();