"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Redirect to RedView App
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5173";
    window.location.href = appUrl;
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
