create extension if not exists pgcrypto;

create table if not exists public.signup_email_otps (
  id uuid primary key default gen_random_uuid(),
  request_token uuid not null unique default gen_random_uuid(),
  email text not null,
  full_name text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  attempt_count integer not null default 0,
  send_count integer not null default 1,
  last_sent_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists signup_email_otps_email_active_idx
  on public.signup_email_otps (email, created_at desc)
  where consumed_at is null;

create index if not exists signup_email_otps_expires_at_idx
  on public.signup_email_otps (expires_at);

create or replace function public.set_signup_email_otps_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_signup_email_otps_updated_at on public.signup_email_otps;

create trigger set_signup_email_otps_updated_at
before update on public.signup_email_otps
for each row
execute function public.set_signup_email_otps_updated_at();

alter table public.signup_email_otps enable row level security;

revoke all on public.signup_email_otps from anon;
revoke all on public.signup_email_otps from authenticated;

comment on table public.signup_email_otps is 'Stores temporary 4-digit e-mail signup codes for the landing page. Access only through server-side service-role routes.';