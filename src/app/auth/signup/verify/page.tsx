import { Suspense } from "react";
import { VerifyPageClient } from "./VerifyPageClient";

export default function SignUpVerifyPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#151515] px-4 py-10 text-white sm:px-6 sm:py-14">
          <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[960px] items-center justify-center">
            <div className="w-full max-w-[520px] rounded-[12px] border border-white/8 bg-[#262626] px-6 py-8 text-center shadow-[0_20px_24px_-4px_rgba(10,13,18,0.48),0_8px_8px_-4px_rgba(10,13,18,0.24),0_3px_3px_-1.5px_rgba(10,13,18,0.18)] sm:px-8">
              <h1 className="text-[30px] font-medium leading-[1.1] tracking-[-0.02em] text-white sm:text-[34px]">
                Please check your email.
              </h1>
              <p className="mt-3 text-[14px] leading-5 text-white/64">
                Loading your verification request...
              </p>
            </div>
          </div>
        </main>
      }
    >
      <VerifyPageClient />
    </Suspense>
  );
}