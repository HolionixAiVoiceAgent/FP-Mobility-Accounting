-- ============================================================================
-- COMPLETE DATABASE SETUP FOR FP MOBILITY ACCOUNTING
-- Run this single file to set up everything needed for login/register
-- ============================================================================

-- ============================================================================
-- PART 1: BASE TABLES (from 20250702171552 migration)
-- ============================================================================

-- Create customers table
CREATE TABLE IF NOT EXISTS public.customers (
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
CREATE TABLE IF NOT EXISTS public.vehicle_sales (
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
CREATE TABLE IF NOT EXISTS public.expenses (
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
CREATE TABLE IF NOT EXISTS public.bank_transactions (
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
CREATE TABLE IF NOT EXISTS public.company_settings (
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

-- Create policies (open for now)
CREATE POLICY "Enable all operations for customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for vehicle_sales" ON public.vehicle_sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for bank_transactions" ON public.bank_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for company_settings" ON public.company_settings FOR ALL USING (true) WITH CHECK (true);

-- Create function for automatic timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;
DROP TRIGGER IF EXISTS update_vehicle_sales_updated_at ON public.vehicle_sales;
DROP TRIGGER IF EXISTS update_expenses_updated_at ON public.expenses;
DROP TRIGGER IF EXISTS update_bank_transactions_updated_at ON public.bank_transactions;
DROP TRIGGER IF EXISTS update_company_settings_updated_at ON public.company_settings;

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vehicle_sales_updated_at BEFORE UPDATE ON public.vehicle_sales FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bank_transactions_updated_at BEFORE UPDATE ON public.bank_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_company_settings_updated_at BEFORE UPDATE ON public.company_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial company settings if not exists
INSERT INTO public.company_settings (company_name, address, phone, email, tax_id, bank_account)
SELECT 'FP Mobility GmbH', 'Musterstraße 123, 12345 Berlin, Germany', '+49 30 12345678', 'info@fpmobility.de', 'DE123456789', 'DE89 3704 0044 0532 0130 00'
WHERE NOT EXISTS (SELECT 1 FROM public.company_settings);

-- ============================================================================
-- PART 2: ADDITIONAL TABLES NEEDED FOR AUTHENTICATION
-- ============================================================================

-- Create profiles table for user metadata
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for role management
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('owner', 'manager', 'sales_manager', 'salesperson', 'accountant', 'hr_manager', 'inventory_manager', 'service_advisor', 'admin', 'employee')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employees table
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('owner', 'manager', 'sales_manager', 'salesperson', 'accountant', 'hr_manager', 'inventory_manager', 'service_advisor')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
  position TEXT,
  department TEXT CHECK (department IN ('sales', 'finance', 'operations', 'hr', 'inventory', 'management', 'admin')),
  base_salary NUMERIC(12,2),
  commission_rate NUMERIC(5,2) DEFAULT 0,
  commission_structure JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  manager_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can view employees" ON public.employees FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert employees" ON public.employees FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update employees" ON public.employees FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Create trigger for profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- PART 3: HRM TABLES (Attendance & Leaves)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.employee_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in_time TIME NOT NULL,
  check_out_time TIME,
  status TEXT CHECK (status IN ('present', 'absent', 'leave')) DEFAULT 'present',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, date)
);

CREATE TABLE IF NOT EXISTS public.employee_leaves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL CHECK (leave_type IN ('sick', 'vacation', 'personal', 'unpaid')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  approved_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  approval_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.employee_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_leaves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can view attendance" ON public.employee_attendance FOR SELECT USING (true);
CREATE POLICY "All users can insert attendance" ON public.employee_attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "All users can update attendance" ON public.employee_attendance FOR UPDATE USING (true);
CREATE POLICY "All users can view leaves" ON public.employee_leaves FOR SELECT USING (true);
CREATE POLICY "All users can insert leaves" ON public.employee_leaves FOR INSERT WITH CHECK (true);
CREATE POLICY "All users can update leaves" ON public.employee_leaves FOR UPDATE USING (true);

CREATE INDEX IF NOT EXISTS idx_attendance_employee ON public.employee_attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.employee_attendance(date);
CREATE INDEX IF NOT EXISTS idx_leaves_employee ON public.employee_leaves(employee_id);
CREATE INDEX IF NOT EXISTS idx_leaves_status ON public.employee_leaves(status);

-- ============================================================================
-- PART 4: SALES PIPELINE TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.sales_pipeline (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dealership_id UUID DEFAULT NULL,
  vehicle_id UUID REFERENCES public.vehicle_sales(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  salesperson_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  stage TEXT NOT NULL DEFAULT 'lead' CHECK (stage IN ('lead', 'contact_made', 'interest_shown', 'test_drive_scheduled', 'test_drive_completed', 'negotiation', 'offer_made', 'accepted', 'sale', 'closed_lost')),
  lead_source TEXT CHECK (lead_source IN ('walk_in', 'phone_inquiry', 'website', 'social_media', 'referral', 'advertisement', 'existing_customer', 'trade_in', 'other')),
  deal_value NUMERIC(12,2),
  probability_percentage INT DEFAULT 50 CHECK (probability_percentage >= 0 AND probability_percentage <= 100),
  expected_close_date DATE,
  notes TEXT,
  lost_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  lead_source TEXT CHECK (lead_source IN ('walk_in', 'phone', 'website', 'social_media', 'referral', 'advertisement', 'other')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'interested', 'qualified', 'unqualified', 'converted', 'do_not_contact')),
  vehicle_make TEXT,
  vehicle_model TEXT,
  vehicle_year_from INT,
  vehicle_year_to INT,
  budget_min NUMERIC(12,2),
  budget_max NUMERIC(12,2),
  assigned_to UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  notes TEXT,
  last_contact_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_sales_pipeline_stage ON public.sales_pipeline(stage);
CREATE INDEX idx_sales_pipeline_salesperson ON public.sales_pipeline(salesperson_id);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_assigned_to ON public.leads(assigned_to);

-- ============================================================================
-- PART 5: COMMISSIONS & PERFORMANCE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  vehicle_sale_id UUID REFERENCES public.vehicle_sales(id) ON DELETE SET NULL,
  commission_rate NUMERIC(5,2) NOT NULL,
  commission_base_amount NUMERIC(12,2) NOT NULL,
  commission_amount NUMERIC(12,2) NOT NULL,
  sale_date DATE NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'approved', 'paid', 'reversed', 'disputed')),
  payment_date DATE,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.employee_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  metric_type TEXT CHECK (metric_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  vehicles_sold INT DEFAULT 0,
  total_sales_value NUMERIC(12,2) DEFAULT 0,
