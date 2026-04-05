import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center">
      <main className="flex flex-col items-center gap-8">
        <h1 className="text-4xl font-semibold tracking-tight">
          RedView
        </h1>

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
      </main>
    </div>
  );
}
