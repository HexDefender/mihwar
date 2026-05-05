"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { signInAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Eye, EyeSlash, Warning } from "@phosphor-icons/react";
import { t } from "@/lib/i18n";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") || "/dashboard";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await signInAction({ identifier, password, redirectTo: from });
      if (res?.error) {
        setError(t.login.error);
      } else {
        router.replace(from);
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div>
        <Label htmlFor="identifier">{t.login.identifier}</Label>
        <Input
          id="identifier"
          name="identifier"
          autoComplete="username"
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="admin@mihwar.local"
        />
      </div>

      <div>
        <Label htmlFor="password">{t.login.password}</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPwd ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="pe-12"
          />
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            aria-label="إظهار/إخفاء كلمة المرور"
            className="focus-ring absolute end-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full text-fg-soft hover:bg-fg/5"
          >
            {showPwd ? <EyeSlash size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ y: -6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-2 rounded-2xl border border-[color-mix(in_oklab,var(--danger)_30%,transparent)] bg-[color-mix(in_oklab,var(--danger)_8%,transparent)] px-4 py-3 text-sm text-[var(--danger)]"
        >
          <Warning size={16} weight="duotone" />
          {error}
        </motion.div>
      )}

      <Button type="submit" variant="accent" size="lg" disabled={pending} className="mt-2">
        {pending ? t.login.submitting : t.login.submit}
        {!pending && (
          <span className="ms-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent-fg/15">
            <ArrowRight size={14} weight="bold" className="rtl:scale-x-[-1]" />
          </span>
        )}
      </Button>
    </form>
  );
}
