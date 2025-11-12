-- Phase 1: Create financial_obligations table for tracking investors and bank loans
CREATE TABLE IF NOT EXISTS public.financial_obligations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obligation_type TEXT NOT NULL CHECK (obligation_type IN ('investor', 'bank_loan')),
  creditor_name TEXT NOT NULL,
  principal_amount NUMERIC NOT NULL,
  interest_rate NUMERIC,
  start_date DATE NOT NULL,
  due_date DATE,
  monthly_payment NUMERIC,
  outstanding_balance NUMERIC NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paid', 'defaulted')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for financial_obligations
ALTER TABLE public.financial_obligations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for financial_obligations (admin-only access)
CREATE POLICY "Admins can view all financial obligations"
  ON public.financial_obligations
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert financial obligations"
  ON public.financial_obligations
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update financial obligations"
  ON public.financial_obligations
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete financial obligations"
  ON public.financial_obligations
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_financial_obligations_updated_at
  BEFORE UPDATE ON public.financial_obligations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Phase 4: Create tax_integrations table for DATEV and Lexoffice
CREATE TABLE IF NOT EXISTS public.tax_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_type TEXT NOT NULL CHECK (integration_type IN ('datev', 'lexoffice')),
  api_key TEXT,
  consultant_id TEXT,
  is_active BOOLEAN DEFAULT FALSE,
  last_sync_at TIMESTAMPTZ,
  sync_frequency TEXT DEFAULT 'manual' CHECK (sync_frequency IN ('manual', 'daily', 'weekly', 'monthly')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for tax_integrations
ALTER TABLE public.tax_integrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tax_integrations (admin-only access)
CREATE POLICY "Admins can view all tax integrations"
  ON public.tax_integrations
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert tax integrations"
  ON public.tax_integrations
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update tax integrations"
  ON public.tax_integrations
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete tax integrations"
  ON public.tax_integrations
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_tax_integrations_updated_at
  BEFORE UPDATE ON public.tax_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Phase 5: Create audit_logs table for compliance
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_logs (admin can view, system can insert, nobody can delete)
CREATE POLICY "Admins can view all audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs
  FOR INSERT
  WITH CHECK (true);

-- Nobody can update or delete audit logs (compliance requirement)