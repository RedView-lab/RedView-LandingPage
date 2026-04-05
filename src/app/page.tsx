import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-background">
      <main className="flex flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-5xl font-bold text-accent tracking-tight cursor-blink">
            RedView
          </h1>
          <p className="text-foreground/60 text-sm">
            {">"} see what matters_
          </p>
        </div>

        <div className="flex flex-col gap-3 w-64">
          <Link
            href="/auth/login"
            className="block w-full border border-accent text-accent text-center py-2 px-4 hover:bg-accent hover:text-background transition-colors font-mono text-sm"
          >
            {">"} LOGIN
          </Link>
          <Link
            href="/auth/signup"
            className="block w-full border border-border text-foreground/60 text-center py-2 px-4 hover:border-accent hover:text-accent transition-colors font-mono text-sm"
          >
            {">"} SIGN UP
          </Link>
        </div>

        <p className="text-foreground/30 text-xs mt-8">
          v0.1.0 — system ready
        </p>
      </main>
    </div>
  );
}
