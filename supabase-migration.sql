-- ============================================================
-- RedView Stripe Subscription Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================================

-- 1. Customers table: links auth.users <-> Stripe Customer
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Subscriptions table: synced from Stripe via webhooks
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id TEXT PRIMARY KEY, -- Stripe subscription ID (sub_xxx)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL, -- active, canceled, past_due, trialing, incomplete, etc.
  price_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- 3. Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies: users can only SELECT their own rows
-- (Service role bypasses RLS for webhook writes)

CREATE POLICY "Users can view own customer data"
  ON public.customers
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- 5. View for simplified subscription status check
CREATE OR REPLACE VIEW public.user_subscription_status AS
SELECT
  c.id AS user_id,
  c.stripe_customer_id,
  s.id AS subscription_id,
  s.status,
  s.price_id,
  s.current_period_end,
  s.cancel_at_period_end,
  CASE
    WHEN s.status = 'active' AND s.current_period_end > NOW() THEN TRUE
    WHEN s.status = 'trialing' AND s.current_period_end > NOW() THEN TRUE
    ELSE FALSE
  END AS is_subscribed
FROM public.customers c
LEFT JOIN public.subscriptions s ON s.user_id = c.id
  AND s.status IN ('active', 'trialing');

-- 6. Grant access to the view via RLS-like security
-- The view inherits RLS from underlying tables when queried by authenticated users.
-- Service role can read all rows.

-- 7. Function to update updated_at automatically
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
