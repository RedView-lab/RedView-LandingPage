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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient({ isSingleton: false });
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
        AUTH_REQUEST_TIMEOUT_MS,
        "Supabase login"
      );

      if (error) {
        setError(error.message);
        return;
      }

      if (!data.session) {
        throw new Error("Login succeeded but Supabase did not return a usable session.");
      }

      window.location.href = "/";
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Unable to reach Supabase. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center">
      <form onSubmit={handleLogin} className="flex flex-col gap-4 w-80">
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
          placeholder="Password"
          className="border border-border px-3 py-2 text-sm focus:border-foreground focus:outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-foreground text-background py-2 px-4 text-sm hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          {loading ? "Loading..." : "Login"}
        </button>

        <p className="text-muted text-sm mt-2">
          No account?{" "}
          <Link href="/auth/signup" className="text-foreground underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
