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
      <div className="flex flex-col flex-1 items-center justify-center bg-background">
        <div className="flex flex-col gap-4 w-80">
          <h1 className="text-accent text-2xl font-bold">RedView</h1>
          <p className="text-accent text-sm">{">"} account created successfully</p>
          <p className="text-foreground/50 text-xs">
            check your email to confirm your account, then{" "}
            <Link href="/auth/login" className="text-accent hover:underline">
              login
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-background">
      <form onSubmit={handleSignUp} className="flex flex-col gap-4 w-80">
        <Link href="/" className="text-accent text-2xl font-bold mb-4 hover:underline">
          RedView
        </Link>
        <p className="text-foreground/50 text-xs mb-2">{">"} create new account_</p>

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
          minLength={6}
          className="bg-input-bg border border-border text-foreground px-3 py-2 font-mono text-sm focus:border-accent focus:outline-none"
          placeholder=">_"
        />

        <button
          type="submit"
          disabled={loading}
          className="border border-accent text-accent py-2 px-4 hover:bg-accent hover:text-background transition-colors font-mono text-sm disabled:opacity-50 mt-2"
        >
          {loading ? "> CREATING..." : "> SIGN UP"}
        </button>

        <p className="text-foreground/30 text-xs mt-4">
          already have an account?{" "}
          <Link href="/auth/login" className="text-accent hover:underline">
            login
          </Link>
        </p>
      </form>
    </div>
  );
}
