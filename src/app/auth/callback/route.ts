import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5173";

function buildAppAuthRedirectUrl(accessToken: string, refreshToken: string): string {
  const params = new URLSearchParams({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return `${APP_URL}#${params.toString()}`;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      const accessToken = data.session?.access_token;
      const refreshToken = data.session?.refresh_token;

      if (!error && accessToken && refreshToken) {
        return NextResponse.redirect(buildAppAuthRedirectUrl(accessToken, refreshToken));
      }
    } catch (error) {
      console.error("Supabase auth callback failed", error);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`);
}
