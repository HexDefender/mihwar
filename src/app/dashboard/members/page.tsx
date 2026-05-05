import Link from "next/link";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { t } from "@/lib/i18n";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const members = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { ownedEquipment: true } },
    },
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{t.dashboard.sections.members}</h1>
          <p className="text-fg-soft mt-2">إدارة أعضاء الفريق وصلاحياتهم.</p>
        </div>
        <Button asChild variant="accent">
          <Link href="/dashboard/members/new">
            <Plus size={16} weight="bold" />
            {t.dashboard.actions.newMember}
          </Link>
        </Button>
      </div>

      {members.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line bg-bg-elev/40 p-16 text-center text-fg-mute">
          {t.dashboard.empty.members}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {members.map((m) => (
            <Link
              key={m.id}
              href={`/dashboard/members/${m.id}`}
              className="group flex items-center gap-4 rounded-3xl border border-line bg-bg-elev/60 backdrop-blur-md p-5 transition-all duration-300 hover:border-fg/20 hover:-translate-y-0.5"
            >
              <Avatar className="h-14 w-14">
                {m.avatarUrl && <AvatarImage src={m.avatarUrl} alt={m.name} />}
                <AvatarFallback name={m.nameAr || m.name} className="text-sm" />
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold leading-tight truncate">{m.nameAr || m.name}</h3>
                  <Badge tone={m.role === "ADMIN" ? "accent" : "info"}>
                    {m.role === "ADMIN" ? "مدير" : "عضو"}
                  </Badge>
                  {!m.active && <Badge tone="muted">معطّل</Badge>}
                </div>
                <p className="text-[12px] text-fg-mute mt-1 truncate">
                  {m.positionAr || m.position || "—"} · {m._count.ownedEquipment} قطعة
                </p>
                <p className="text-[11px] text-fg-mute font-mono mt-0.5 truncate">{m.email}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
