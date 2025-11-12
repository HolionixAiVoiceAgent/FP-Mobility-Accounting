-- ============================================================================
-- PHASE 1: DATABASE SCHEMA EXPANSION & INFRASTRUCTURE
-- Car Dealership Management Platform - Enterprise Grade
-- ============================================================================
-- This migration adds all required tables for the complete platform
-- Date: November 2025
-- Version: 1.0
-- ============================================================================

-- Phase 1: Sales Pipeline & Lead Management
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.sales_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id UUID DEFAULT NULL, -- For future multi-tenant support
  vehicle_id UUID REFERENCES public.vehicle_sales(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  salesperson_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  stage TEXT NOT NULL DEFAULT 'lead' CHECK (stage IN (
    'lead', 'contact_made', 'interest_shown', 'test_drive_scheduled', 
    'test_drive_completed', 'negotiation', 'offer_made', 'accepted', 'sale', 'closed_lost'
  )),
  lead_source TEXT CHECK (lead_source IN (
    'walk_in', 'phone_inquiry', 'website', 'social_media', 'referral', 
    'advertisement', 'existing_customer', 'trade_in', 'other'
  )),
  deal_value NUMERIC(12,2),
  probability_percentage INT DEFAULT 50 CHECK (probability_percentage >= 0 AND probability_percentage <= 100),
  expected_close_date DATE,
  notes TEXT,
  lost_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sales_pipeline_stage ON public.sales_pipeline(stage);
CREATE INDEX idx_sales_pipeline_salesperson ON public.sales_pipeline(salesperson_id);
CREATE INDEX idx_sales_pipeline_customer ON public.sales_pipeline(customer_id);
CREATE INDEX idx_sales_pipeline_expected_close ON public.sales_pipeline(expected_close_date);

CREATE TRIGGER update_sales_pipeline_updated_at
  BEFORE UPDATE ON public.sales_pipeline
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- Leads Management (Pre-Vehicle Interest)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  lead_source TEXT CHECK (lead_source IN (
    'walk_in', 'phone', 'website', 'social_media', 'referral', 'advertisement', 'other'
  )),
  status TEXT DEFAULT 'new' CHECK (status IN (
    'new', 'contacted', 'interested', 'qualified', 'unqualified', 'converted', 'do_not_contact'
  )),
  vehicle_make TEXT,
  vehicle_model TEXT,
  vehicle_year_from INT,
  vehicle_year_to INT,
  budget_min NUMERIC(12,2),
  budget_max NUMERIC(12,2),
  assigned_to UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  notes TEXT,
  last_contact_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX idx_leads_created_at ON public.leads(created_at);

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- Employee Management
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN (
    'owner', 'manager', 'sales_manager', 'salesperson', 'accountant', 
    'hr_manager', 'inventory_manager', 'service_advisor'
  )),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
  position TEXT,
  department TEXT CHECK (department IN (
    'sales', 'finance', 'operations', 'hr', 'inventory', 'management', 'admin'
  )),
  base_salary NUMERIC(12,2),
  commission_rate NUMERIC(5,2) DEFAULT 0, -- Percentage
  commission_structure JSONB DEFAULT '{
    "base_salary": 0,
    "commission_rate": 0,
    "bonus_per_vehicle": 0,
    "team_bonus_threshold": 0,
    "performance_bonus": false
  }',
  is_active BOOLEAN DEFAULT TRUE,
  manager_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- RLS: Employees can see their own record, managers see their team
CREATE POLICY "Employees can view own record"
  ON public.employees FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'owner'::app_role));

CREATE POLICY "Managers can view team"
  ON public.employees FOR SELECT
  USING (has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

CREATE POLICY "Owners manage all employees"
  ON public.employees FOR ALL
  USING (has_role(auth.uid(), 'owner'::app_role));

CREATE INDEX idx_employees_role ON public.employees(role);
CREATE INDEX idx_employees_is_active ON public.employees(is_active);
CREATE INDEX idx_employees_user_id ON public.employees(user_id);

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- Employee Performance Metrics
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.employee_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  metric_type TEXT CHECK (metric_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  vehicles_sold INT DEFAULT 0,
  total_sales_value NUMERIC(12,2) DEFAULT 0,
  commission_earned NUMERIC(12,2) DEFAULT 0,
  leads_generated INT DEFAULT 0,
  leads_contacted INT DEFAULT 0,
  conversion_rate NUMERIC(5,2), -- Percentage
  test_drives INT DEFAULT 0,
  customer_satisfaction_rating NUMERIC(3,2), -- 0-5
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, metric_date, metric_type)
);

CREATE INDEX idx_employee_performance_employee_date ON public.employee_performance(employee_id, metric_date);
CREATE INDEX idx_employee_performance_type ON public.employee_performance(metric_type);

CREATE TRIGGER update_employee_performance_updated_at
  BEFORE UPDATE ON public.employee_performance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- Commission Tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  vehicle_sale_id UUID REFERENCES public.vehicle_sales(id) ON DELETE SET NULL,
  commission_rate NUMERIC(5,2) NOT NULL, -- Percentage
  commission_base_amount NUMERIC(12,2) NOT NULL,
  commission_amount NUMERIC(12,2) NOT NULL,
  sale_date DATE NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN (
    'pending', 'approved', 'paid', 'reversed', 'disputed'
  )),
  payment_date DATE,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_commissions_employee ON public.commissions(employee_id);
CREATE INDEX idx_commissions_status ON public.commissions(payment_status);
CREATE INDEX idx_commissions_sale_date ON public.commissions(sale_date);

CREATE TRIGGER update_commissions_updated_at
  BEFORE UPDATE ON public.commissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- Customer Financing System
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.customer_financing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_sale_id UUID UNIQUE REFERENCES public.vehicle_sales(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  financing_type TEXT NOT NULL CHECK (financing_type IN (
    'cash', 'bank_loan', 'dealer_financing', 'lease', 'credit'
  )),
  total_amount NUMERIC(12,2) NOT NULL,
  down_payment NUMERIC(12,2) DEFAULT 0,
  loan_amount NUMERIC(12,2),
  monthly_payment NUMERIC(12,2),
  interest_rate NUMERIC(6,3) DEFAULT 0,
  interest_type TEXT CHECK (interest_type IN ('fixed', 'variable')) DEFAULT 'fixed',
  loan_term_months INT,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'approved', 'active', 'completed', 'defaulted', 'cancelled'
  )),
  payments_made INT DEFAULT 0,
  next_payment_date DATE,
  last_payment_date DATE,
  finance_company TEXT,
  contract_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.customer_financing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers see own financing"
  ON public.customer_financing FOR SELECT
  USING (customer_id = auth.uid() OR has_role(auth.uid(), 'owner'::app_role));

CREATE POLICY "Finance team manages all"
  ON public.customer_financing FOR ALL
  USING (has_role(auth.uid(), 'accountant'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

CREATE INDEX idx_financing_status ON public.customer_financing(status);
CREATE INDEX idx_financing_customer ON public.customer_financing(customer_id);
CREATE INDEX idx_financing_next_payment ON public.customer_financing(next_payment_date);

CREATE TRIGGER update_customer_financing_updated_at
  BEFORE UPDATE ON public.customer_financing
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- Financing Payments
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.financing_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  financing_id UUID NOT NULL REFERENCES public.customer_financing(id) ON DELETE CASCADE,
  payment_amount NUMERIC(12,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT CHECK (payment_method IN (
    'cash', 'check', 'bank_transfer', 'card', 'automatic'
  )),
  reference_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_financing_payments_financing ON public.financing_payments(financing_id);
CREATE INDEX idx_financing_payments_date ON public.financing_payments(payment_date);

-- ============================================================================
-- Test Drives
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.test_drives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicle_sales(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  salesperson_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  scheduled_date TIMESTAMPTZ NOT NULL,
  actual_start_date TIMESTAMPTZ,
  actual_end_date TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled' CHECK (status IN (
    'scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'
  )),
  odometer_before INT,
  odometer_after INT,
  result TEXT CHECK (result IN (
    'positive', 'neutral', 'negative', 'no_show', 'rescheduled'
  )),
  customer_notes TEXT,
  salesperson_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_test_drives_vehicle ON public.test_drives(vehicle_id);
CREATE INDEX idx_test_drives_customer ON public.test_drives(customer_id);
CREATE INDEX idx_test_drives_scheduled ON public.test_drives(scheduled_date);
CREATE INDEX idx_test_drives_status ON public.test_drives(status);

CREATE TRIGGER update_test_drives_updated_at
  BEFORE UPDATE ON public.test_drives
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- Market Prices (from AutoScout24, Mobile.de)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.market_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INT NOT NULL,
  avg_price NUMERIC(12,2),
  min_price NUMERIC(12,2),
  max_price NUMERIC(12,2),
  median_price NUMERIC(12,2),
  inventory_count INT DEFAULT 0,
  days_on_market INT,
  source TEXT CHECK (source IN ('autoscout24', 'mobile_de', 'local_market', 'manual')) DEFAULT 'local_market',
  condition TEXT CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
  mileage_km INT,
  fuel_type TEXT,
  transmission TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_market_prices_make_model_year ON public.market_prices(make, model, year);
CREATE INDEX idx_market_prices_last_updated ON public.market_prices(last_updated);

-- ============================================================================
-- QR Codes for Vehicles
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID UNIQUE NOT NULL REFERENCES public.vehicle_sales(id) ON DELETE CASCADE,
  qr_code_url TEXT,
  qr_code_data JSONB DEFAULT '{}',
  qr_image_base64 TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_qr_codes_vehicle ON public.qr_codes(vehicle_id);

-- ============================================================================
-- Vehicle Tracking & Aging
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.vehicle_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID UNIQUE NOT NULL REFERENCES public.vehicle_sales(id) ON DELETE CASCADE,
  current_status TEXT DEFAULT 'available' CHECK (current_status IN (
    'available', 'sold', 'reserved', 'on_test_drive', 'maintenance', 'detail_preparation', 'hold'
  )),
  location_lot TEXT,
  location_building TEXT,
  received_date DATE NOT NULL,
  expected_sale_date DATE,
  last_status_change TIMESTAMPTZ DEFAULT NOW(),
  days_in_stock INT GENERATED ALWAYS AS (
    EXTRACT(DAY FROM NOW() - received_date)
  ) STORED,
  marketing_start_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vehicle_tracking_status ON public.vehicle_tracking(current_status);
CREATE INDEX idx_vehicle_tracking_days_in_stock ON public.vehicle_tracking(days_in_stock);
CREATE INDEX idx_vehicle_tracking_received_date ON public.vehicle_tracking(received_date);

CREATE TRIGGER update_vehicle_tracking_updated_at
  BEFORE UPDATE ON public.vehicle_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- Enhanced Audit Logs (Track all changes)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs_enhanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN (
    'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT'
  )),
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  change_reason TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON public.audit_logs_enhanced(user_id);
CREATE INDEX idx_audit_logs_table_record ON public.audit_logs_enhanced(table_name, record_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs_enhanced(created_at DESC);
CREATE INDEX idx_audit_logs_action ON public.audit_logs_enhanced(action);

-- ============================================================================
-- Communication History
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.communication_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  channel TEXT NOT NULL CHECK (channel IN (
    'email', 'whatsapp', 'sms', 'phone', 'in_person', 'chat', 'social_media'
  )),
  message TEXT,
  message_direction TEXT CHECK (message_direction IN ('inbound', 'outbound')) DEFAULT 'outbound',
  status TEXT DEFAULT 'sent' CHECK (status IN (
    'pending', 'sent', 'delivered', 'read', 'failed', 'bounced'
  )),
  external_id TEXT, -- WhatsApp msg ID, email reference, etc.
  subject TEXT, -- For email
  attachments JSONB, -- Array of file URLs
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.communication_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers see own communications"
  ON public.communication_history FOR SELECT
  USING (customer_id = auth.uid() OR has_role(auth.uid(), 'owner'::app_role));

CREATE POLICY "Employees see customer communications"
  ON public.communication_history FOR SELECT
  USING (has_role(auth.uid(), 'salesperson'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

CREATE INDEX idx_communication_customer ON public.communication_history(customer_id);
CREATE INDEX idx_communication_channel ON public.communication_history(channel);
CREATE INDEX idx_communication_created_at ON public.communication_history(created_at DESC);
CREATE INDEX idx_communication_status ON public.communication_history(status);

-- ============================================================================
-- Role-Based Access Control Configuration
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL CHECK (role IN (
    'owner', 'manager', 'sales_manager', 'salesperson', 'accountant', 
    'hr_manager', 'inventory_manager', 'service_advisor'
  )),
  resource TEXT NOT NULL, -- Table or feature name
  action TEXT NOT NULL CHECK (action IN (
    'view', 'create', 'edit', 'delete', 'export', 'approve', 'admin'
  )),
  granted BOOLEAN DEFAULT TRUE,
  conditions JSONB, -- JSON conditions for row-level access
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role, resource, action)
);

-- Populate default permissions for each role
INSERT INTO public.role_permissions (role, resource, action, granted) VALUES
-- OWNER: Full access to everything
('owner', 'all', 'admin', TRUE),

-- SALES MANAGER: Can manage sales pipeline and team
('sales_manager', 'sales_pipeline', 'view', TRUE),
('sales_manager', 'sales_pipeline', 'edit', TRUE),
('sales_manager', 'leads', 'view', TRUE),
('sales_manager', 'leads', 'create', TRUE),
('sales_manager', 'employees', 'view', TRUE),
('sales_manager', 'commission', 'view', TRUE),
('sales_manager', 'vehicles', 'view', TRUE),

-- SALESPERSON: Limited to own pipeline and customers
('salesperson', 'sales_pipeline', 'view', TRUE),
('salesperson', 'sales_pipeline', 'edit', TRUE),
('salesperson', 'leads', 'view', TRUE),
('salesperson', 'leads', 'create', TRUE),
('salesperson', 'customers', 'view', TRUE),
('salesperson', 'test_drives', 'create', TRUE),
('salesperson', 'communication', 'create', TRUE),

-- ACCOUNTANT: Access to financial data
('accountant', 'vehicle_sales', 'view', TRUE),
('accountant', 'expenses', 'view', TRUE),
('accountant', 'financing', 'view', TRUE),
('accountant', 'financing', 'edit', TRUE),
('accountant', 'payments', 'view', TRUE),
('accountant', 'reports', 'view', TRUE),
('accountant', 'reports', 'export', TRUE),

-- HR MANAGER: Access to employee data
('hr_manager', 'employees', 'view', TRUE),
('hr_manager', 'employees', 'edit', TRUE),
('hr_manager', 'performance', 'view', TRUE),
('hr_manager', 'commission', 'view', TRUE),
('hr_manager', 'commission', 'approve', TRUE),
('hr_manager', 'attendance', 'view', TRUE),
('hr_manager', 'attendance', 'edit', TRUE),

-- INVENTORY MANAGER: Access to vehicle tracking
('inventory_manager', 'vehicles', 'view', TRUE),
('inventory_manager', 'vehicles', 'edit', TRUE),
('inventory_manager', 'vehicle_tracking', 'view', TRUE),
('inventory_manager', 'vehicle_tracking', 'edit', TRUE),
('inventory_manager', 'market_prices', 'view', TRUE)
ON CONFLICT (role, resource, action) DO NOTHING;

-- ============================================================================
-- Triggers for Audit Logging
-- ============================================================================

-- Audit trigger function
CREATE OR REPLACE FUNCTION public.audit_log_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs_enhanced (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values,
    created_at
  ) VALUES (
    auth.uid(),
    TG_ARGV[0]::TEXT,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    row_to_json(OLD),
    row_to_json(NEW),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on critical audit logs
ALTER TABLE public.audit_logs_enhanced ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners see all audit logs"
  ON public.audit_logs_enhanced FOR SELECT
  USING (has_role(auth.uid(), 'owner'::app_role));

-- ============================================================================
-- Views for Analytics & Reporting
-- ============================================================================

-- Cash flow summary view
CREATE OR REPLACE VIEW public.cash_flow_summary AS
SELECT
  CURRENT_DATE as report_date,
  COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_inflow,
  COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_outflow,
  COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as net_position
FROM (
  SELECT 'income' as type, sale_price as amount FROM vehicle_sales WHERE sale_date = CURRENT_DATE
  UNION ALL
  SELECT 'expense' as type, amount FROM expenses WHERE date = CURRENT_DATE
  UNION ALL
  SELECT 'income' as type, amount FROM payments WHERE payment_date = CURRENT_DATE
) combined_data;

-- Sales performance view
CREATE OR REPLACE VIEW public.sales_performance AS
SELECT
  e.id,
  e.first_name || ' ' || e.last_name as salesperson_name,
  COUNT(DISTINCT sp.id) as total_leads,
  COUNT(DISTINCT CASE WHEN sp.stage = 'sale' THEN sp.id END) as closed_deals,
  COALESCE(SUM(vs.sale_price), 0) as total_revenue,
  COALESCE(COUNT(DISTINCT CASE WHEN sp.stage = 'sale' THEN sp.id END)::numeric / 
    NULLIF(COUNT(DISTINCT sp.id), 0), 0) * 100 as conversion_rate
FROM public.employees e
LEFT JOIN public.sales_pipeline sp ON e.id = sp.salesperson_id
LEFT JOIN public.vehicle_sales vs ON sp.vehicle_id = vs.id
WHERE e.role IN ('salesperson', 'sales_manager')
GROUP BY e.id, e.first_name, e.last_name;

-- Inventory aging view
CREATE OR REPLACE VIEW public.inventory_aging_summary AS
SELECT
  CASE
    WHEN vt.days_in_stock <= 30 THEN '0-30 days'
    WHEN vt.days_in_stock <= 60 THEN '31-60 days'
    WHEN vt.days_in_stock <= 90 THEN '61-90 days'
    ELSE '90+ days'
  END as age_bucket,
  COUNT(*) as vehicle_count,
  COUNT(*)::numeric / (SELECT COUNT(*) FROM vehicle_tracking) * 100 as percentage
FROM public.vehicle_tracking vt
WHERE vt.current_status != 'sold'
GROUP BY age_bucket
ORDER BY age_bucket;

-- ============================================================================
-- Summary & Final Checks
-- ============================================================================

-- Count new tables
SELECT COUNT(*) as new_tables_created FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'sales_pipeline', 'leads', 'employees', 'employee_performance', 'commissions',
  'customer_financing', 'financing_payments', 'test_drives', 'market_prices',
  'qr_codes', 'vehicle_tracking', 'audit_logs_enhanced', 'communication_history', 'role_permissions'
);

-- ============================================================================
-- END OF PHASE 1 MIGRATION
-- ============================================================================
-- Next: Deploy this migration to Supabase
-- Command: supabase db push
-- ============================================================================
