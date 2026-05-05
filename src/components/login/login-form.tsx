"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { signInAction, type SignInState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Eye, EyeSlash, Warning } from "@phosphor-icons/react";
import { t } from "@/lib/i18n";

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: t.login.error,
  INVALID_INPUT: "أكمل الحقول قبل المتابعة.",
  CallbackRouteError: t.login.error,
};

export function LoginForm() {
  const params = useSearchParams();
  const from = params.get("from") || "/dashboard";

  const [state, action, pending] = useActionState<SignInState, FormData>(
    signInAction,
    null
  );
  const [showPwd, setShowPwd] = useState(false);

  const errorMessage = state?.error
    ? ERROR_MESSAGES[state.error] ?? t.login.error
    : null;

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="redirectTo" value={from} />

      <div>
        <Label htmlFor="identifier">{t.login.identifier}</Label>
        <Input
          id="identifier"
          name="identifier"
          autoComplete="username"
          required
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

      {errorMessage && (
        <motion.div
          initial={{ y: -6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-2 rounded-2xl border border-[color-mix(in_oklab,var(--danger)_30%,transparent)] bg-[color-mix(in_oklab,var(--danger)_8%,transparent)] px-4 py-3 text-sm text-[var(--danger)]"
        >
          <Warning size={16} weight="duotone" />
          {errorMessage}
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
