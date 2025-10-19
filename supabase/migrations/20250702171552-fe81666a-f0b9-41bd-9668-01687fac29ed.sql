-- Create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('individual', 'business')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  total_purchases DECIMAL(10,2) DEFAULT 0,
  vehicles_purchased INTEGER DEFAULT 0,
  outstanding_balance DECIMAL(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_payment', 'inactive')),
  customer_since DATE NOT NULL DEFAULT CURRENT_DATE,
  last_purchase DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vehicle sales table
CREATE TABLE public.vehicle_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  vehicle_make TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_year INTEGER NOT NULL,
  vin TEXT NOT NULL UNIQUE,
  purchase_price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2) NOT NULL,
  profit DECIMAL(10,2) GENERATED ALWAYS AS (sale_price - purchase_price) STORED,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending', 'partial')),
  payment_method TEXT CHECK (payment_method IN ('cash', 'financing', 'bank_transfer')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  vendor TEXT,
  receipt_url TEXT,
  tax_deductible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bank transactions table
CREATE TABLE public.bank_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id TEXT NOT NULL UNIQUE,
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit', 'debit')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  balance DECIMAL(10,2),
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create company settings table
CREATE TABLE public.company_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL DEFAULT 'FP Mobility GmbH',
  address TEXT,
  phone TEXT,
  email TEXT,
  tax_id TEXT,
  bank_account TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Create policies (open for now, will add auth later)
CREATE POLICY "Enable all operations for customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for vehicle_sales" ON public.vehicle_sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for bank_transactions" ON public.bank_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for company_settings" ON public.company_settings FOR ALL USING (true) WITH CHECK (true);

-- Create functions for automatic timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vehicle_sales_updated_at BEFORE UPDATE ON public.vehicle_sales FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bank_transactions_updated_at BEFORE UPDATE ON public.bank_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_company_settings_updated_at BEFORE UPDATE ON public.company_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial company settings
INSERT INTO public.company_settings (company_name, address, phone, email, tax_id, bank_account)
VALUES (
  'FP Mobility GmbH',
  'Musterstraße 123, 12345 Berlin, Germany',
  '+49 30 12345678',
  'info@fpmobility.de',
  'DE123456789',
  'DE89 3704 0044 0532 0130 00'
);

-- Insert sample data for testing
INSERT INTO public.customers (customer_id, type, name, email, phone, address, total_purchases, vehicles_purchased, outstanding_balance, status, customer_since, last_purchase) VALUES
('CUST-001', 'business', 'Schmidt GmbH', 'info@schmidt-gmbh.de', '+49 30 12345678', 'Unter den Linden 1, 10117 Berlin', 85000, 3, 0, 'active', '2022-03-15', '2024-01-15'),
('CUST-002', 'individual', 'Anna Mueller', 'anna.mueller@email.com', '+49 40 98765432', 'Hamburger Str. 123, 20095 Hamburg', 32000, 1, 17000, 'active', '2024-01-14', '2024-01-14'),
('CUST-003', 'business', 'Tech Solutions Ltd', 'finance@techsolutions.de', '+49 89 55443322', 'Maximilianstraße 35, 80539 München', 120000, 4, 0, 'active', '2021-08-22', '2024-01-13'),
('CUST-004', 'individual', 'Mark Weber', 'mark.weber@email.com', '+49 221 11223344', 'Kölner Ring 45, 50999 Köln', 24000, 1, 16000, 'pending_payment', '2024-01-12', '2024-01-12'),
('CUST-005', 'business', 'Logistics Pro GmbH', 'fleet@logisticspro.de', '+49 711 99887766', 'Stuttgarter Platz 12, 70173 Stuttgart', 240000, 8, 45000, 'active', '2020-05-10', '2023-12-20');