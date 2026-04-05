import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.session) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5173";
      const { access_token, refresh_token } = data.session;
      return NextResponse.redirect(`${appUrl}#access_token=${access_token}&refresh_token=${refresh_token}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`);
}
