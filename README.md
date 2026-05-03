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
- `SUPABASE_SERVICE_ROLE_KEY`: required by server routes that create checkout sessions and now by the custom e-mail signup code flow.
- `SIGNUP_EMAIL_OTP_SECRET`: any long random secret used to hash the 4-digit verification codes before they are stored.
- `RESEND_API_KEY`
- `AUTH_EMAIL_FROM`: sender identity used for the signup verification e-mails, for example `RedView <auth@your-domain.com>`.

## E-mail Signup Code Flow

The signup page now supports a custom 4-digit verification code flow for the non-Google path.

1. Run the SQL in `supabase-email-signup-otp-migration.sql` in the Supabase SQL editor.
2. Set the e-mail environment variables listed above.
3. Make sure your sender domain is verified in Resend.
4. Keep `/auth/callback` configured in Supabase URL settings because the final verified handoff still finishes through Supabase magic-link session exchange.

Implementation notes:

- The 4-digit code is not handled by Supabase Auth directly. It is custom, hashed server-side, rate-limited, and stored in `public.signup_email_otps`.
- After the code is verified, the server generates a Supabase magic link internally and redirects the browser through the normal `/auth/callback` flow so the main RedView app still receives a real Supabase session.
- This keeps the user-facing UX at 4 digits while preserving the existing Supabase auth/session handoff.

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
