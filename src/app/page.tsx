import { LandingPage } from "@/features/landing/components/page/LandingPage";
import { getLandingPageData } from "@/features/landing/api/get-landing-page-data";

export default async function Home() {
  const landingPageData = await getLandingPageData();

  return (
    <LandingPage content={landingPageData} />
  );
}
