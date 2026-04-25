import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripeServer } from "@/lib/stripe/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { STRIPE_CONFIG } from "@/lib/stripe/config";

export async function POST(request: Request) {
  try {
    const stripe = getStripeServer();

    // 1. Authenticate the user via Supabase session cookie
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // 2. Get or create a Stripe customer for this user
    const stripeCustomerId = await getOrCreateStripeCustomer(
      user.id,
      user.email!
    );

    // 3. Get the origin for redirect URLs (never trust request Origin header)
    const origin = process.env.NEXT_PUBLIC_APP_URL!;

    // 4. Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: STRIPE_CONFIG.MODE,
      line_items: [
        {
          price: STRIPE_CONFIG.PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: STRIPE_CONFIG.getSuccessUrl(origin),
      cancel_url: STRIPE_CONFIG.getCancelUrl(origin),
      subscription_data: {
        metadata: {
          user_id: user.id,
        },
      },
      metadata: {
        user_id: user.id,
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Get existing Stripe customer ID from Supabase, or create a new one.
 */
async function getOrCreateStripeCustomer(
  userId: string,
  email: string
): Promise<string> {
  // Check if customer already exists in our DB
  const { data: existing } = await getSupabaseAdmin()
    .from("customers")
    .select("stripe_customer_id")
    .eq("id", userId)
    .single();

  if (existing?.stripe_customer_id) {
    return existing.stripe_customer_id;
  }

  // Create a new Stripe customer
  const customer = await getStripeServer().customers.create({
    email,
    metadata: { supabase_user_id: userId },
  });

  // Store the mapping in Supabase
  await getSupabaseAdmin().from("customers").upsert({
    id: userId,
    stripe_customer_id: customer.id,
  });

  return customer.id;
}
