import Link from "next/link";
import Image from "next/image";
import { Cube, CheckCircle, Hourglass, ArrowsLeftRight, Plus, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { t } from "@/lib/i18n";
import { formatRelativeTime, statusLabel } from "@/lib/utils";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardOverview() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  const [total, available, inUse, pending, recentEquipment, recentTransfers, myEquipment] = await Promise.all([
    prisma.equipment.count(),
    prisma.equipment.count({ where: { status: "AVAILABLE" } }),
    prisma.equipment.count({ where: { status: "IN_USE" } }),
    prisma.transfer.count({ where: { status: "PENDING" } }),
    prisma.equipment.findMany({
      orderBy: { updatedAt: "desc" },
      take: 4,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        owner: { select: { id: true, name: true, nameAr: true } },
        category: { select: { name: true, nameAr: true } },
      },
    }),
    prisma.transfer.findMany({
      orderBy: { initiatedAt: "desc" },
      take: 5,
      include: {
        equipment: { select: { name: true, nameAr: true } },
        sender: { select: { name: true, nameAr: true } },
        receiver: { select: { name: true, nameAr: true } },
      },
    }),
    prisma.equipment.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { name: true, nameAr: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-10 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-bg-elev/70 backdrop-blur-md px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-fg-soft mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {t.dashboard.overview}
          </span>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{t.dashboard.overviewDesc}</h1>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard/equipment/new">
                <Plus size={16} weight="bold" />
                {t.dashboard.actions.newEquipment}
              </Link>
            </Button>
            <Button asChild variant="accent">
              <Link href="/dashboard/transfers/new">
                <ArrowsLeftRight size={16} weight="bold" />
                {t.dashboard.actions.newTransfer}
              </Link>
            </Button>
          </div>
        )}
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t.dashboard.stats.total} value={total} icon={Cube} tone="neutral" />
        <StatCard label={t.dashboard.stats.available} value={available} icon={CheckCircle} tone="success" />
        <StatCard label={t.dashboard.stats.inUse} value={inUse} icon={Cube} tone="accent" />
        <StatCard label={t.dashboard.stats.pendingTransfers} value={pending} icon={Hourglass} tone="warning" />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-3xl border border-line bg-bg-elev/60 backdrop-blur-md p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold tracking-tight">آخر المعدّات المعدَّلة</h2>
            <Link href="/dashboard/equipment" className="text-[13px] text-fg-soft hover:text-fg flex items-center gap-1">
              عرض الكل <ArrowUpRight size={14} className="rtl:scale-x-[-1]" />
            </Link>
          </div>
          {recentEquipment.length === 0 ? (
            <div className="py-12 text-center text-fg-mute">{t.dashboard.empty.equipment}</div>
          ) : (
            <ul className="divide-y divide-line-soft">
              {recentEquipment.map((eq) => {
                const lbl = statusLabel(eq.status);
                return (
                  <li key={eq.id} className="flex items-center gap-4 py-3">
                    <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-fg/5 border border-line shrink-0">
                      {eq.images[0]?.url && (
                        <Image src={eq.images[0].url} alt={eq.nameAr} fill sizes="56px" className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/dashboard/equipment/${eq.id}`} className="block font-medium truncate hover:underline underline-offset-4">
                        {eq.nameAr}
                      </Link>
                      <div className="text-[12px] text-fg-mute mt-0.5 flex items-center gap-2 flex-wrap">
                        <span className="font-mono">{eq.serial}</span>
                        {eq.category && <span>· {eq.category.nameAr}</span>}
                        {eq.owner && <span>· {eq.owner.nameAr || eq.owner.name}</span>}
                      </div>
                    </div>
                    <Badge tone={lbl.tone}>{lbl.ar}</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="rounded-3xl border border-line bg-bg-elev/60 backdrop-blur-md p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold tracking-tight">آخر التحويلات</h2>
            <Link href="/dashboard/transfers" className="text-[13px] text-fg-soft hover:text-fg flex items-center gap-1">
              عرض الكل <ArrowUpRight size={14} className="rtl:scale-x-[-1]" />
            </Link>
          </div>
          {recentTransfers.length === 0 ? (
            <div className="py-12 text-center text-fg-mute text-sm">{t.dashboard.empty.transfers}</div>
          ) : (
            <ol className="space-y-4">
              {recentTransfers.map((tr) => {
                const lbl = statusLabel(tr.status);
                return (
                  <li key={tr.id} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{tr.sender.nameAr || tr.sender.name}</span>
                        <span className="text-fg-mute"> → </span>
                        <span className="font-medium">{tr.receiver.nameAr || tr.receiver.name}</span>
                      </p>
                      <p className="text-[12px] text-fg-mute truncate">{tr.equipment.nameAr}</p>
                      <p className="text-[11px] text-fg-mute mt-0.5">{formatRelativeTime(tr.initiatedAt)}</p>
                    </div>
                    <Badge tone={lbl.tone} className="text-[10px]">{lbl.ar}</Badge>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold tracking-tight">في عهدتي</h2>
          <span className="font-mono text-[12px] text-fg-mute">{myEquipment.length} قطعة</span>
        </div>
        {myEquipment.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-line bg-bg-elev/40 p-10 text-center text-fg-mute">
            لا توجد قطع في عهدتك حالياً.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myEquipment.map((eq) => {
              const lbl = statusLabel(eq.status);
              return (
                <Link
                  key={eq.id}
                  href={`/dashboard/equipment/${eq.id}`}
                  className="group block rounded-3xl border border-line bg-bg-elev/60 backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-fg/20 hover:-translate-y-0.5"
                >
                  <div className="relative aspect-[4/3] bg-fg/5 overflow-hidden">
                    {eq.images[0]?.url && (
                      <Image src={eq.images[0].url} alt={eq.nameAr} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    )}
                    <div className="absolute end-3 top-3">
                      <Badge tone={lbl.tone}>{lbl.ar}</Badge>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold leading-tight mb-1 line-clamp-1">{eq.nameAr}</h3>
                    <div className="text-[12px] text-fg-mute font-mono">{eq.serial}</div>
                    {eq.category && <div className="text-[12px] text-fg-soft mt-1">{eq.category.nameAr}</div>}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
