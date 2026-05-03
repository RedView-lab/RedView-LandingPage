import { redirect } from "next/navigation";
import { LandingPage } from "@/features/landing/components/page/LandingPage";
import { getLandingPageData } from "@/features/landing/api/get-landing-page-data";
import { createClient } from "@/lib/supabase/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5173";

function buildAppAuthRedirectUrl(accessToken: string, refreshToken: string): string {
  const params = new URLSearchParams({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return `${APP_URL}#${params.toString()}`;
}

async function getAuthenticatedSession() {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session ?? null;
  } catch (error) {
    console.error("Failed to resolve Supabase session on landing page", error);
    return null;
  }
}

export default async function Home() {
  const session = await getAuthenticatedSession();

  if (session) {
    const accessToken = session.access_token;
    const refreshToken = session.refresh_token;

    if (accessToken && refreshToken) {
      redirect(buildAppAuthRedirectUrl(accessToken, refreshToken));
    }

    redirect(APP_URL);
  }

  const landingPageData = await getLandingPageData();

  return (
    <LandingPage content={landingPageData} />
  );
}
