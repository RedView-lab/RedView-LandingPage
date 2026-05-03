import { LANDING_PAGE_CONTENT } from "@/features/landing/content/landing-content";
import type { LandingPageData } from "@/features/landing/types/landing";

export async function getLandingPageData(): Promise<LandingPageData> {
  return LANDING_PAGE_CONTENT;
}