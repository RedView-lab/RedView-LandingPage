import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripeServer } from "@/lib/stripe/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { STRIPE_CONFIG } from "@/lib/stripe/config";

export async function POST(request: Request) {
  try {
    const stripe = getStripeServer();

    // 1. Authenticate the user
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

    // 2. Get the Stripe customer ID from our DB
    const { data: customer } = await getSupabaseAdmin()
      .from("customers")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (!customer?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No subscription found. Please subscribe first." },
        { status: 404 }
      );
    }

    // 3. Get origin for return URL (never trust request Origin header)
    const origin = process.env.NEXT_PUBLIC_APP_URL!;

    // 4. Create a Stripe Customer Portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer.stripe_customer_id,
      return_url: STRIPE_CONFIG.getPortalReturnUrl(origin),
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    console.error("[stripe/portal] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
