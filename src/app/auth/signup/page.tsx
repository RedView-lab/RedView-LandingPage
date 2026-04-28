"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

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

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
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
      const { error } = await withTimeout(
        supabase.auth.signUp({
          email,
          password,
        }),
        AUTH_REQUEST_TIMEOUT_MS,
        "Supabase signup"
      );

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);
    } catch (signUpError) {
      setError(
        signUpError instanceof Error
          ? signUpError.message
          : "Unable to reach Supabase. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center">
        <div className="flex flex-col gap-4 w-80">
          <h1 className="text-2xl font-semibold">RedView</h1>
          <p className="text-sm">Account created. Check your email to confirm.</p>
          <p className="text-sm text-muted">New accounts start on the Demo plan by default. No Stripe redirect is triggered during signup.</p>
          <Link href="/auth/login" className="text-sm underline">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center">
      <form onSubmit={handleSignUp} className="flex flex-col gap-4 w-80">
        <Link href="/" className="text-2xl font-semibold mb-4 hover:opacity-70">
          RedView
        </Link>

        {error && (
          <p className="text-error text-sm">{error}</p>
        )}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Email"
          className="border border-border px-3 py-2 text-sm focus:border-foreground focus:outline-none"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          placeholder="Password"
          className="border border-border px-3 py-2 text-sm focus:border-foreground focus:outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-foreground text-background py-2 px-4 text-sm hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          {loading ? "Loading..." : "Sign Up"}
        </button>

        <p className="text-muted text-sm mt-2">
          Every new account starts on Demo. You can upgrade later from the subscription area.
        </p>

        <p className="text-muted text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-foreground underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
