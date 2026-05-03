"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  buildLandingAuthCallbackUrl,
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

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const trimmedName = name.trim();
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
            data: {
              full_name: trimmedName,
            },
            emailRedirectTo: buildLandingAuthCallbackUrl(window.location.origin),
            shouldCreateUser: true,
          },
        }),
        AUTH_REQUEST_TIMEOUT_MS,
        "Supabase signup OTP request"
      );

      if (otpError) {
        throw otpError;
      }

      const params = new URLSearchParams({
        email,
        sentAt: String(Date.now()),
      });

      if (trimmedName) {
        params.set("name", trimmedName);
      }

      router.push(`/auth/signup/verify?${params.toString()}`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to send the verification code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError(null);
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
        "Supabase Google signup"
      );

      if (oauthError) {
        throw oauthError;
      }
    } catch (oauthError) {
      setError(getOAuthErrorMessage(oauthError, "Unable to start Google sign up. Please try again."));
      setOauthLoading(false);
    }
  };

  return (
    <>
      <AuthShell
        mode="signup"
        title="Create an account"
        subtitle="Start your 30-day free trial with Google or a Supabase e-mail code."
        footerAction={
          <Link href="/auth/login" className="transition-opacity hover:opacity-80">
            Already verified? Continue to Log in
          </Link>
        }
      >
        <form onSubmit={handleRequestCode} className="flex w-full flex-col gap-6">
          <div className="flex flex-col gap-5">
            <AuthField label="Name" htmlFor="name">
              <AuthInput
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter your name"
                autoComplete="name"
              />
            </AuthField>

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
          </div>

          {error ? <p className="text-sm text-[#ff8d8d]">{error}</p> : null}

          <div className="flex flex-col gap-4">
            <AuthActionButton type="submit" disabled={loading || oauthLoading}>
              {loading ? "Sending code..." : "Continue with email"}
            </AuthActionButton>

            <AuthActionButton
              variant="secondary"
              disabled={loading || oauthLoading}
              onClick={handleGoogleSignup}
            >
              <GoogleMark />
              {oauthLoading ? "Starting Google sign up..." : "Sign up with Google"}
            </AuthActionButton>
          </div>
        </form>
      </AuthShell>
    </>
  );
}
