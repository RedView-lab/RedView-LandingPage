import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">
          Checkout cancelled
        </h1>
        <p className="text-muted mb-8">
          Your checkout was cancelled. No charges were made.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/pricing"
            className="block w-full bg-foreground text-background py-3 text-sm font-medium hover:opacity-80 transition-opacity"
          >
            Back to pricing
          </Link>
          <Link
            href="/"
            className="block w-full border border-border py-3 text-sm hover:border-foreground transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
