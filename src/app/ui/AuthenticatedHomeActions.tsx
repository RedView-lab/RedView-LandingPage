"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface AuthenticatedHomeActionsProps {
  appUrl: string;
  demoUrl: string;
  pricingHref: string;
}

export function AuthenticatedHomeActions({
  appUrl,
  demoUrl,
  pricingHref,
}: AuthenticatedHomeActionsProps) {
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("[landing] logout failed", error);
      setLoggingOut(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <a
          href={appUrl}
          className="bg-foreground px-6 py-2 text-sm text-background hover:opacity-80 transition-opacity"
        >
          Open RedView App
        </a>
        <Link
          href={pricingHref}
          className="border border-border px-6 py-2 text-sm hover:border-foreground transition-colors"
        >
          Billing & Pricing
        </Link>
        <a
          href={demoUrl}
          className="border border-border px-6 py-2 text-sm hover:border-foreground transition-colors"
        >
          Public Demo
        </a>
      </div>

      <div className="flex items-center gap-3 text-sm text-muted">
        <span>Nothing map-related is loaded from this page.</span>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="underline hover:text-foreground disabled:opacity-50"
        >
          {loggingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </div>
  );
}