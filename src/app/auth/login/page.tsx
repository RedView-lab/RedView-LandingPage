"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  AuthActionButton,
  AuthField,
  AuthInput,
  AuthShell,
  GoogleMark,
} from "@/components/auth/AuthShell";
import {
  buildAppAuthRedirectUrl,
  buildLandingAuthCallbackUrl,
  getAuthCallbackErrorMessage,
  getOAuthErrorMessage,
} from "@/lib/supabase/auth";

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
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [callbackErrorMessage, setCallbackErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCallbackErrorMessage(getAuthCallbackErrorMessage(params.get("error")));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
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

      const accessToken = data.session?.access_token;
      const refreshToken = data.session?.refresh_token;

      if (!accessToken || !refreshToken) {
        throw new Error("Login succeeded but Supabase did not return a usable session.");
      }

      window.location.href = buildAppAuthRedirectUrl(accessToken, refreshToken);
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

  const handleGoogleLogin = async () => {
    setError(null);
    setInfo(null);
    setOauthLoading(true);

    try {
      const supabase = createClient({ isSingleton: false });
      const { error: oauthError } = await withTimeout(
        supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: buildLandingAuthCallbackUrl(window.location.origin),
          },
        }),
        AUTH_REQUEST_TIMEOUT_MS,
        "Supabase Google login"
      );

      if (oauthError) {
        throw oauthError;
      }
    } catch (oauthError) {
      setError(getOAuthErrorMessage(oauthError, "Unable to start Google login. Please try again."));
      setOauthLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError("Enter your email before requesting a one-time sign-in link.");
      return;
    }

    setError(null);
    setInfo(null);
    setMagicLinkLoading(true);

    try {
      const supabase = createClient({
        isSingleton: false,
        auth: {
          autoRefreshToken: false,
          detectSessionInUrl: false,
          persistSession: false,
        },
      });
      const { error: otpError } = await withTimeout(
        supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: buildLandingAuthCallbackUrl(window.location.origin),
          },
        }),
        AUTH_REQUEST_TIMEOUT_MS,
        "Supabase magic link"
      );

      if (otpError) {
        throw otpError;
      }

      setInfo("A one-time sign-in link has been sent to your email.");
    } catch (otpError) {
      setError(
        otpError instanceof Error
          ? otpError.message
          : "Unable to send the one-time email. Please try again."
      );
    } finally {
      setMagicLinkLoading(false);
    }
  };

  return (
    <AuthShell
      mode="login"
      title="Log in to your account"
      subtitle="Welcome back! Please enter your details."
      footerAction={
        <button type="button" onClick={handleMagicLink} className="transition-opacity hover:opacity-80">
          {magicLinkLoading ? "Sending one-time e-mail..." : "Continue with one-time e-mail"}
        </button>
      }
    >
      <form onSubmit={handleLogin} className="flex w-full flex-col gap-6">
        <div className="flex flex-col gap-5">
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

          <AuthField label="Password" htmlFor="password">
            <AuthInput
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </AuthField>
        </div>

        <div className="flex w-full items-center justify-between gap-4 text-[13px] text-white sm:text-[15px]">
          <label className="flex min-w-0 flex-1 items-start gap-2 text-white">
            <input type="checkbox" className="mt-[2px] h-4 w-4 rounded-[4px] border border-white/16 bg-transparent accent-[#890000]" />
            <span className="leading-5">Remember for 30 days</span>
          </label>
          <Link href="/auth/forgot-password" className="font-semibold transition-opacity hover:opacity-80">
            Forgot password
          </Link>
        </div>

        {error ? <p className="text-sm text-[#ff8d8d]">{error}</p> : null}
        {!error && callbackErrorMessage ? <p className="text-sm text-[#ff8d8d]">{callbackErrorMessage}</p> : null}
        {info ? <p className="text-sm text-white/72">{info}</p> : null}

        <div className="flex flex-col gap-4">
          <AuthActionButton type="submit" disabled={loading || oauthLoading || magicLinkLoading}>
            {loading ? "Signing in..." : "Se connecter"}
          </AuthActionButton>

          <AuthActionButton
            variant="secondary"
            disabled={loading || oauthLoading || magicLinkLoading}
            onClick={handleGoogleLogin}
          >
            <GoogleMark />
            {oauthLoading ? "Starting Google sign-in..." : "Sign in with Google"}
          </AuthActionButton>
        </div>
      </form>
    </AuthShell>
  );
}
