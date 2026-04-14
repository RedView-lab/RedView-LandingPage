"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5173";

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-5xl mb-4">✓</div>
        <h1 className="text-2xl font-semibold tracking-tight mb-2">
          Subscription active!
        </h1>
        <p className="text-muted mb-8">
          Your RedView Pro subscription is now active. You have full access to
          all features.
        </p>

        <div className="flex flex-col gap-3">
          <a
            href={appUrl}
            className="block w-full bg-foreground text-background py-3 text-sm font-medium hover:opacity-80 transition-opacity"
          >
            Open RedView
          </a>
          <Link
            href="/pricing"
            className="block w-full border border-border py-3 text-sm hover:border-foreground transition-colors"
          >
            Manage subscription
          </Link>
        </div>

        {sessionId && (
          <p className="text-xs text-muted mt-6">
            Session: {sessionId.slice(0, 20)}...
          </p>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted">Loading...</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
