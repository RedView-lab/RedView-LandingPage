import { NextResponse } from "next/server";
import { getStripeServer } from "@/lib/stripe/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type Stripe from "stripe";

/**
 * Stripe Webhook Handler
 *
 * SECURITY: Verifies Stripe signature before processing.
 * Uses raw body (not parsed JSON) for signature verification.
 */
export async function POST(request: Request) {
  const stripe = getStripeServer();
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[stripe/webhook] Signature verification failed:", message);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      default:
        console.log(`[stripe/webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error(`[stripe/webhook] Error handling ${event.type}:`, err);
    // Still return 200 to prevent Stripe retries for processing errors
    // The event was received and verified — log the error for debugging
  }

  // Return 200 quickly to acknowledge receipt
  return NextResponse.json({ received: true });
}

// ─── Event Handlers ──────────────────────────────────────────

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  if (!userId) {
    console.error("[stripe/webhook] No user_id in checkout session metadata");
    return;
  }

  const subscriptionId = session.subscription as string;
  if (!subscriptionId) return;

  // Fetch full subscription details from Stripe
  const subscription = await getStripeServer().subscriptions.retrieve(subscriptionId);
  await upsertSubscription(subscription, userId);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subscriptionId = getSubscriptionIdFromInvoice(invoice);
  if (!subscriptionId) return;

  const subscription = await getStripeServer().subscriptions.retrieve(subscriptionId);
  const userId = await getUserIdFromCustomer(invoice.customer as string);
  if (!userId) return;

  await upsertSubscription(subscription, userId);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = getSubscriptionIdFromInvoice(invoice);
  if (!subscriptionId) return;

  const subscription = await getStripeServer().subscriptions.retrieve(subscriptionId);
  const userId = await getUserIdFromCustomer(invoice.customer as string);
  if (!userId) return;

  await upsertSubscription(subscription, userId);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId =
    subscription.metadata?.user_id ||
    (await getUserIdFromCustomer(subscription.customer as string));
  if (!userId) return;

  await upsertSubscription(subscription, userId);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId =
    subscription.metadata?.user_id ||
    (await getUserIdFromCustomer(subscription.customer as string));
  if (!userId) return;

  await getSupabaseAdmin()
    .from("subscriptions")
    .update({
      status: "canceled",
      cancel_at_period_end: false,
    })
    .eq("id", subscription.id);
}

// ─── Helpers ─────────────────────────────────────────────────

async function upsertSubscription(
  subscription: Stripe.Subscription,
  userId: string
) {
  const firstItem = subscription.items.data[0];
  const priceId = firstItem?.price?.id ?? null;

  // In Stripe v22+, current_period_start/end are on subscription items
  const periodStart = firstItem?.current_period_start;
  const periodEnd = firstItem?.current_period_end;

  await getSupabaseAdmin().from("subscriptions").upsert({
    id: subscription.id,
    user_id: userId,
    status: subscription.status,
    price_id: priceId,
    current_period_start: periodStart
      ? new Date(periodStart * 1000).toISOString()
      : null,
    current_period_end: periodEnd
      ? new Date(periodEnd * 1000).toISOString()
      : null,
    cancel_at_period_end: subscription.cancel_at_period_end,
  });
}

/**
 * Extract subscription ID from Invoice (Stripe v22+: nested under parent.subscription_details)
 */
function getSubscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const parent = invoice.parent;
  if (
    parent?.type === "subscription_details" &&
    parent.subscription_details?.subscription
  ) {
    const sub = parent.subscription_details.subscription;
    return typeof sub === "string" ? sub : sub.id;
  }
  return null;
}

async function getUserIdFromCustomer(
  stripeCustomerId: string
): Promise<string | null> {
  const { data } = await getSupabaseAdmin()
    .from("customers")
    .select("id")
    .eq("stripe_customer_id", stripeCustomerId)
    .single();

  return data?.id ?? null;
}
