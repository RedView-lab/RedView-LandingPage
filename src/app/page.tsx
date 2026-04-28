import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5173";

function buildAppAuthRedirectUrl(accessToken: string, refreshToken: string): string {
  const params = new URLSearchParams({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return `${APP_URL}#${params.toString()}`;
}

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const accessToken = session?.access_token;
    const refreshToken = session?.refresh_token;

    if (accessToken && refreshToken) {
      redirect(buildAppAuthRedirectUrl(accessToken, refreshToken));
    }

    redirect(APP_URL);
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center">
      <main className="flex flex-col items-center gap-8">
        <h1 className="text-4xl font-semibold tracking-tight">
          RedView
        </h1>

        <p className="text-muted text-sm max-w-xs text-center">
          High-resolution 3D terrain, LiDAR, and activity analysis platform.
        </p>

        <div className="flex gap-3">
          <Link
            href="/auth/login"
            className="bg-foreground text-background px-6 py-2 text-sm hover:opacity-80 transition-opacity"
          >
            Login
          </Link>
          <Link
            href="/auth/signup"
            className="border border-border px-6 py-2 text-sm hover:border-foreground transition-colors"
          >
            Sign Up
          </Link>
        </div>

        <Link
          href="/pricing"
          className="text-muted text-sm hover:text-foreground transition-colors"
        >
          View pricing →
        </Link>
      </main>
    </div>
  );
}
