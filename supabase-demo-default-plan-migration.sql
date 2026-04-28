-- ============================================================
-- RedView demo default plan migration
-- Run this once in Supabase SQL Editor on an existing project.
-- ============================================================

-- 1. Allow a customer row to exist before the first Stripe checkout.
ALTER TABLE public.customers
  ALTER COLUMN stripe_customer_id DROP NOT NULL;

-- 2. Backfill every existing auth user into public.customers.
INSERT INTO public.customers (id, stripe_customer_id)
SELECT u.id, NULL
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

-- 3. Auto-provision future auth users with a demo customer row.
CREATE OR REPLACE FUNCTION public.handle_new_customer_row()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.customers (id, stripe_customer_id)
  VALUES (NEW.id, NULL)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS create_customer_row_on_signup ON auth.users;

CREATE TRIGGER create_customer_row_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_customer_row();

-- 4. Expose demo as the default account state when no paid Stripe plan is active.
CREATE OR REPLACE VIEW public.user_subscription_status AS
SELECT
  c.id AS user_id,
  c.stripe_customer_id,
  s.id AS subscription_id,
  CASE
    WHEN s.status = 'active' AND s.current_period_end > NOW() THEN 'active'
    WHEN s.status = 'trialing' AND s.current_period_end > NOW() THEN 'trialing'
    ELSE 'demo'
  END AS status,
  CASE
    WHEN s.status = 'active' AND s.current_period_end > NOW() THEN s.price_id
    WHEN s.status = 'trialing' AND s.current_period_end > NOW() THEN s.price_id
    ELSE 'demo'
  END AS price_id,
  CASE
    WHEN s.status = 'active' AND s.current_period_end > NOW() THEN s.current_period_end
    WHEN s.status = 'trialing' AND s.current_period_end > NOW() THEN s.current_period_end
    ELSE NULL
  END AS current_period_end,
  CASE
    WHEN s.status = 'active' AND s.current_period_end > NOW() THEN COALESCE(s.cancel_at_period_end, FALSE)
    WHEN s.status = 'trialing' AND s.current_period_end > NOW() THEN COALESCE(s.cancel_at_period_end, FALSE)
    ELSE FALSE
  END AS cancel_at_period_end,
  CASE
    WHEN s.status = 'active' AND s.current_period_end > NOW() THEN TRUE
    WHEN s.status = 'trialing' AND s.current_period_end > NOW() THEN TRUE
    ELSE FALSE
  END AS is_subscribed
FROM public.customers c
LEFT JOIN public.subscriptions s
  ON s.user_id = c.id
  AND s.status IN ('active', 'trialing');