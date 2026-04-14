"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface SubscriptionState {
  isSubscribed: boolean;
  isLoading: boolean;
  status: string | null;
  currentPeriodEnd: string | null;
}

/**
 * Hook to check the current user's subscription status from Supabase.
 * Uses the user_subscription_status view (RLS-protected).
 */
export function useSubscription(
  userId: string | undefined
): SubscriptionState {
  const [state, setState] = useState<SubscriptionState>({
    isSubscribed: false,
    isLoading: true,
    status: null,
    currentPeriodEnd: null,
  });

  useEffect(() => {
    if (!userId) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    supabase
      .from("user_subscription_status")
      .select("is_subscribed, status, current_period_end")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        setState({
          isSubscribed: data?.is_subscribed ?? false,
          isLoading: false,
          status: data?.status ?? null,
          currentPeriodEnd: data?.current_period_end ?? null,
        });
      });
  }, [userId]);

  return state;
}
