import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Landing-page customer portal is disabled. Open RedView App and manage billing from the subscription tab.",
    },
    { status: 410 }
  );
}
