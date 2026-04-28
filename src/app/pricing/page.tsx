import Link from "next/link";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5173";

export default function PricingPage() {

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="text-muted text-sm hover:text-foreground">
            ← Back
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight mt-4">
            RedView Pro
          </h1>
          <p className="text-muted mt-2">
            Plan selection and payment now happen directly inside RedView App, in the subscription tab.
          </p>
        </div>

        <div className="border border-border p-8 rounded-sm">
          <div className="text-center mb-6">
            <span className="text-4xl font-bold">19.99€</span>
            <span className="text-muted ml-1">/month</span>
          </div>

          <ul className="space-y-3 mb-8 text-sm">
            <Feature text="3D terrain visualization with high-res DEM" />
            <Feature text="IGN orthophotos (20cm/px)" />
            <Feature text="LiDAR point cloud viewer" />
            <Feature text="Fit activity analysis & prediction" />
            <Feature text="Weather overlay & animation" />
            <Feature text="Priority support" />
          </ul>

          <a
            href={APP_URL}
            className="block w-full text-center bg-foreground text-background py-3 text-sm font-medium hover:opacity-80 transition-opacity"
          >
            Open RedView App
          </a>

          <p className="text-center text-sm text-muted mt-4">
            Hosted Stripe checkout and portal are disabled on the landing page.
          </p>
        </div>

        <p className="text-center text-xs text-muted mt-6">
          Use the subscription tab inside the app to choose a plan, pay, change plan, or update your card.
        </p>
      </div>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2">
      <span className="text-foreground mt-0.5">✓</span>
      <span>{text}</span>
    </li>
  );
}
