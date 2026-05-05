"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { CheckCircle, X, Clock } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { confirmTransfer, rejectTransfer, cancelTransfer } from "@/actions/transfers";
import { formatRelativeTime, statusLabel } from "@/lib/utils";

type TransferRowProps = {
  transfer: {
    id: string;
    status: string;
    initiatedAt: Date | string;
    confirmedAt?: Date | string | null;
    message?: string | null;
    expectedReturn?: Date | string | null;
    equipment: { id: string; nameAr: string; name: string; serial: string; image: string | null };
    sender: { id: string; name: string; nameAr: string | null; avatarUrl?: string | null };
    receiver: { id: string; name: string; nameAr: string | null; avatarUrl?: string | null };
  };
  perspective: "incoming" | "outgoing" | "history";
  currentUserId: string;
  isAdmin: boolean;
};

export function TransferRow({ transfer, perspective, currentUserId, isAdmin }: TransferRowProps) {
  const lbl = statusLabel(transfer.status);
  const [pending, start] = useTransition();
  const [responseNote, setResponseNote] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  const canConfirm = perspective === "incoming" && transfer.status === "PENDING" && transfer.receiver.id === currentUserId;
  const canCancel = perspective === "outgoing" && transfer.status === "PENDING" && (transfer.sender.id === currentUserId || isAdmin);

  function handle(fn: typeof confirmTransfer) {
    return () => {
      const fd = new FormData();
      fd.set("id", transfer.id);
      if (responseNote) fd.set("responseNote", responseNote);
      start(async () => {
        try {
          await fn(fd);
        } catch (err) {
          console.error(err);
        }
      });
    };
  }

  return (
    <motion.li
      layout
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="rounded-3xl border border-line bg-bg-elev/60 backdrop-blur-md p-5"
    >
      <div className="flex items-start gap-4">
        <Link href={`/dashboard/equipment/${transfer.equipment.id}`} className="relative h-16 w-16 rounded-2xl overflow-hidden bg-fg/5 border border-line shrink-0">
          {transfer.equipment.image && (
            <Image src={transfer.equipment.image} alt={transfer.equipment.nameAr} fill sizes="64px" className="object-cover" />
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <Link href={`/dashboard/equipment/${transfer.equipment.id}`} className="font-semibold leading-tight hover:underline underline-offset-4">
              {transfer.equipment.nameAr}
            </Link>
            <Badge tone={lbl.tone}>{lbl.ar}</Badge>
          </div>
          <p className="text-[12px] text-fg-mute font-mono mt-1">{transfer.equipment.serial}</p>

          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm">
              <Avatar className="h-7 w-7">
                {transfer.sender.avatarUrl && <AvatarImage src={transfer.sender.avatarUrl} alt={transfer.sender.name} />}
                <AvatarFallback name={transfer.sender.nameAr || transfer.sender.name} className="text-[10px]" />
              </Avatar>
              <span className="text-fg-soft">{transfer.sender.nameAr || transfer.sender.name}</span>
            </div>
            <span className="text-fg-mute text-xs">→</span>
            <div className="flex items-center gap-2 text-sm">
              <Avatar className="h-7 w-7">
                {transfer.receiver.avatarUrl && <AvatarImage src={transfer.receiver.avatarUrl} alt={transfer.receiver.name} />}
                <AvatarFallback name={transfer.receiver.nameAr || transfer.receiver.name} className="text-[10px]" />
              </Avatar>
              <span className="text-fg-soft">{transfer.receiver.nameAr || transfer.receiver.name}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3 text-[12px] text-fg-mute font-mono">
            <Clock size={12} weight="bold" />
            <span>{formatRelativeTime(transfer.initiatedAt)}</span>
            {transfer.expectedReturn && (
              <span>· إرجاع متوقَّع: {new Date(transfer.expectedReturn).toLocaleDateString("ar-EG")}</span>
            )}
          </div>

          {transfer.message && (
            <div className="mt-3 rounded-2xl bg-fg/4 px-4 py-3 text-[14px] text-fg-soft leading-relaxed break-words">«{transfer.message}»</div>
          )}

          {(canConfirm || canCancel) && (
            <div className="mt-4 flex flex-col gap-3">
              {showRejectInput && (
                <Textarea
                  value={responseNote}
                  onChange={(e) => setResponseNote(e.target.value)}
                  placeholder="سبب الرفض (اختياري)…"
                  rows={2}
                />
              )}
              <div className="flex flex-wrap gap-2">
                {canConfirm && (
                  <>
                    <Button onClick={handle(confirmTransfer)} disabled={pending} variant="accent">
                      <CheckCircle size={16} weight="fill" />
                      تأكيد الاستلام
                    </Button>
                    <Button
                      onClick={() => {
                        if (!showRejectInput) {
                          setShowRejectInput(true);
                          return;
                        }
                        handle(rejectTransfer)();
                      }}
                      disabled={pending}
                      variant="outline"
                    >
                      <X size={16} weight="bold" />
                      {showRejectInput ? "تأكيد الرفض" : "رفض"}
                    </Button>
                  </>
                )}
                {canCancel && (
                  <Button onClick={handle(cancelTransfer)} disabled={pending} variant="outline">
                    إلغاء الطلب
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.li>
  );
}
