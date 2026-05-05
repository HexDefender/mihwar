import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateMember } from "@/actions/members";
import { ThemeToggle } from "@/components/theme-toggle";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const me = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!me) redirect("/login");

  return (
    <div className="space-y-10 max-w-3xl mx-auto w-full">
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{t.dashboard.sections.settings}</h1>
        <p className="text-fg-soft mt-2">حدّث بياناتك الشخصية وكلمة المرور.</p>
      </div>

      <div className="bezel">
        <div className="bezel-inner p-7 md:p-8">
          <div className="flex items-center gap-4 mb-7">
            <Avatar className="h-16 w-16">
              {me.avatarUrl && <AvatarImage src={me.avatarUrl} alt={me.name} />}
              <AvatarFallback name={me.nameAr || me.name} />
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold tracking-tight">{me.nameAr || me.name}</h2>
              <p className="text-[12px] text-fg-mute font-mono">{me.email}</p>
              <Badge tone={me.role === "ADMIN" ? "accent" : "info"} className="mt-2">
                {me.role === "ADMIN" ? "مدير" : "عضو"}
              </Badge>
            </div>
          </div>

          <form action={updateMember} className="grid gap-5">
            <input type="hidden" name="id" value={me.id} />
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <Label htmlFor="name">{t.dashboard.fields.name}</Label>
                <Input id="name" name="name" defaultValue={me.name} />
              </div>
              <div>
                <Label htmlFor="nameAr">{t.dashboard.fields.nameAr}</Label>
                <Input id="nameAr" name="nameAr" defaultValue={me.nameAr ?? ""} />
              </div>
              <div>
                <Label htmlFor="position">{t.dashboard.fields.position}</Label>
                <Input id="position" name="position" defaultValue={me.position ?? ""} />
              </div>
              <div>
                <Label htmlFor="positionAr">{t.dashboard.fields.positionAr}</Label>
                <Input id="positionAr" name="positionAr" defaultValue={me.positionAr ?? ""} />
              </div>
              <div>
                <Label htmlFor="phone">{t.dashboard.fields.phone}</Label>
                <Input id="phone" name="phone" defaultValue={me.phone ?? ""} dir="ltr" />
              </div>
              <div>
                <Label htmlFor="avatarUrl">{t.dashboard.fields.avatar}</Label>
                <Input id="avatarUrl" name="avatarUrl" defaultValue={me.avatarUrl ?? ""} dir="ltr" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="newPassword">{t.dashboard.fields.newPassword}</Label>
                <Input id="newPassword" name="newPassword" type="password" placeholder="اتركه فارغاً للإبقاء" dir="ltr" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" variant="accent">{t.dashboard.actions.saveChanges}</Button>
            </div>
          </form>
        </div>
      </div>

      <div className="rounded-3xl border border-line bg-bg-elev/60 backdrop-blur-md p-6 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">المظهر</h3>
          <p className="text-sm text-fg-soft mt-1">تبديل بين الوضع الداكن والنهاري.</p>
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
}
