import { t } from "@/lib/i18n";

export function LandingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative border-t border-line bg-bg-elev/40 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-10 md:py-14">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5 font-semibold tracking-tight">
              <div className="relative h-8 w-8 rounded-full bg-fg text-bg flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="3" />
                  <line x1="12" y1="3" x2="12" y2="21" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                </svg>
              </div>
              <span className="text-base">{t.brand.name}</span>
              <span className="text-[11px] text-fg-mute font-mono uppercase tracking-[0.2em]">
                {t.brand.nameLatin}
              </span>
            </div>
            <p className="mt-3 text-sm text-fg-soft leading-relaxed max-w-md">{t.footer.copy}</p>
          </div>
          <div className="md:col-span-4 md:col-start-9 flex flex-col text-sm text-fg-soft gap-2">
            <a href="#features" className="hover:text-fg transition-colors w-fit">{t.nav.features}</a>
            <a href="#flow" className="hover:text-fg transition-colors w-fit">{t.nav.flow}</a>
            <a href="/login" className="hover:text-fg transition-colors w-fit">{t.nav.login}</a>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-line-soft flex flex-col md:flex-row justify-between gap-3 text-[12px] text-fg-mute">
          <span className="font-mono">© {year} Mihwar — {t.footer.rights}.</span>
          <span className="font-mono uppercase tracking-[0.22em]">v 1.0 / محور</span>
        </div>
      </div>
    </footer>
  );
}
