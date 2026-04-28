import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Landing-page Stripe webhook is disabled. Point your Stripe webhook to RedView-App /api/stripe/webhook instead.",
    },
    { status: 410 }
  );
}
