"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

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
    let isMounted = true;

    if (!userId) {
      if (isMounted) {
        setState({
          isSubscribed: false,
          isLoading: false,
          status: null,
          currentPeriodEnd: null,
        });
      }
      return;
    }

    setState((s) => ({ ...s, isLoading: true }));

    const supabase = createClient();

    const resolveSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from("user_subscription_status")
          .select("is_subscribed, status, current_period_end")
          .eq("user_id", userId)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          console.error("[landing] Failed to resolve subscription status", error);
          setState({
            isSubscribed: false,
            isLoading: false,
            status: null,
            currentPeriodEnd: null,
          });
          return;
        }

        setState({
          isSubscribed: data?.is_subscribed ?? false,
          isLoading: false,
          status: data?.status ?? (data?.is_subscribed ? null : "demo"),
          currentPeriodEnd: data?.current_period_end ?? null,
        });
      } catch (error) {
        if (cancelled) return;

        console.error("[landing] Subscription bootstrap crashed", error);
        setState({
          isSubscribed: false,
          isLoading: false,
          status: null,
          currentPeriodEnd: null,
        });
      }
    };

    void resolveSubscription();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return state;
}
