import Link from "next/link";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5173";
const DEMO_URL = `${APP_URL}/?demo=1`;

export default function Home() {
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
          {/*
            Demo entry point. Hits the RedView app with `?demo=1` which
            triggers `isDemoMode()` (src/features/demo) for the entire
            session. The app then:
              - skips Supabase auth + subscription gates
              - locks the basemap to the vector `topographic` style so the
                Mapbox Raster Tiles SKU is never billed
              - blocks every project mutation via assertNotDemo() guards in
                src/lib/projects.ts (defense-in-depth, hardcoded)
          */}
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
