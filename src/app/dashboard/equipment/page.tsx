import Link from "next/link";
import Image from "next/image";
import { Plus, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { t } from "@/lib/i18n";
import { statusLabel } from "@/lib/utils";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type SP = Promise<{ q?: string; status?: string; cat?: string }>;

export default async function EquipmentListPage({ searchParams }: { searchParams: SP }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const sp = await searchParams;
  const isAdmin = session.user.role === "ADMIN";

  const where: Record<string, unknown> = {};
  if (sp.q) {
    where.OR = [
      { name: { contains: sp.q, mode: "insensitive" } },
      { nameAr: { contains: sp.q } },
      { serial: { contains: sp.q, mode: "insensitive" } },
      { brand: { contains: sp.q, mode: "insensitive" } },
    ];
  }
  if (sp.status) where.status = sp.status;
  if (sp.cat) where.categoryId = sp.cat;

  const [equipment, categories] = await Promise.all([
    prisma.equipment.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        owner: { select: { id: true, name: true, nameAr: true } },
        category: { select: { name: true, nameAr: true } },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{t.dashboard.sections.equipment}</h1>
          <p className="text-fg-soft mt-2">سجلّ شامل لكلّ قطعة في الفريق، مع حالتها ومسؤولها الحالي.</p>
        </div>
        {isAdmin && (
          <Button asChild variant="accent">
            <Link href="/dashboard/equipment/new">
              <Plus size={16} weight="bold" />
              {t.dashboard.actions.newEquipment}
            </Link>
          </Button>
        )}
      </div>

      <form className="flex flex-col md:flex-row gap-2" action="/dashboard/equipment">
        <div className="relative flex-1">
          <MagnifyingGlass size={16} className="absolute end-4 top-1/2 -translate-y-1/2 text-fg-mute pointer-events-none" />
          <input
            name="q"
            defaultValue={sp.q}
            placeholder="ابحث بالاسم، العلامة، أو الرقم التسلسلي…"
            className="focus-ring h-12 w-full rounded-2xl border border-line bg-bg-elev/60 backdrop-blur-md ps-4 pe-12 text-sm placeholder:text-fg-mute"
          />
        </div>
        <select
          name="status"
          defaultValue={sp.status ?? ""}
          className="focus-ring h-12 rounded-2xl border border-line bg-bg-elev/60 backdrop-blur-md px-4 text-sm"
        >
          <option value="">كلّ الحالات</option>
          <option value="AVAILABLE">متوفّر</option>
          <option value="IN_USE">قيد الاستخدام</option>
          <option value="IN_TRANSIT">قيد التحويل</option>
          <option value="MAINTENANCE">صيانة</option>
        </select>
        <select
          name="cat"
          defaultValue={sp.cat ?? ""}
          className="focus-ring h-12 rounded-2xl border border-line bg-bg-elev/60 backdrop-blur-md px-4 text-sm"
        >
          <option value="">كلّ التصنيفات</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nameAr}
            </option>
          ))}
        </select>
        <Button type="submit" variant="primary" className="md:w-auto">تطبيق</Button>
      </form>

      {equipment.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line bg-bg-elev/40 p-16 text-center">
          <p className="text-fg-mute">{t.dashboard.empty.equipment}</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {equipment.map((eq) => {
            const lbl = statusLabel(eq.status);
            return (
              <Link
                key={eq.id}
                href={`/dashboard/equipment/${eq.id}`}
                className="group block rounded-3xl border border-line bg-bg-elev/60 backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-fg/20 hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]"
              >
                <div className="relative aspect-[4/3] bg-fg/5 overflow-hidden">
                  {eq.images[0]?.url ? (
                    <Image src={eq.images[0].url} alt={eq.nameAr} fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-fg-mute text-xs">— لا صورة —</div>
                  )}
                  <div className="absolute inset-x-3 top-3 flex items-center justify-between">
                    <Badge tone={lbl.tone}>{lbl.ar}</Badge>
                    {eq.category && (
                      <Badge tone="muted" className="bg-bg/80 backdrop-blur-md">{eq.category.nameAr}</Badge>
                    )}
                  </div>
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="font-semibold leading-tight line-clamp-1">{eq.nameAr}</h3>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-mono text-fg-mute">{eq.serial}</span>
                    {eq.owner ? (
                      <span className="text-fg-soft">{eq.owner.nameAr || eq.owner.name}</span>
                    ) : (
                      <span className="text-fg-mute">— غير معيّن —</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
