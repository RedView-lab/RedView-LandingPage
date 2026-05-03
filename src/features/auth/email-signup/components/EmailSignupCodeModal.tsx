"use client";

import { useEffect, useRef } from "react";
import type { ChangeEvent, ClipboardEvent, KeyboardEvent } from "react";

type EmailSignupCodeScreenProps = {
  email: string;
  code: string[];
  codeLengthLabel: string;
  error: string | null;
  info: string | null;
  isSubmitting: boolean;
  isResending: boolean;
  resendCountdownSeconds: number;
  onCancel: () => void;
  onVerify: () => void;
  onResend: () => void;
  onCodeChange: (nextCode: string[]) => void;
};

function MailIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 text-white">
      <path
        d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Zm1.58-.48 5.84 4.54a1 1 0 0 0 1.16 0l5.84-4.54A1 1 0 0 0 17.5 6h-11a1 1 0 0 0-.92 1.02ZM19 8.26l-4.8 3.73a3.5 3.5 0 0 1-4.4 0L5 8.26v8.24c0 .83.67 1.5 1.5 1.5h11c.83 0 1.5-.67 1.5-1.5V8.26Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 text-white">
      <path
        d="M6.7 5.3a1 1 0 0 0-1.4 1.4L10.59 12l-5.3 5.3a1 1 0 1 0 1.42 1.4L12 13.41l5.3 5.3a1 1 0 0 0 1.4-1.42L13.41 12l5.3-5.3a1 1 0 0 0-1.42-1.4L12 10.59 6.7 5.3Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function EmailSignupCodeScreen({
  email,
  code,
  codeLengthLabel,
  error,
  info,
  isSubmitting,
  isResending,
  resendCountdownSeconds,
  onCancel,
  onVerify,
  onResend,
  onCodeChange,
}: EmailSignupCodeScreenProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const joinedCode = code.join("");

  useEffect(() => {
    const firstEmptyIndex = code.findIndex((digit) => !digit);
    const focusIndex = firstEmptyIndex === -1 ? code.length - 1 : firstEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  }, [code]);

  const handleDigitChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value.replace(/\D/g, "").slice(-1);
    const nextCode = [...code];
    nextCode[index] = nextValue;
    onCodeChange(nextCode);

    if (nextValue && index < code.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < code.length - 1) {
      event.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }

    if (event.key === "Enter") {
      event.preventDefault();
      onVerify();
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedDigits = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, code.length)
      .split("");

    if (!pastedDigits.length) {
      return;
    }

    const nextCode = code.map((_, index) => pastedDigits[index] ?? "");
    onCodeChange(nextCode);
  };

  const resendLabel =
    resendCountdownSeconds > 0
      ? `Resend available in ${resendCountdownSeconds}s`
      : isResending
        ? "Sending another code..."
        : "Click to resend";

  return (
    <main className="min-h-screen bg-[#151515] px-4 py-10 text-white sm:px-6 sm:py-14">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[960px] items-center justify-center">
        <div className="relative w-full max-w-[520px] overflow-hidden rounded-[12px] border border-white/8 bg-[#262626] shadow-[0_20px_24px_-4px_rgba(10,13,18,0.48),0_8px_8px_-4px_rgba(10,13,18,0.24),0_3px_3px_-1.5px_rgba(10,13,18,0.18)]">
        <button
          type="button"
          aria-label="Close verification page"
          onClick={onCancel}
          className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-[8px] text-white/88 transition hover:bg-white/8 hover:text-white"
        >
          <CloseIcon />
        </button>

          <div className="flex flex-col items-center px-6 pt-8 text-center sm:px-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/6">
              <MailIcon />
            </div>

            <h1 id="signup-email-code-title" className="text-[30px] font-medium leading-[1.1] tracking-[-0.02em] text-white sm:text-[34px]">
              Please check your email.
            </h1>
            <p className="mt-2 max-w-[320px] text-[14px] leading-5 text-white/64">
              We&apos;ve sent a code to <span className="font-semibold text-white">{email}</span>
            </p>
          </div>

          <div className="px-6 pb-6 pt-6 sm:px-8 sm:pb-8">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {code.map((digit, index) => {
                const isFocusedDigit = !digit && joinedCode.length === index;

                return (
                  <input
                    key={index}
                    ref={(element) => {
                      inputRefs.current[index] = element;
                    }}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(event) => handleDigitChange(index, event)}
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    onPaste={handlePaste}
                    aria-label={`Verification code digit ${index + 1}`}
                    className="h-16 min-w-0 rounded-[12px] border-2 border-white/28 bg-[#323232] text-center font-[var(--font-landing)] text-[44px] font-medium tracking-[-0.02em] text-white outline-none shadow-[0_1px_2px_rgba(10,13,18,0.24)] transition sm:h-20 sm:text-[48px]"
                    style={isFocusedDigit ? { boxShadow: "0 1px 2px rgba(10,13,18,0.24), 0 0 0 2px #ffffff, 0 0 0 4px #9e77ed" } : undefined}
                  />
                );
              })}
            </div>

            <p className="mt-4 text-[13px] leading-5 text-white/52">
              Enter the {codeLengthLabel} sent by Supabase.
            </p>

            <p className="mt-2 text-[14px] leading-5 text-white/64">
              Didn&apos;t get a code?{" "}
              <button
                type="button"
                onClick={onResend}
                disabled={isSubmitting || isResending || resendCountdownSeconds > 0}
                className="underline decoration-white/48 underline-offset-2 transition hover:text-white disabled:cursor-not-allowed disabled:no-underline disabled:opacity-60"
              >
                {resendLabel}
              </button>
              .
            </p>

            {error ? <p className="mt-3 text-sm text-[#ff8d8d]">{error}</p> : null}
            {!error && info ? <p className="mt-3 text-sm text-white/72">{info}</p> : null}

            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex h-11 flex-1 items-center justify-center rounded-[8px] border border-white/10 bg-[#363636] px-4 text-[16px] font-semibold text-white shadow-[0_1px_2px_rgba(10,13,18,0.24),inset_0_0_0_1px_rgba(255,255,255,0.04)] transition hover:bg-[#404040]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onVerify}
                disabled={isSubmitting || joinedCode.length !== code.length}
                className="flex h-11 flex-1 items-center justify-center rounded-[8px] bg-[#890000] px-4 text-[16px] font-semibold text-white transition hover:bg-[#9f0000] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Verifying..." : "Verify"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}