import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Landing-page checkout is disabled. Open RedView App and use the subscription tab for all Stripe flows.",
    },
    { status: 410 }
  );
}
