import { NextResponse } from "next/server";
import { getLandingPageData } from "@/features/landing/api/get-landing-page-data";

export async function GET() {
  const landingPageData = await getLandingPageData();

  return NextResponse.json(landingPageData);
}