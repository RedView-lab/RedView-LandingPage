import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { buildLandingAuthCallbackUrl } from "@/lib/supabase/auth";
import {
  hashSignupEmailCode,
  isValidEmail,
  normalizeEmail,
  SIGNUP_EMAIL_CODE_LENGTH,
  SIGNUP_EMAIL_CODE_MAX_ATTEMPTS,
} from "@/features/auth/email-signup/lib/otp";

type VerifyCodePayload = {
  email?: string;
  code?: string;
  requestToken?: string;
  origin?: string;
};

type SignupOtpAttemptRow = {
  code_hash: string;
  consumed_at: string | null;
  email: string;
  expires_at: string;
  full_name: string | null;
  id: string;
  request_token: string;
  attempt_count: number;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unexpected server error.";
}

function resolveRedirectOrigin(request: Request, providedOrigin?: string): string {
  if (providedOrigin) {
    try {
      const parsedOrigin = new URL(providedOrigin);
      if (parsedOrigin.protocol === "http:" || parsedOrigin.protocol === "https:") {
        return parsedOrigin.origin;
      }
    } catch {
      // Fall through to the request origin.
    }
  }

  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  let payload: VerifyCodePayload;

  try {
    payload = (await request.json()) as VerifyCodePayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const email = normalizeEmail(payload.email ?? "");
  const code = (payload.code ?? "").trim();
  const requestToken = (payload.requestToken ?? "").trim();

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "The e-mail address is invalid." }, { status: 400 });
  }

  if (!/^\d{4}$/.test(code) || code.length !== SIGNUP_EMAIL_CODE_LENGTH) {
    return NextResponse.json({ error: "Enter the 4-digit code sent to your e-mail." }, { status: 400 });
  }

  if (!requestToken) {
    return NextResponse.json({ error: "Missing signup verification token. Request a new code and retry." }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const nowIso = new Date().toISOString();

  try {
    const { data: attempt, error: attemptError } = await supabaseAdmin
      .from("signup_email_otps")
      .select("id, email, full_name, code_hash, expires_at, consumed_at, request_token, attempt_count")
      .eq("email", email)
      .eq("request_token", requestToken)
      .maybeSingle<SignupOtpAttemptRow>();

    if (attemptError) {
      throw attemptError;
    }

    if (!attempt) {
      return NextResponse.json({ error: "This code request no longer exists. Request a new code." }, { status: 404 });
    }

    if (attempt.consumed_at) {
      return NextResponse.json({ error: "This code was already used. Request a new code." }, { status: 409 });
    }

    if (attempt.expires_at <= nowIso) {
      await supabaseAdmin
        .from("signup_email_otps")
        .update({ consumed_at: nowIso })
        .eq("id", attempt.id);

      return NextResponse.json({ error: "This code expired. Request a new one." }, { status: 410 });
    }

    if (attempt.attempt_count >= SIGNUP_EMAIL_CODE_MAX_ATTEMPTS) {
      return NextResponse.json({ error: "Too many invalid attempts. Request a new code." }, { status: 429 });
    }

    const expectedHash = hashSignupEmailCode(email, code);

    if (attempt.code_hash !== expectedHash) {
      const nextAttemptCount = attempt.attempt_count + 1;
      await supabaseAdmin
        .from("signup_email_otps")
        .update({
          attempt_count: nextAttemptCount,
          consumed_at: nextAttemptCount >= SIGNUP_EMAIL_CODE_MAX_ATTEMPTS ? nowIso : null,
        })
        .eq("id", attempt.id);

      return NextResponse.json(
        {
          error:
            nextAttemptCount >= SIGNUP_EMAIL_CODE_MAX_ATTEMPTS
              ? "Too many invalid attempts. Request a new code."
              : "The code is incorrect. Try again.",
        },
        { status: 400 }
      );
    }

    const { error: consumeError } = await supabaseAdmin
      .from("signup_email_otps")
      .update({ consumed_at: nowIso, attempt_count: attempt.attempt_count + 1 })
      .eq("id", attempt.id)
      .is("consumed_at", null);

    if (consumeError) {
      throw consumeError;
    }

    const redirectOrigin = resolveRedirectOrigin(request, payload.origin);
    const redirectTo = buildLandingAuthCallbackUrl(redirectOrigin);
    const { data: magicLinkData, error: magicLinkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        data: attempt.full_name ? { full_name: attempt.full_name } : undefined,
        redirectTo,
      },
    });

    if (magicLinkError) {
      throw magicLinkError;
    }

    const actionLink = magicLinkData.properties.action_link;

    if (!actionLink) {
      throw new Error("Supabase did not return an action link for the verified signup.");
    }

    return NextResponse.json({ actionLink });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}