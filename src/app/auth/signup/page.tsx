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
import {
  buildAppAuthRedirectUrl,
  buildLandingAuthCallbackUrl,
  getOAuthErrorMessage,
} from "@/lib/supabase/auth";

const AUTH_REQUEST_TIMEOUT_MS = 15000;
const SUPABASE_EMAIL_OTP_LENGTH = 6;
const SUPABASE_EMAIL_OTP_RESEND_COOLDOWN_SECONDS = 60;

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
  const [verificationCode, setVerificationCode] = useState<string[]>(Array.from({ length: SUPABASE_EMAIL_OTP_LENGTH }, () => ""));
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationInfo, setVerificationInfo] = useState<string | null>(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendAvailableAt, setResendAvailableAt] = useState<number | null>(null);

  const resendCountdownSeconds = resendAvailableAt
    ? Math.max(Math.ceil((resendAvailableAt - Date.now()) / 1000), 0)
    : 0;

  const resetVerificationState = () => {
    setVerificationCode(Array.from({ length: SUPABASE_EMAIL_OTP_LENGTH }, () => ""));
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
              full_name: name,
            },
            shouldCreateUser: true,
          },
        }),
        AUTH_REQUEST_TIMEOUT_MS,
        "Supabase signup OTP request"
      );

      if (otpError) {
        throw otpError;
      }

      setResendAvailableAt(Date.now() + SUPABASE_EMAIL_OTP_RESEND_COOLDOWN_SECONDS * 1000);
      resetVerificationState();
      setCodeModalOpen(true);
      setInfo("We sent a Supabase verification code to your e-mail.");
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
              full_name: name,
            },
            shouldCreateUser: true,
          },
        }),
        AUTH_REQUEST_TIMEOUT_MS,
        "Supabase signup OTP resend"
      );

      if (otpError) {
        throw otpError;
      }

      setResendAvailableAt(Date.now() + SUPABASE_EMAIL_OTP_RESEND_COOLDOWN_SECONDS * 1000);
      resetVerificationState();
      setVerificationInfo("A fresh Supabase code was sent to your e-mail.");
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
    const joinedCode = verificationCode.join("");

    if (joinedCode.length !== SUPABASE_EMAIL_OTP_LENGTH) {
      setVerificationError(`Enter all ${SUPABASE_EMAIL_OTP_LENGTH} digits before verifying.`);
      return;
    }

    setVerificationError(null);
    setVerificationInfo(null);
    setVerificationLoading(true);

    try {
      const supabase = createClient({ isSingleton: false });
      const {
        data: { session },
        error: verifyError,
      } = await withTimeout(
        supabase.auth.verifyOtp({
          email,
          token: joinedCode,
          type: "email",
        }),
        AUTH_REQUEST_TIMEOUT_MS,
        "Supabase signup OTP verification"
      );

      if (verifyError) {
        throw verifyError;
      }

      if (!session?.access_token || !session.refresh_token) {
        throw new Error("Supabase verified the code but did not return a usable session.");
      }

      if (name.trim()) {
        const { error: updateUserError } = await withTimeout(
          supabase.auth.updateUser({
            data: {
              full_name: name.trim(),
            },
          }),
          AUTH_REQUEST_TIMEOUT_MS,
          "Supabase user metadata update"
        );

        if (updateUserError) {
          throw updateUserError;
        }
      }

      setVerificationInfo("Code verified. Finishing your signup...");
      window.location.href = buildAppAuthRedirectUrl(session.access_token, session.refresh_token);
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
        codeLengthLabel={`${SUPABASE_EMAIL_OTP_LENGTH}-digit code`}
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
