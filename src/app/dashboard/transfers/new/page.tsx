import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ArrowLeft, PaperPlaneTilt } from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { TransferDialog } from "@/components/dashboard/transfer-dialog";
import { statusLabel } from "@/lib/utils";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function NewTransferPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const isAdmin = session.user.role === "ADMIN";

  const where = isAdmin ? {} : { ownerId: session.user.id };

  const [equipment, members] = await Promise.all([
    prisma.equipment.findMany({
      where: {
        ...where,
        status: { in: ["AVAILABLE", "IN_USE"] },
      },
      orderBy: { updatedAt: "desc" },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        owner: { select: { id: true, name: true, nameAr: true } },
      },
    }),
    prisma.user.findMany({
      where: { active: true, NOT: { id: session.user.id } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, nameAr: true, position: true, positionAr: true, avatarUrl: true },
    }),
  ]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full">
      <Link href="/dashboard/transfers" className="inline-flex items-center gap-2 text-fg-soft hover:text-fg text-sm">
        <ArrowLeft size={16} weight="bold" className="rtl:scale-x-[-1]" />
        {t.dashboard.actions.back}
      </Link>

      <div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{t.dashboard.actions.newTransfer}</h1>
        <p className="text-fg-soft mt-2">اختر القطعة التي تريد تحويلها {isAdmin ? "" : "من عُهدتك "}إلى زميل.</p>
      </div>

      {equipment.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line bg-bg-elev/40 p-16 text-center text-fg-mute">
          {isAdmin
            ? "لا توجد قطع متاحة للتحويل."
            : "لا توجد قطع في عُهدتك حالياً يمكن تحويلها."}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {equipment.map((eq) => {
            const lbl = statusLabel(eq.status);
            return (
              <div
                key={eq.id}
                className="rounded-3xl border border-line bg-bg-elev/60 backdrop-blur-md overflow-hidden flex flex-col"
              >
                <div className="relative aspect-[4/3] bg-fg/5 overflow-hidden">
                  {eq.images[0]?.url && (
                    <Image src={eq.images[0].url} alt={eq.nameAr} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                  )}
                  <div className="absolute end-3 top-3">
                    <Badge tone={lbl.tone}>{lbl.ar}</Badge>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-semibold leading-tight line-clamp-1">{eq.nameAr}</h3>
                  <p className="text-[12px] text-fg-mute font-mono">{eq.serial}</p>
                  {eq.owner && (
                    <p className="text-[12px] text-fg-soft mt-1">
                      {eq.owner.nameAr || eq.owner.name}
                    </p>
                  )}
                  <div className="mt-auto pt-4">
                    <TransferDialog
                      equipment={{ id: eq.id, name: eq.name, nameAr: eq.nameAr, image: eq.images[0]?.url ?? null }}
                      members={members}
                      triggerLabel={t.dashboard.actions.send}
                      triggerVariant="accent"
                      triggerIcon={<PaperPlaneTilt size={16} weight="bold" className="rtl:scale-x-[-1]" />}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
