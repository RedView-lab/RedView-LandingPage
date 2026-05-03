"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { EmailSignupCodeScreen } from "@/features/auth/email-signup/components/EmailSignupCodeModal";
import { buildAppAuthRedirectUrl, buildLandingAuthCallbackUrl } from "@/lib/supabase/auth";

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

export function VerifyPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email")?.trim() ?? "";
  const name = searchParams.get("name")?.trim() ?? "";
  const sentAtParam = Number(searchParams.get("sentAt") ?? "");

  const [verificationCode, setVerificationCode] = useState<string[]>(() =>
    Array.from({ length: SUPABASE_EMAIL_OTP_LENGTH }, () => "")
  );
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationInfo, setVerificationInfo] = useState<string | null>(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendAvailableAt, setResendAvailableAt] = useState<number | null>(() =>
    Number.isFinite(sentAtParam)
      ? sentAtParam + SUPABASE_EMAIL_OTP_RESEND_COOLDOWN_SECONDS * 1000
      : Date.now() + SUPABASE_EMAIL_OTP_RESEND_COOLDOWN_SECONDS * 1000
  );
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!resendAvailableAt) {
      return;
    }

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [resendAvailableAt]);

  const resendCountdownSeconds = resendAvailableAt
    ? Math.max(Math.ceil((resendAvailableAt - now) / 1000), 0)
    : 0;

  const resetVerificationState = () => {
    setVerificationCode(Array.from({ length: SUPABASE_EMAIL_OTP_LENGTH }, () => ""));
    setVerificationError(null);
    setVerificationInfo(null);
  };

  const handleResendCode = async () => {
    if (!email) {
      setVerificationError("No signup e-mail was found. Start again from the signup page.");
      return;
    }

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
            emailRedirectTo: buildLandingAuthCallbackUrl(window.location.origin),
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
      setNow(Date.now());
      resetVerificationState();
      setVerificationInfo("A fresh 6-digit code was sent to your e-mail.");
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
    if (!email) {
      setVerificationError("No signup e-mail was found. Start again from the signup page.");
      return;
    }

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

      if (name) {
        const { error: updateUserError } = await withTimeout(
          supabase.auth.updateUser({
            data: {
              full_name: name,
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

  return (
    <EmailSignupCodeScreen
      email={email || "your inbox"}
      code={verificationCode}
      codeLengthLabel="6-digit code"
      error={verificationError}
      info={
        verificationInfo ??
        (email
          ? null
          : "No signup request is active. Go back and request a new 6-digit code.")
      }
      isSubmitting={verificationLoading}
      isResending={resendLoading}
      resendCountdownSeconds={resendCountdownSeconds}
      onCancel={() => router.push("/auth/signup")}
      onVerify={handleVerifyCode}
      onResend={handleResendCode}
      onCodeChange={(nextCode) => {
        setVerificationCode(nextCode);
        if (verificationError) {
          setVerificationError(null);
        }
      }}
    />
  );
}