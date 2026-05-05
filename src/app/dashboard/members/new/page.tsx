import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createMember } from "@/actions/members";
import { t } from "@/lib/i18n";

export default async function NewMemberPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="space-y-8 max-w-2xl mx-auto w-full">
      <Link href="/dashboard/members" className="inline-flex items-center gap-2 text-fg-soft hover:text-fg text-sm">
        <ArrowLeft size={16} weight="bold" className="rtl:scale-x-[-1]" />
        {t.dashboard.actions.back}
      </Link>
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{t.dashboard.actions.newMember}</h1>
        <p className="text-fg-soft mt-2">أنشئ حساب عضو جديد. سيستخدم هذه البيانات لتسجيل الدخول.</p>
      </div>
      <div className="bezel">
        <div className="bezel-inner p-6 md:p-8">
          <form action={createMember} className="grid gap-5 md:grid-cols-2">
            <div>
              <Label htmlFor="name">{t.dashboard.fields.name} *</Label>
              <Input id="name" name="name" required placeholder="Yara Hadidi" />
            </div>
            <div>
              <Label htmlFor="nameAr">{t.dashboard.fields.nameAr}</Label>
              <Input id="nameAr" name="nameAr" placeholder="يارا الحديدي" />
            </div>
            <div>
              <Label htmlFor="email">{t.dashboard.fields.email} *</Label>
              <Input id="email" name="email" type="email" required dir="ltr" placeholder="yara@studio.co" />
            </div>
            <div>
              <Label htmlFor="username">{t.dashboard.fields.username} *</Label>
              <Input id="username" name="username" required dir="ltr" placeholder="yara.shoots" />
            </div>
            <div>
              <Label htmlFor="phone">{t.dashboard.fields.phone}</Label>
              <Input id="phone" name="phone" dir="ltr" placeholder="+966 5x xxx xxxx" />
            </div>
            <div>
              <Label htmlFor="role">{t.dashboard.fields.role}</Label>
              <select
                id="role"
                name="role"
                defaultValue="MEMBER"
                className="focus-ring h-12 w-full rounded-2xl border border-line bg-bg-elev/60 px-4 text-sm"
              >
                <option value="MEMBER">عضو</option>
                <option value="ADMIN">مدير</option>
              </select>
            </div>
            <div>
              <Label htmlFor="position">{t.dashboard.fields.position}</Label>
              <Input id="position" name="position" placeholder="Lead Photographer" />
            </div>
            <div>
              <Label htmlFor="positionAr">{t.dashboard.fields.positionAr}</Label>
              <Input id="positionAr" name="positionAr" placeholder="مصوّرة رئيسية" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="avatarUrl">{t.dashboard.fields.avatar}</Label>
              <Input id="avatarUrl" name="avatarUrl" type="url" dir="ltr" placeholder="https://…" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="password">{t.dashboard.fields.password} * (٨ أحرف فأكثر)</Label>
              <Input id="password" name="password" type="password" required minLength={8} dir="ltr" />
            </div>

            <div className="md:col-span-2 flex justify-end mt-2">
              <Button type="submit" variant="accent" size="lg">
                إضافة العضو
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
