import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const ACTION_LABEL: Record<string, { ar: string; tone: "info" | "success" | "warning" | "danger" | "muted" | "accent" }> = {
  USER_CREATE: { ar: "إنشاء عضو", tone: "success" },
  USER_UPDATE: { ar: "تعديل عضو", tone: "info" },
  USER_DELETE: { ar: "حذف عضو", tone: "danger" },
  EQUIPMENT_CREATE: { ar: "إضافة معدّة", tone: "success" },
  EQUIPMENT_UPDATE: { ar: "تعديل معدّة", tone: "info" },
  EQUIPMENT_DELETE: { ar: "حذف معدّة", tone: "danger" },
  TRANSFER_INITIATE: { ar: "بدء تحويل", tone: "accent" },
  TRANSFER_CONFIRM: { ar: "تأكيد استلام", tone: "success" },
  TRANSFER_REJECT: { ar: "رفض تحويل", tone: "warning" },
  TRANSFER_CANCEL: { ar: "إلغاء تحويل", tone: "muted" },
  LOGIN: { ar: "تسجيل دخول", tone: "info" },
  LOGOUT: { ar: "تسجيل خروج", tone: "muted" },
};

export default async function AuditPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { name: true, nameAr: true, avatarUrl: true } },
    },
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto w-full">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">{t.dashboard.sections.audit}</h1>
        <p className="text-fg-soft mt-2">آخر ١٠٠ حدث على المنصّة، مرتّبة من الأحدث.</p>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line bg-bg-elev/40 p-16 text-center text-fg-mute">
          {t.dashboard.empty.audit}
        </div>
      ) : (
        <ol className="relative ps-6 border-s border-line space-y-4">
          {logs.map((log) => {
            const meta = ACTION_LABEL[log.action] ?? { ar: log.action, tone: "muted" as const };
            return (
              <li key={log.id} className="relative">
                <span className="absolute -start-[28px] top-3 h-3 w-3 rounded-full bg-accent ring-4 ring-bg" />
                <div className="rounded-2xl border border-line bg-bg-elev/60 backdrop-blur-md p-4 flex items-center gap-4">
                  {log.user ? (
                    <Avatar className="h-9 w-9">
                      {log.user.avatarUrl && <AvatarImage src={log.user.avatarUrl} alt={log.user.name} />}
                      <AvatarFallback name={log.user.nameAr || log.user.name} className="text-[10px]" />
                    </Avatar>
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-fg/10 flex items-center justify-center text-[10px] text-fg-mute">—</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="text-sm font-medium">
                        {log.user ? (log.user.nameAr || log.user.name) : "نظام"}
                      </p>
                      <Badge tone={meta.tone}>{meta.ar}</Badge>
                    </div>
                    <p className="text-[12px] text-fg-mute font-mono mt-1">
                      {log.entityType} · {formatRelativeTime(log.createdAt)}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
