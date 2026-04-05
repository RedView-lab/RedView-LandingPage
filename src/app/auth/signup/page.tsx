"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

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

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center">
        <div className="flex flex-col gap-4 w-80">
          <h1 className="text-2xl font-semibold">RedView</h1>
          <p className="text-sm">Account created. Check your email to confirm.</p>
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
          Already have an account?{" "}
          <Link href="/auth/login" className="text-foreground underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
