import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, FloppyDisk, Trash } from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateMember, deleteMember } from "@/actions/members";
import { ConfirmForm } from "@/components/dashboard/confirm-form";
import { statusLabel } from "@/lib/utils";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");
  const { id } = await params;

  const m = await prisma.user.findUnique({
    where: { id },
    include: {
      ownedEquipment: {
        orderBy: { updatedAt: "desc" },
        include: { images: { where: { isPrimary: true }, take: 1 } },
      },
    },
  });
  if (!m) notFound();

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full">
      <Link href="/dashboard/members" className="inline-flex items-center gap-2 text-fg-soft hover:text-fg text-sm">
        <ArrowLeft size={16} weight="bold" className="rtl:scale-x-[-1]" />
        {t.dashboard.actions.back}
      </Link>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="bezel">
            <div className="bezel-inner p-7 md:p-8">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-20 w-20">
                  {m.avatarUrl && <AvatarImage src={m.avatarUrl} alt={m.name} />}
                  <AvatarFallback name={m.nameAr || m.name} className="text-lg" />
                </Avatar>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight leading-tight">{m.nameAr || m.name}</h1>
                  <p className="text-fg-soft text-sm">{m.positionAr || m.position || "—"}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge tone={m.role === "ADMIN" ? "accent" : "info"}>{m.role === "ADMIN" ? "مدير" : "عضو"}</Badge>
                    {!m.active && <Badge tone="muted">معطّل</Badge>}
                  </div>
                </div>
              </div>

              <form action={updateMember} className="grid gap-4">
                <input type="hidden" name="id" value={m.id} />
                <div>
                  <Label htmlFor={`name-${m.id}`}>{t.dashboard.fields.name}</Label>
                  <Input id={`name-${m.id}`} name="name" defaultValue={m.name} />
                </div>
                <div>
                  <Label htmlFor={`nameAr-${m.id}`}>{t.dashboard.fields.nameAr}</Label>
                  <Input id={`nameAr-${m.id}`} name="nameAr" defaultValue={m.nameAr ?? ""} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`position-${m.id}`}>{t.dashboard.fields.position}</Label>
                    <Input id={`position-${m.id}`} name="position" defaultValue={m.position ?? ""} />
                  </div>
                  <div>
                    <Label htmlFor={`positionAr-${m.id}`}>{t.dashboard.fields.positionAr}</Label>
                    <Input id={`positionAr-${m.id}`} name="positionAr" defaultValue={m.positionAr ?? ""} />
                  </div>
                </div>
                <div>
                  <Label htmlFor={`phone-${m.id}`}>{t.dashboard.fields.phone}</Label>
                  <Input id={`phone-${m.id}`} name="phone" defaultValue={m.phone ?? ""} dir="ltr" />
                </div>
                <div>
                  <Label htmlFor={`avatar-${m.id}`}>{t.dashboard.fields.avatar}</Label>
                  <Input id={`avatar-${m.id}`} name="avatarUrl" defaultValue={m.avatarUrl ?? ""} dir="ltr" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`role-${m.id}`}>{t.dashboard.fields.role}</Label>
                    <select
                      id={`role-${m.id}`}
                      name="role"
                      defaultValue={m.role}
                      className="focus-ring h-12 w-full rounded-2xl border border-line bg-bg-elev/60 px-4 text-sm"
                    >
                      <option value="MEMBER">عضو</option>
                      <option value="ADMIN">مدير</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor={`active-${m.id}`}>الحساب</Label>
                    <select
                      id={`active-${m.id}`}
                      name="active"
                      defaultValue={String(m.active)}
                      className="focus-ring h-12 w-full rounded-2xl border border-line bg-bg-elev/60 px-4 text-sm"
                    >
                      <option value="true">مفعّل</option>
                      <option value="false">معطّل</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor={`pwd-${m.id}`}>{t.dashboard.fields.newPassword}</Label>
                  <Input id={`pwd-${m.id}`} name="newPassword" type="password" placeholder="اتركه فارغاً للإبقاء" dir="ltr" />
                </div>
                <div className="flex justify-between mt-2">
                  <Button type="submit" variant="accent">
                    <FloppyDisk size={16} weight="bold" />
                    {t.dashboard.actions.saveChanges}
                  </Button>
                </div>
              </form>

              {m.id !== session.user.id && (
                <ConfirmForm
                  action={deleteMember}
                  message={`حذف ${m.nameAr || m.name}؟ لا يمكن التراجع.`}
                  className="mt-6 pt-6 border-t border-line-soft"
                >
                  <input type="hidden" name="id" value={m.id} />
                  <Button type="submit" variant="danger" size="sm">
                    <Trash size={14} weight="bold" />
                    حذف العضو
                  </Button>
                </ConfirmForm>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <h2 className="text-lg font-semibold tracking-tight mb-4">في عُهدته ({m.ownedEquipment.length})</h2>
          {m.ownedEquipment.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-line bg-bg-elev/40 p-10 text-center text-fg-mute text-sm">
              لا توجد قطع في عُهدة هذا العضو حالياً.
            </div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {m.ownedEquipment.map((eq) => {
                const lbl = statusLabel(eq.status);
                return (
                  <li key={eq.id}>
                    <Link
                      href={`/dashboard/equipment/${eq.id}`}
                      className="flex items-center gap-3 rounded-2xl border border-line bg-bg-elev/60 backdrop-blur-md p-3 hover:border-fg/20 transition-colors"
                    >
                      <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-fg/5 border border-line shrink-0">
                        {eq.images[0]?.url && (
                          <Image src={eq.images[0].url} alt={eq.nameAr} fill sizes="56px" className="object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{eq.nameAr}</p>
                        <p className="text-[11px] text-fg-mute font-mono">{eq.serial}</p>
                      </div>
                      <Badge tone={lbl.tone}>{lbl.ar}</Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
