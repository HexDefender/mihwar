import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { LoginForm } from "@/components/login/login-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="relative min-h-[100dvh] flex flex-col">
      <div className="absolute inset-0 grid-floor opacity-[0.4] -z-10" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 [background:radial-gradient(60%_50%_at_50%_0%,color-mix(in_oklab,var(--accent)_15%,transparent),transparent_70%)]" aria-hidden="true" />

      <header className="px-5 md:px-8 py-5 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-fg-soft hover:text-fg transition-colors text-sm">
          <ArrowLeft size={16} weight="bold" className="rtl:scale-x-[-1]" />
          {t.login.backHome}
        </Link>
        <ThemeToggle />
      </header>

      <main className="relative flex-1 flex items-center justify-center px-4 sm:px-5 py-8 sm:py-10">
        <div className="w-full max-w-md">
          <div className="bezel">
            <div className="bezel-inner relative overflow-hidden p-6 sm:p-8 md:p-10">
              <div
                className="absolute -top-16 -right-16 h-44 w-44 rounded-full opacity-25 blur-3xl pointer-events-none"
                style={{ background: "var(--accent)" }}
                aria-hidden="true"
              />
              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full border border-line bg-bg-elev/70 px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-fg-soft">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                  {t.login.eyebrow}
                </span>
                <h1 className="mt-5 text-2xl sm:text-3xl md:text-[34px] font-semibold tracking-tight leading-tight">
                  {t.login.title}
                </h1>
                <p className="mt-3 text-fg-soft text-[14px] sm:text-[15px] leading-relaxed">{t.login.body}</p>

                <div className="mt-8">
                  <Suspense fallback={<div className="h-64 rounded-2xl bg-fg/4 animate-pulse" />}>
                    <LoginForm />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-[12px] text-fg-mute font-mono uppercase tracking-[0.22em]">
            {t.brand.nameLatin} · {t.brand.name} · v1.0
          </p>
        </div>
      </main>
    </div>
  );
}
