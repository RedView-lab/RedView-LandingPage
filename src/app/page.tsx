import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AuthenticatedHomeActions } from "./ui/AuthenticatedHomeActions";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5173";
const DEMO_URL = `${APP_URL}/?demo=1`;

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <main className="flex w-full max-w-2xl flex-col gap-8 border border-border p-10">
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.24em] text-muted">
              RedView Home
            </p>
            <h1 className="text-4xl font-semibold tracking-tight">
              Bonjour{user.email ? `, ${user.email}` : ""}
            </h1>
            <p className="max-w-xl text-sm text-muted">
              Cette page est la destination post-login standard pour tous les comptes.
              Elle ne monte jamais RedView App en arrière-plan, donc aucun moteur Mapbox
              3D ni aucune map n&apos;est chargée tant que l&apos;utilisateur n&apos;ouvre pas explicitement l&apos;application.
            </p>
          </div>

          <AuthenticatedHomeActions
            appUrl={APP_URL}
            demoUrl={DEMO_URL}
            pricingHref="/pricing"
          />
        </main>
      </div>
    );
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
          <a
            href={DEMO_URL}
            className="border border-border px-6 py-2 text-sm hover:border-foreground transition-colors"
          >
            Demo
          </a>
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
