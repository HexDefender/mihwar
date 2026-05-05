"use client";

import { useState, useTransition, type ReactNode } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initiateTransfer } from "@/actions/transfers";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Member = {
  id: string;
  name: string;
  nameAr: string | null;
  position?: string | null;
  positionAr?: string | null;
  avatarUrl?: string | null;
};
type Equipment = { id: string; name: string; nameAr: string; image: string | null };

export function TransferDialog({
  equipment,
  members,
  triggerLabel,
  triggerVariant = "primary",
  triggerIcon,
}: {
  equipment: Equipment;
  members: Member[];
  triggerLabel: string;
  triggerVariant?: "primary" | "accent" | "outline" | "ghost";
  triggerIcon?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [receiverId, setReceiverId] = useState("");
  const [message, setMessage] = useState("");
  const [expectedReturn, setExpectedReturn] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!receiverId) {
      setError("اختر المستلم أوّلاً.");
      return;
    }
    const fd = new FormData();
    fd.set("equipmentId", equipment.id);
    fd.set("receiverId", receiverId);
    if (message) fd.set("message", message);
    if (expectedReturn) fd.set("expectedReturn", expectedReturn);
    start(async () => {
      try {
        await initiateTransfer(fd);
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "حدث خطأ");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant}>
          {triggerIcon}
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تحويل العتاد</DialogTitle>
          <DialogDescription>اختر المستلم وأضف ملاحظة قصيرة. ينتقل المُلكية بعد تأكيده.</DialogDescription>
        </DialogHeader>

        <div className="rounded-2xl border border-line bg-fg/4 p-3 flex items-center gap-3 mb-5">
          {equipment.image && (
            <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-fg/10">
              <Image src={equipment.image} alt={equipment.nameAr} fill sizes="48px" className="object-cover" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-medium truncate">{equipment.nameAr}</p>
            <p className="text-[12px] text-fg-mute truncate">{equipment.name}</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="grid gap-5">
          <div>
            <Label>{t.dashboard.fields.receiver}</Label>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pe-1">
              {members.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => setReceiverId(m.id)}
                    className={cn(
                      "focus-ring w-full text-start flex items-center gap-3 rounded-2xl border p-3 transition-colors",
                      receiverId === m.id
                        ? "border-accent bg-accent-soft"
                        : "border-line bg-bg-elev/60 hover:border-fg/20"
                    )}
                  >
                    <Avatar className="h-10 w-10">
                      {m.avatarUrl && <AvatarImage src={m.avatarUrl} alt={m.name} />}
                      <AvatarFallback name={m.nameAr || m.name} />
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{m.nameAr || m.name}</p>
                      <p className="text-[11px] text-fg-mute truncate">{m.positionAr || m.position || "—"}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Label htmlFor="expectedReturn">{t.dashboard.fields.expectedReturn}</Label>
            <Input
              id="expectedReturn"
              type="date"
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="message">{t.dashboard.fields.message}</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="ملاحظة قصيرة للمستلم…"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ y: -6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-[color-mix(in_oklab,var(--danger)_30%,transparent)] bg-[color-mix(in_oklab,var(--danger)_8%,transparent)] px-4 py-3 text-sm text-[var(--danger)]"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <DialogFooter>
            <Button type="submit" variant="accent" disabled={pending || !receiverId}>
              {pending ? "جارٍ الإرسال…" : t.dashboard.actions.send}
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                {t.dashboard.actions.cancel}
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
