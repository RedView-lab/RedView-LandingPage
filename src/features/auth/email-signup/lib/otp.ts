import { createHash, randomInt } from "node:crypto";

export const SIGNUP_EMAIL_CODE_LENGTH = 4;
export const SIGNUP_EMAIL_CODE_TTL_MINUTES = 10;
export const SIGNUP_EMAIL_CODE_RESEND_COOLDOWN_SECONDS = 30;
export const SIGNUP_EMAIL_CODE_MAX_ATTEMPTS = 6;

function getOtpSecret(): string {
  const secret = process.env.SIGNUP_EMAIL_OTP_SECRET;

  if (!secret) {
    throw new Error("Missing SIGNUP_EMAIL_OTP_SECRET. Add it to the landing page environment before using e-mail signup codes.");
  }

  return secret;
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizeFullName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function generateSignupEmailCode(): string {
  return randomInt(0, 10 ** SIGNUP_EMAIL_CODE_LENGTH)
    .toString()
    .padStart(SIGNUP_EMAIL_CODE_LENGTH, "0");
}

export function hashSignupEmailCode(email: string, code: string): string {
  return createHash("sha256")
    .update(`${normalizeEmail(email)}:${code}:${getOtpSecret()}`)
    .digest("hex");
}

export function getSignupEmailCodeExpiryIso(now = new Date()): string {
  return new Date(now.getTime() + SIGNUP_EMAIL_CODE_TTL_MINUTES * 60_000).toISOString();
}

export function getResendAvailableAtIso(now = new Date()): string {
  return new Date(now.getTime() + SIGNUP_EMAIL_CODE_RESEND_COOLDOWN_SECONDS * 1_000).toISOString();
}

export function maskEmailAddress(email: string): string {
  const normalizedEmail = normalizeEmail(email);
  const [localPart, domain = ""] = normalizedEmail.split("@");

  if (!localPart) {
    return normalizedEmail;
  }

  if (localPart.length <= 2) {
    return `${localPart[0] ?? ""}*${domain ? `@${domain}` : ""}`;
  }

  return `${localPart.slice(0, 2)}${"*".repeat(Math.max(localPart.length - 2, 1))}${domain ? `@${domain}` : ""}`;
}