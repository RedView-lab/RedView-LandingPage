import {
  SIGNUP_EMAIL_CODE_TTL_MINUTES,
  maskEmailAddress,
} from "@/features/auth/email-signup/lib/otp";

type SendSignupCodeEmailParams = {
  email: string;
  code: string;
  fullName: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildHtmlBody({ code, email, fullName }: SendSignupCodeEmailParams): string {
  const safeName = fullName ? escapeHtml(fullName) : "there";
  const safeEmail = escapeHtml(maskEmailAddress(email));
  const digits = code.split("");

  return `
    <div style="background:#0a0a0a;padding:40px 16px;font-family:Inter,Arial,sans-serif;color:#ffffff;">
      <div style="max-width:460px;margin:0 auto;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:32px 24px;box-shadow:0 20px 40px rgba(0,0,0,0.28);">
        <div style="width:48px;height:48px;border-radius:999px;background:rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
          <div style="width:22px;height:16px;border:1.75px solid #ffffff;border-radius:4px;position:relative;"></div>
        </div>
        <h1 style="font-size:24px;line-height:32px;margin:0 0 8px;text-align:center;font-weight:600;">Verify your e-mail</h1>
        <p style="font-size:14px;line-height:22px;margin:0 0 24px;text-align:center;color:rgba(255,255,255,0.72);">
          Hi ${safeName}, here is your 4-digit RedView signup code for ${safeEmail}.
        </p>
        <div style="display:flex;gap:12px;justify-content:center;margin:0 0 24px;">
          ${digits
            .map(
              (digit) => `
                <div style="width:72px;height:80px;border-radius:12px;border:2px solid rgba(255,255,255,0.28);background:rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;font-size:42px;line-height:1;font-weight:500;letter-spacing:-0.04em;">
                  ${digit}
                </div>`
            )
            .join("")}
        </div>
        <p style="font-size:14px;line-height:22px;margin:0;text-align:center;color:rgba(255,255,255,0.64);">
          This code expires in ${SIGNUP_EMAIL_CODE_TTL_MINUTES} minutes. If you did not request it, you can ignore this e-mail.
        </p>
      </div>
    </div>
  `;
}

export async function sendSignupCodeEmail(params: SendSignupCodeEmailParams): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.AUTH_EMAIL_FROM;

  if (!resendApiKey || !fromEmail) {
    throw new Error("Missing RESEND_API_KEY or AUTH_EMAIL_FROM. Configure an e-mail sender for the signup code flow.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [params.email],
      subject: `${params.code} is your RedView verification code`,
      html: buildHtmlBody(params),
      text: `Your RedView verification code is ${params.code}. It expires in ${SIGNUP_EMAIL_CODE_TTL_MINUTES} minutes.`,
    }),
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`Unable to send signup code e-mail (${response.status}): ${responseText}`);
  }
}