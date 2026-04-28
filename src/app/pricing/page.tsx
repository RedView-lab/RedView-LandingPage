"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";

export default function PricingPage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const { isSubscribed, isLoading: subLoading, status } = useSubscription(user?.id);
  const isDemoPlan = Boolean(user && status === "demo");
  const hasPaidSubscription = isSubscribed && !isDemoPlan;

  useEffect(() => {
    const supabase = createClient();

    let cancelled = false;

    void supabase.auth
      .getUser()
      .then(({ data: { user }, error }) => {
        if (cancelled) return;

        if (error) {
          console.error("[landing] Failed to resolve current user", error);
          setUser(null);
        } else {
          setUser(user);
        }
      })
      .catch((error) => {
        if (cancelled) return;

        console.error("[landing] User bootstrap crashed", error);
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCheckout() {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Checkout error:", data.error);
        setCheckoutLoading(false);
      }
    } catch {
      console.error("Checkout request failed");
      setCheckoutLoading(false);
    }
  }

  async function handlePortal() {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Portal error:", data.error);
        setCheckoutLoading(false);
      }
    } catch {
      console.error("Portal request failed");
      setCheckoutLoading(false);
    }
  }

  if (loading || subLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-muted text-sm hover:text-foreground">
            ← Back
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight mt-4">
            RedView Pro
          </h1>
          <p className="text-muted mt-2">
            {hasPaidSubscription
              ? "Your paid RedView plan is active"
              : isDemoPlan
                ? "Your account starts on Demo. Upgrade only when you need a paid plan."
                : "Unlock full access to RedView"}
          </p>
        </div>

        {/* Pricing Card */}
        <div className="border border-border p-8 rounded-sm">
          <div className="text-center mb-6">
            <span className="text-4xl font-bold">19.99€</span>
            <span className="text-muted ml-1">/month</span>
          </div>

          <ul className="space-y-3 mb-8 text-sm">
            <Feature text="3D terrain visualization with high-res DEM" />
            <Feature text="IGN orthophotos (20cm/px)" />
            <Feature text="LiDAR point cloud viewer" />
            <Feature text="Fit activity analysis & prediction" />
            <Feature text="Weather overlay & animation" />
            <Feature text="Priority support" />
          </ul>

          {/* Action Button */}
          {!user ? (
            <Link
              href="/auth/login"
              className="block w-full text-center bg-foreground text-background py-3 text-sm font-medium hover:opacity-80 transition-opacity"
            >
              Sign in to continue
            </Link>
          ) : hasPaidSubscription ? (
            <button
              onClick={handlePortal}
              disabled={checkoutLoading}
              className="w-full bg-foreground text-background py-3 text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {checkoutLoading ? "Redirecting..." : "Manage subscription"}
            </button>
          ) : (
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="w-full bg-foreground text-background py-3 text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {checkoutLoading
                ? "Redirecting..."
                : isDemoPlan
                  ? "Upgrade from Demo"
                  : "Subscribe now"}
            </button>
          )}

          {hasPaidSubscription && (
            <p className="text-center text-sm text-muted mt-4">
              ✓ You have an active subscription
            </p>
          )}

          {isDemoPlan && (
            <p className="text-center text-sm text-muted mt-4">
              ✓ Demo access is active on this account. No Stripe checkout is required for signup or login.
            </p>
          )}
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-muted mt-6">
          {hasPaidSubscription
            ? "Secure payment via Stripe. Cancel anytime."
            : "Stripe is only used when you choose to upgrade from the Demo plan."}
        </p>
      </div>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2">
      <span className="text-foreground mt-0.5">✓</span>
      <span>{text}</span>
    </li>
  );
}
