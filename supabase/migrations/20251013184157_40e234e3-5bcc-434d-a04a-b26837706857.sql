-- Create tink_users table to store Tink user credentials
CREATE TABLE public.tink_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tink_user_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create tink_accounts table to store connected bank accounts
CREATE TABLE public.tink_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tink_user_id UUID NOT NULL REFERENCES public.tink_users(id) ON DELETE CASCADE,
  tink_account_id TEXT NOT NULL,
  account_name TEXT NOT NULL,
  iban TEXT,
  account_number TEXT,
  balance NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  account_type TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tink_account_id)
);

-- Update bank_transactions table to support Tink integration
ALTER TABLE public.bank_transactions 
ADD COLUMN IF NOT EXISTS tink_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS tink_account_id UUID REFERENCES public.tink_accounts(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS is_reconciled BOOLEAN DEFAULT false;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_bank_transactions_tink_id ON public.bank_transactions(tink_transaction_id);
CREATE INDEX IF NOT EXISTS idx_tink_accounts_user ON public.tink_accounts(tink_user_id);
CREATE INDEX IF NOT EXISTS idx_tink_users_user_id ON public.tink_users(user_id);

-- Enable Row Level Security
ALTER TABLE public.tink_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tink_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tink_users
CREATE POLICY "Users can view their own Tink user data"
ON public.tink_users
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Tink user data"
ON public.tink_users
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Tink user data"
ON public.tink_users
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Tink user data"
ON public.tink_users
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all Tink users"
ON public.tink_users
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for tink_accounts
CREATE POLICY "Users can view their own Tink accounts"
ON public.tink_accounts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tink_users
    WHERE tink_users.id = tink_accounts.tink_user_id
    AND tink_users.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own Tink accounts"
ON public.tink_accounts
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tink_users
    WHERE tink_users.id = tink_accounts.tink_user_id
    AND tink_users.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own Tink accounts"
ON public.tink_accounts
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.tink_users
    WHERE tink_users.id = tink_accounts.tink_user_id
    AND tink_users.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own Tink accounts"
ON public.tink_accounts
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.tink_users
    WHERE tink_users.id = tink_accounts.tink_user_id
    AND tink_users.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all Tink accounts"
ON public.tink_accounts
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_tink_users_updated_at
BEFORE UPDATE ON public.tink_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tink_accounts_updated_at
BEFORE UPDATE ON public.tink_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();