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
    <div className="flex flex-col flex-1 items-center justify-center bg-background">
      <form onSubmit={handleLogin} className="flex flex-col gap-4 w-80">
        <Link href="/" className="text-accent text-2xl font-bold mb-4 hover:underline">
          RedView
        </Link>
        <p className="text-foreground/50 text-xs mb-2">{">"} authentication required_</p>

        {error && (
          <p className="text-error text-xs border border-error/30 bg-error/5 px-3 py-2">
            {"> ERR: "}{error}
          </p>
        )}

        <label className="text-foreground/50 text-xs">EMAIL</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-input-bg border border-border text-foreground px-3 py-2 font-mono text-sm focus:border-accent focus:outline-none"
          placeholder=">_"
        />

        <label className="text-foreground/50 text-xs">PASSWORD</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="bg-input-bg border border-border text-foreground px-3 py-2 font-mono text-sm focus:border-accent focus:outline-none"
          placeholder=">_"
        />

        <button
          type="submit"
          disabled={loading}
          className="border border-accent text-accent py-2 px-4 hover:bg-accent hover:text-background transition-colors font-mono text-sm disabled:opacity-50 mt-2"
        >
          {loading ? "> AUTHENTICATING..." : "> LOGIN"}
        </button>

        <p className="text-foreground/30 text-xs mt-4">
          no account?{" "}
          <Link href="/auth/signup" className="text-accent hover:underline">
            sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
