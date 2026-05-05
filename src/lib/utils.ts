import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatArabicDate(date: Date | string | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatRelativeTime(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const rtf = new Intl.RelativeTimeFormat("ar", { numeric: "auto" });
  if (minutes < 1) return "الآن";
  if (minutes < 60) return rtf.format(-minutes, "minute");
  if (hours < 24) return rtf.format(-hours, "hour");
  if (days < 30) return rtf.format(-days, "day");
  return formatArabicDate(d);
}

export function arabicNumber(value: number | string) {
  return String(value).replace(/[0-9]/g, (d) =>
    String.fromCharCode(0x0660 + Number(d))
  );
}

export function statusLabel(status: string): { ar: string; tone: "success" | "warning" | "danger" | "info" | "muted" } {
  const map: Record<string, { ar: string; tone: "success" | "warning" | "danger" | "info" | "muted" }> = {
    AVAILABLE: { ar: "متوفّر", tone: "success" },
    IN_USE: { ar: "قيد الاستخدام", tone: "info" },
    IN_TRANSIT: { ar: "قيد التحويل", tone: "warning" },
    MAINTENANCE: { ar: "صيانة", tone: "warning" },
    RETIRED: { ar: "محال للأرشيف", tone: "muted" },
    PENDING: { ar: "بانتظار التأكيد", tone: "warning" },
    CONFIRMED: { ar: "مُستلَم", tone: "success" },
    REJECTED: { ar: "مرفوض", tone: "danger" },
    CANCELLED: { ar: "مُلغى", tone: "muted" },
    PRISTINE: { ar: "كالجديد", tone: "success" },
    EXCELLENT: { ar: "ممتاز", tone: "success" },
    GOOD: { ar: "جيّد", tone: "info" },
    FAIR: { ar: "مقبول", tone: "warning" },
    WORN: { ar: "متآكل", tone: "danger" },
  };
  return map[status] ?? { ar: status, tone: "muted" };
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
}
