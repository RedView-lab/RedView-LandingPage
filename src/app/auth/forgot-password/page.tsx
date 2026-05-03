"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  AuthActionButton,
  AuthField,
  AuthInput,
  AuthShell,
} from "@/components/auth/AuthShell";

const AUTH_REQUEST_TIMEOUT_MS = 15000;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error);
      }
    );
  });
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const supabase = createClient({
        isSingleton: false,
        auth: {
          autoRefreshToken: false,
          detectSessionInUrl: false,
          persistSession: false,
        },
      });

      const { error: resetError } = await withTimeout(
        supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/login`,
        }),
        AUTH_REQUEST_TIMEOUT_MS,
        "Supabase reset password"
      );

      if (resetError) {
        throw resetError;
      }

      setMessage("Password reset instructions have been sent to your email.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to send reset instructions. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      mode="login"
      title="Reset your password"
      subtitle="Enter the e-mail tied to your RedView account."
      footerAction={<span>Return to Log in after opening the link from your inbox.</span>}
    >
      <form onSubmit={handleReset} className="flex w-full flex-col gap-6">
        <AuthField label="Email" htmlFor="email">
          <AuthInput
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            autoComplete="email"
          />
        </AuthField>

        {error ? <p className="text-sm text-[#ff8d8d]">{error}</p> : null}
        {message ? <p className="text-sm text-white/72">{message}</p> : null}

        <AuthActionButton type="submit" disabled={loading}>
          {loading ? "Sending reset link..." : "Send reset link"}
        </AuthActionButton>
      </form>
    </AuthShell>
  );
}