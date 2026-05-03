"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  AuthActionButton,
  AuthField,
  AuthInput,
  AuthShell,
  GoogleMark,
} from "@/components/auth/AuthShell";
import { EmailSignupCodeModal } from "@/features/auth/email-signup/components/EmailSignupCodeModal";
import { SIGNUP_EMAIL_CODE_LENGTH } from "@/features/auth/email-signup/lib/otp";
import { buildLandingAuthCallbackUrl, getOAuthErrorMessage } from "@/lib/supabase/auth";

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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string[]>(Array.from({ length: SIGNUP_EMAIL_CODE_LENGTH }, () => ""));
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationInfo, setVerificationInfo] = useState<string | null>(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [requestToken, setRequestToken] = useState<string | null>(null);
  const [resendAvailableAt, setResendAvailableAt] = useState<number | null>(null);

  const resendCountdownSeconds = resendAvailableAt
    ? Math.max(Math.ceil((resendAvailableAt - Date.now()) / 1000), 0)
    : 0;

  const resetVerificationState = () => {
    setVerificationCode(Array.from({ length: SIGNUP_EMAIL_CODE_LENGTH }, () => ""));
    setVerificationError(null);
    setVerificationInfo(null);
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setVerificationError(null);
    setVerificationInfo(null);
    setLoading(true);

    try {
      const response = await withTimeout(
        fetch("/api/auth/email-signup/request-code", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            fullName: name,
          }),
        }),
        AUTH_REQUEST_TIMEOUT_MS,
        "Signup e-mail code request"
      );
      const payload = (await response.json()) as {
        error?: string;
        expiresAt?: string;
        requestToken?: string;
        resendAvailableAt?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to send the verification code.");
      }

      setRequestToken(payload.requestToken ?? null);
      setResendAvailableAt(payload.resendAvailableAt ? new Date(payload.resendAvailableAt).getTime() : null);
      resetVerificationState();
      setCodeModalOpen(true);
      setInfo("We sent a 4-digit verification code to your e-mail.");
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

  const handleResendCode = async () => {
    setVerificationError(null);
    setVerificationInfo(null);
    setResendLoading(true);

    try {
      const response = await withTimeout(
        fetch("/api/auth/email-signup/request-code", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            fullName: name,
          }),
        }),
        AUTH_REQUEST_TIMEOUT_MS,
        "Signup e-mail code resend"
      );
      const payload = (await response.json()) as {
        error?: string;
        requestToken?: string;
        resendAvailableAt?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to resend the verification code.");
      }

      setRequestToken(payload.requestToken ?? null);
      setResendAvailableAt(payload.resendAvailableAt ? new Date(payload.resendAvailableAt).getTime() : null);
      resetVerificationState();
      setVerificationInfo("A fresh 4-digit code was sent to your e-mail.");
    } catch (resendError) {
      setVerificationError(
        resendError instanceof Error
          ? resendError.message
          : "Unable to resend the verification code."
      );
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!requestToken) {
      setVerificationError("The current verification request expired. Request a new code.");
      return;
    }

    const joinedCode = verificationCode.join("");

    if (joinedCode.length !== SIGNUP_EMAIL_CODE_LENGTH) {
      setVerificationError("Enter all 4 digits before verifying.");
      return;
    }

    setVerificationError(null);
    setVerificationInfo(null);
    setVerificationLoading(true);

    try {
      const response = await withTimeout(
        fetch("/api/auth/email-signup/verify-code", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: joinedCode,
            email,
            origin: window.location.origin,
            requestToken,
          }),
        }),
        AUTH_REQUEST_TIMEOUT_MS,
        "Signup e-mail code verification"
      );
      const payload = (await response.json()) as {
        actionLink?: string;
        error?: string;
      };

      if (!response.ok || !payload.actionLink) {
        throw new Error(payload.error ?? "Unable to verify the code.");
      }

      setVerificationInfo("Code verified. Finishing your signup...");
      window.location.href = payload.actionLink;
    } catch (verifyError) {
      setVerificationError(
        verifyError instanceof Error ? verifyError.message : "Unable to verify the code."
      );
    } finally {
      setVerificationLoading(false);
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
        subtitle="Start your 30-day free trial with Google or a 4-digit e-mail code."
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
        {!error && info ? <p className="text-sm text-white/72">{info}</p> : null}

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

      <EmailSignupCodeModal
        email={email}
        isOpen={codeModalOpen}
        code={verificationCode}
        error={verificationError}
        info={verificationInfo}
        isSubmitting={verificationLoading}
        isResending={resendLoading}
        resendCountdownSeconds={resendCountdownSeconds}
        onClose={() => {
          setCodeModalOpen(false);
          setVerificationError(null);
          setVerificationInfo(null);
        }}
        onVerify={handleVerifyCode}
        onResend={handleResendCode}
        onCodeChange={(nextCode) => {
          setVerificationCode(nextCode);
          if (verificationError) {
            setVerificationError(null);
          }
        }}
      />
    </>
  );
}
