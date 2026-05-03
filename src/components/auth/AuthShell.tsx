import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type AuthMode = "login" | "signup";

type AuthShellProps = {
  mode: AuthMode;
  title: string;
  subtitle: string;
  children: ReactNode;
  footerAction: ReactNode;
};

type AuthTabsProps = {
  mode: AuthMode;
};

type AuthFieldProps = {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
};

type AuthActionButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
};

export function AuthShell({ mode, title, subtitle, children, footerAction }: AuthShellProps) {
  const ctaLabel = mode === "login" ? "Sign up" : "Log in";
  const ctaHref = mode === "login" ? "/auth/signup" : "/auth/login";
  const ctaPrompt = mode === "login" ? "Don't have an account?" : "Already have an account?";

  return (
    <main className="auth-page min-h-screen px-4 pb-12 pt-6 sm:px-8 sm:pb-20 sm:pt-10">
      <header className="mx-auto flex h-[72px] w-full max-w-[1600px] items-center justify-between gap-6">
        <Link href="/" aria-label="RedView home" className="shrink-0 transition-opacity hover:opacity-80">
          <Image
            src="/landing/header/redview-logo.png"
            alt="RedView"
            width={125}
            height={29}
            priority
            className="h-auto w-[102px] sm:w-[125px]"
          />
        </Link>

        <div className="flex items-center gap-1 text-[13px] text-white/88 sm:text-[15px]">
          <span className="hidden sm:inline">{ctaPrompt}</span>
          <Link href={ctaHref} className="px-1 font-semibold text-white transition-opacity hover:opacity-80">
            {ctaLabel}
          </Link>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-[1600px] justify-center px-0 py-10 sm:px-8 sm:py-20">
        <div className="w-full max-w-[480px]">
          <div className="flex flex-col items-center gap-6 sm:gap-8">
            <div className="w-full text-center text-white">
              <h1 className="font-[var(--font-landing)] text-[34px] font-semibold leading-[1.266] tracking-[-0.02em] sm:text-[30px] sm:tracking-normal">
                {title}
              </h1>
              <p className="mt-3 text-[14px] font-normal leading-5 text-white/72 sm:text-[15px]">
                {subtitle}
              </p>
            </div>

            <AuthTabs mode={mode} />

            <div className="w-full">{children}</div>

            <div className="flex min-h-11 items-center justify-center text-center text-[15px] font-semibold text-white">
              {footerAction}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function AuthTabs({ mode }: AuthTabsProps) {
  const signupActive = mode === "signup";

  return (
    <div className="auth-tabs-grid w-full rounded-[6px] bg-white/8 p-[3px]">
      <Link
        href="/auth/signup"
        className={`auth-tab ${signupActive ? "auth-tab-active" : "auth-tab-inactive"}`}
      >
        Sign up
      </Link>
      <Link
        href="/auth/login"
        className={`auth-tab ${signupActive ? "auth-tab-inactive" : "auth-tab-active"}`}
      >
        Log in
      </Link>
    </div>
  );
}

export function AuthField({ label, htmlFor, hint, children }: AuthFieldProps) {
  return (
    <label htmlFor={htmlFor} className="flex w-full flex-col gap-1.5">
      <span className="text-[13px] font-semibold leading-5 text-white sm:text-[15px]">{label}</span>
      {children}
      {hint ? <span className="text-[12px] leading-5 text-[#535862] sm:text-[14px]">{hint}</span> : null}
    </label>
  );
}

export function AuthInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`auth-input ${props.className ?? ""}`.trim()}
    />
  );
}

export function AuthActionButton({
  children,
  variant = "primary",
  type = "button",
  disabled,
  onClick,
}: AuthActionButtonProps) {
  const variantClass =
    variant === "primary"
      ? "auth-button-primary"
      : variant === "secondary"
        ? "auth-button-secondary"
        : "auth-button-ghost";

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`auth-button ${variantClass}`}
    >
      {children}
    </button>
  );
}

export function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.29h6.44a5.5 5.5 0 0 1-2.39 3.61v2.99h3.86c2.26-2.08 3.58-5.15 3.58-8.62Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.86-2.99c-1.07.72-2.44 1.14-4.07 1.14-3.13 0-5.79-2.11-6.74-4.95H1.27v3.08A11.99 11.99 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.26 14.29A7.2 7.2 0 0 1 4.88 12c0-.79.14-1.56.38-2.29V6.63H1.27A11.99 11.99 0 0 0 0 12c0 1.94.46 3.77 1.27 5.37l3.99-3.08Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.58 1.81l3.43-3.43C17.94 1.15 15.24 0 12 0A11.99 11.99 0 0 0 1.27 6.63l3.99 3.08c.95-2.84 3.61-4.94 6.74-4.94Z"
      />
    </svg>
  );
}