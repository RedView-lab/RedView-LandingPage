## RedView Landing Page

Marketing site and auth handoff app built with Next.js and Supabase Auth.

## Getting Started

```bash
npm run dev
```

Open `http://localhost:3000` to access the landing pages and authentication screens.

## Environment

Create `.env.local` from `.env.example` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`: final destination after the auth exchange. In local development this is usually the main RedView app, for example `http://localhost:5173`.
- `SUPABASE_SERVICE_ROLE_KEY`: required by server routes that create checkout sessions and other admin-side operations.

## E-mail Signup Code Flow

The signup page now uses Supabase's native passwordless e-mail OTP flow for the non-Google path.

1. In Supabase Dashboard, open `Authentication > Email Templates`.
2. In the Magic Link template, use `{{ .Token }}` instead of `{{ .ConfirmationURL }}` if you want a numeric OTP e-mail instead of a link.
3. In `Authentication > Providers > Email`, keep e-mail auth enabled and configure the OTP expiry if needed.
4. The signup page calls `signInWithOtp()` and then `verifyOtp({ type: 'email' })` directly from the client, then forwards the session into the main RedView app.

Implementation notes:

- Supabase's e-mail OTP flow is the documented path for passwordless e-mail login. Their docs describe it as a six-digit code by default.
- No custom SQL table or custom mail sender is required for this signup path anymore.
- Google OAuth still uses `/auth/callback`; e-mail OTP signup redirects straight to the main app once Supabase returns a session.

## Google OAuth Setup

The login and signup pages already start Google OAuth through Supabase and return through `/auth/callback` in this app.

If you see `Unsupported provider: provider is not enabled`, the remaining work is in Supabase and Google Cloud, not in this repository.

1. In Google Cloud Console, create an OAuth 2.0 Client ID for a Web application.
2. In that Google OAuth client, add this Authorized redirect URI:
	`https://yhovivcoeiovpnbnqjhf.supabase.co/auth/v1/callback`
3. In Supabase Dashboard, open `Authentication > URL Configuration`.
4. Set `Site URL` to the landing site URL.
	Local example: `http://localhost:3000`
	Production example: `https://your-landing-domain`
5. In the same Supabase screen, add every landing callback URL to `Additional Redirect URLs`:
	`http://localhost:3000/auth/callback`
	`https://your-landing-domain/auth/callback`
6. In Supabase Dashboard, open `Authentication > Providers > Google`.
7. Enable Google.
8. Paste the Google OAuth client ID and client secret from Google Cloud.
9. Save the provider configuration.
10. Retry the Google login from `/auth/login` or `/auth/signup`.

Important:

- The Supabase-hosted callback stays `https://yhovivcoeiovpnbnqjhf.supabase.co/auth/v1/callback`.
- This repository callback route stays `/auth/callback`.
- `NEXT_PUBLIC_APP_URL` is not the landing URL. It is the destination RedView app URL that receives the exchanged session tokens after auth succeeds.

## Build

```bash
npm run build
```
