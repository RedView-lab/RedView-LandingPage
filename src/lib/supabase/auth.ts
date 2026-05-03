const DEFAULT_APP_URL = "http://localhost:5173";

const GOOGLE_PROVIDER_DISABLED_PATTERN = /unsupported provider|provider is not enabled/i;
const OAUTH_REDIRECT_MISMATCH_PATTERN = /redirect(?:_to)?(?: url)?(?: is)? not allowed|invalid redirect|redirect uri mismatch/i;

export function buildAppAuthRedirectUrl(accessToken: string, refreshToken: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL;
  const params = new URLSearchParams({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return `${appUrl}#${params.toString()}`;
}

export function buildLandingAuthCallbackUrl(origin: string): string {
  return `${origin}/auth/callback`;
}

export function getOAuthErrorMessage(error: unknown, fallbackMessage: string): string {
  if (!(error instanceof Error)) {
    return fallbackMessage;
  }

  if (GOOGLE_PROVIDER_DISABLED_PATTERN.test(error.message)) {
    return "Google login is not enabled for this Supabase project. In Supabase Dashboard, open Authentication > Providers > Google, enable it, then add the Google OAuth client ID/secret and save.";
  }

  if (OAUTH_REDIRECT_MISMATCH_PATTERN.test(error.message)) {
    return "Google OAuth rejected the redirect URL. Add the landing callback URL to Supabase and Google Cloud: /auth/callback on your local and production domains.";
  }

  return error.message;
}

export function getAuthCallbackErrorMessage(errorCode: string | null): string | null {
  if (!errorCode) {
    return null;
  }

  if (errorCode === "auth_callback_failed") {
    return "Unable to complete the Supabase callback. Check the Google provider settings and callback URLs in Supabase.";
  }

  if (errorCode === "oauth_provider_error") {
    return "Google sign-in was cancelled or rejected by the provider. Retry after checking the Google OAuth consent screen and redirect URLs.";
  }

  return null;
}