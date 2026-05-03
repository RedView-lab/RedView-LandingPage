import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { buildAppAuthRedirectUrl } from "@/lib/supabase/auth";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const providerError = searchParams.get("error") || searchParams.get("error_description");

  if (providerError) {
    return NextResponse.redirect(`${origin}/auth/login?error=oauth_provider_error`);
  }

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
