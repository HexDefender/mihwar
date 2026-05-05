import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, PaperPlaneTilt, PencilSimple, Trash } from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TransferDialog } from "@/components/dashboard/transfer-dialog";
import { deleteEquipment } from "@/actions/equipment";
import { t } from "@/lib/i18n";
import { formatRelativeTime, statusLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { id } = await params;

  const eq = await prisma.equipment.findUnique({
    where: { id },
    include: {
      images: { orderBy: { position: "asc" } },
      owner: { select: { id: true, name: true, nameAr: true, position: true, positionAr: true, avatarUrl: true } },
      category: true,
      transfers: {
        orderBy: { initiatedAt: "desc" },
        take: 8,
        include: {
          sender: { select: { id: true, name: true, nameAr: true } },
          receiver: { select: { id: true, name: true, nameAr: true } },
        },
      },
    },
  });

  if (!eq) notFound();

  const allMembers = await prisma.user.findMany({
    where: { active: true, NOT: { id: session.user.id } },
    orderBy: { name: "asc" },
    select: { id: true, name: true, nameAr: true, position: true, positionAr: true, avatarUrl: true },
  });

  const isAdmin = session.user.role === "ADMIN";
  const isOwner = eq.ownerId === session.user.id;
  const canSend = (isAdmin || isOwner) && (eq.status === "AVAILABLE" || eq.status === "IN_USE");

  const lbl = statusLabel(eq.status);
  const condLbl = statusLabel(eq.condition);

  return (
    <div className="space-y-8 max-w-6xl mx-auto w-full">
      <Link href="/dashboard/equipment" className="inline-flex items-center gap-2 text-fg-soft hover:text-fg text-sm">
        <ArrowLeft size={16} weight="bold" className="rtl:scale-x-[-1]" />
        {t.dashboard.actions.back}
      </Link>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="bezel">
            <div className="bezel-inner overflow-hidden">
              <div className="relative aspect-[4/3] bg-fg/5">
                {eq.images[0]?.url ? (
                  <Image src={eq.images[0].url} alt={eq.nameAr} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-fg-mute">— لا صورة —</div>
                )}
                <div className="absolute inset-x-4 top-4 flex justify-between">
                  <Badge tone={lbl.tone}>{lbl.ar}</Badge>
                  {eq.category && <Badge tone="muted" className="bg-bg/80 backdrop-blur-md">{eq.category.nameAr}</Badge>}
                </div>
              </div>
              {eq.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 p-2">
                  {eq.images.slice(1).map((img) => (
                    <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden border border-line">
                      <Image src={img.url} alt={img.alt ?? eq.nameAr} fill sizes="120px" className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div>
            <p className="text-[12px] uppercase tracking-[0.22em] text-fg-mute font-mono mb-2">{eq.serial}</p>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight">{eq.nameAr}</h1>
            <p className="text-fg-soft mt-2">{eq.name}{eq.brand ? ` · ${eq.brand}` : ""}{eq.model ? ` · ${eq.model}` : ""}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-line bg-bg-elev/60 backdrop-blur-md p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-fg-mute font-mono">{t.dashboard.fields.condition}</p>
              <p className="mt-1 font-medium">{condLbl.ar}</p>
            </div>
            <div className="rounded-2xl border border-line bg-bg-elev/60 backdrop-blur-md p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-fg-mute font-mono">{t.dashboard.fields.status}</p>
              <p className="mt-1 font-medium">{lbl.ar}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-bg-elev/60 backdrop-blur-md p-5">
            <p className="text-[11px] uppercase tracking-[0.2em] text-fg-mute font-mono mb-3">{t.dashboard.fields.owner}</p>
            {eq.owner ? (
              <div className="flex items-center gap-3">
                <Avatar>
                  {eq.owner.avatarUrl && <AvatarImage src={eq.owner.avatarUrl} alt={eq.owner.name} />}
                  <AvatarFallback name={eq.owner.nameAr || eq.owner.name} />
                </Avatar>
                <div>
                  <p className="font-medium">{eq.owner.nameAr || eq.owner.name}</p>
                  <p className="text-[12px] text-fg-mute">{eq.owner.positionAr || eq.owner.position || "—"}</p>
                </div>
              </div>
            ) : (
              <p className="text-fg-mute">— غير معيّن —</p>
            )}
          </div>

          {(eq.descriptionAr || eq.description) && (
            <div className="rounded-2xl border border-line bg-bg-elev/60 backdrop-blur-md p-5">
              <p className="text-[11px] uppercase tracking-[0.2em] text-fg-mute font-mono mb-2">{t.dashboard.fields.description}</p>
              {eq.descriptionAr && <p className="text-[15px] leading-relaxed">{eq.descriptionAr}</p>}
              {eq.description && (
                <p className="text-[14px] leading-relaxed text-fg-soft mt-2" dir="ltr">{eq.description}</p>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {canSend && (
              <TransferDialog
                equipment={{ id: eq.id, name: eq.name, nameAr: eq.nameAr, image: eq.images[0]?.url ?? null }}
                members={allMembers}
                triggerLabel={t.dashboard.actions.send}
                triggerVariant="accent"
                triggerIcon={<PaperPlaneTilt size={16} weight="bold" className="rtl:scale-x-[-1]" />}
              />
            )}
            {isAdmin && (
              <>
                <Button asChild variant="outline">
                  <Link href={`/dashboard/equipment/${eq.id}/edit`}>
                    <PencilSimple size={16} weight="bold" />
                    {t.dashboard.actions.edit}
                  </Link>
                </Button>
                <form
                  action={deleteEquipment}
                  onSubmit={(e) => {
                    if (!confirm(`حذف ${eq.nameAr}؟ لا يمكن التراجع.`)) e.preventDefault();
                  }}
                >
                  <input type="hidden" name="id" value={eq.id} />
                  <Button type="submit" variant="danger">
                    <Trash size={16} weight="bold" />
                    {t.dashboard.actions.delete}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-4">سجلّ الحضانة</h2>
        {eq.transfers.length === 0 ? (
          <p className="text-fg-mute">لا تحويلات لهذه القطعة بعد.</p>
        ) : (
          <ol className="relative space-y-4 ps-6 border-s border-line">
            {eq.transfers.map((tr) => {
              const lblTr = statusLabel(tr.status);
              return (
                <li key={tr.id} className="relative">
                  <span className="absolute -start-[28px] top-3 h-3 w-3 rounded-full bg-accent ring-4 ring-bg" />
                  <div className="rounded-2xl border border-line bg-bg-elev/60 backdrop-blur-md p-4 flex items-center justify-between gap-4">
                    <div className="text-sm">
                      <p>
                        <span className="font-medium">{tr.sender.nameAr || tr.sender.name}</span>
                        <span className="text-fg-mute"> → </span>
                        <span className="font-medium">{tr.receiver.nameAr || tr.receiver.name}</span>
                      </p>
                      <p className="text-[12px] text-fg-mute mt-1">{formatRelativeTime(tr.initiatedAt)}</p>
                      {tr.message && <p className="text-[13px] text-fg-soft mt-2 max-w-md">"{tr.message}"</p>}
                    </div>
                    <Badge tone={lblTr.tone}>{lblTr.ar}</Badge>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
