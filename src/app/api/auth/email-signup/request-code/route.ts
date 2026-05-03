import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  generateSignupEmailCode,
  getResendAvailableAtIso,
  getSignupEmailCodeExpiryIso,
  hashSignupEmailCode,
  isValidEmail,
  normalizeEmail,
  normalizeFullName,
  SIGNUP_EMAIL_CODE_RESEND_COOLDOWN_SECONDS,
} from "@/features/auth/email-signup/lib/otp";
import { sendSignupCodeEmail } from "@/features/auth/email-signup/lib/sendSignupCodeEmail";

type RequestCodePayload = {
  email?: string;
  fullName?: string;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unexpected server error.";
}

export async function POST(request: Request) {
  let payload: RequestCodePayload;

  try {
    payload = (await request.json()) as RequestCodePayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const email = normalizeEmail(payload.email ?? "");
  const fullName = normalizeFullName(payload.fullName ?? "");

  if (!fullName) {
    return NextResponse.json({ error: "Enter your name before requesting a code." }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid e-mail address before requesting a code." }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const now = new Date();
  const nowIso = now.toISOString();

  try {
    const { data: activeAttempt, error: activeAttemptError } = await supabaseAdmin
      .from("signup_email_otps")
      .select("id, send_count, last_sent_at")
      .eq("email", email)
      .is("consumed_at", null)
      .gt("expires_at", nowIso)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (activeAttemptError) {
      throw activeAttemptError;
    }

    if (activeAttempt?.last_sent_at) {
      const elapsedMs = now.getTime() - new Date(activeAttempt.last_sent_at).getTime();
      const cooldownMs = SIGNUP_EMAIL_CODE_RESEND_COOLDOWN_SECONDS * 1_000;

      if (elapsedMs < cooldownMs) {
        return NextResponse.json(
          {
            error: `Wait ${Math.ceil((cooldownMs - elapsedMs) / 1000)} seconds before requesting another code.`,
            resendAvailableAt: getResendAvailableAtIso(new Date(new Date(activeAttempt.last_sent_at).getTime())),
          },
          { status: 429 }
        );
      }
    }

    const code = generateSignupEmailCode();
    const expiresAt = getSignupEmailCodeExpiryIso(now);
    const resendAvailableAt = getResendAvailableAtIso(now);
    const codeHash = hashSignupEmailCode(email, code);

    const { error: invalidateError } = await supabaseAdmin
      .from("signup_email_otps")
      .update({ consumed_at: nowIso })
      .eq("email", email)
      .is("consumed_at", null);

    if (invalidateError) {
      throw invalidateError;
    }

    const { data: insertedAttempt, error: insertError } = await supabaseAdmin
      .from("signup_email_otps")
      .insert({
        email,
        full_name: fullName,
        code_hash: codeHash,
        expires_at: expiresAt,
        last_sent_at: nowIso,
        send_count: (activeAttempt?.send_count ?? 0) + 1,
      })
      .select("request_token")
      .single();

    if (insertError) {
      throw insertError;
    }

    await sendSignupCodeEmail({
      email,
      code,
      fullName,
    });

    return NextResponse.json({
      requestToken: insertedAttempt.request_token,
      expiresAt,
      resendAvailableAt,
    });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}