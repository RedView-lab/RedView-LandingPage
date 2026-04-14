/**
 * Stripe configuration constants.
 *
 * PRICE_ID must be set after creating the product in the Stripe Dashboard:
 *   1. Go to https://dashboard.stripe.com/test/products/create
 *   2. Create "RedView Pro" — 19.99 EUR/month recurring
 *   3. Copy the price ID (price_xxx) and paste it below
 */
export const STRIPE_CONFIG = {
  /** Replace with your actual Stripe Price ID after creating the product */
  PRICE_ID: process.env.STRIPE_PRICE_ID || "price_PLACEHOLDER",

  /** Subscription mode for Checkout */
  MODE: "subscription" as const,

  /** Currency */
  CURRENCY: "eur",

  /** URLs (server-side only — use env vars) */
  getSuccessUrl: (origin: string) =>
    `${origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
  getCancelUrl: (origin: string) => `${origin}/pricing/cancel`,

  /** Portal return URL */
  getPortalReturnUrl: (origin: string) => `${origin}/pricing`,
} as const;
