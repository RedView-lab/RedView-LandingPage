-- ============================================================
-- RedView billing contact persistence migration
-- Run this once in Supabase SQL Editor before testing the app billing UI.
-- ============================================================

ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS billing_email_mode TEXT NOT NULL DEFAULT 'account',
  ADD COLUMN IF NOT EXISTS billing_email TEXT;

UPDATE public.customers
SET billing_email_mode = 'account'
WHERE billing_email_mode IS NULL OR billing_email_mode NOT IN ('account', 'alternative');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'customers_billing_email_mode_check'
  ) THEN
    ALTER TABLE public.customers
      ADD CONSTRAINT customers_billing_email_mode_check
      CHECK (billing_email_mode IN ('account', 'alternative'));
  END IF;
END
$$;