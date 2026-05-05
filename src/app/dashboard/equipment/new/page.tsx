import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EquipmentForm } from "@/components/dashboard/equipment-form";
import { t } from "@/lib/i18n";

export default async function NewEquipmentPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const [categories, members] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-8 max-w-3xl mx-auto w-full">
      <Link href="/dashboard/equipment" className="inline-flex items-center gap-2 text-fg-soft hover:text-fg text-sm">
        <ArrowLeft size={16} weight="bold" className="rtl:scale-x-[-1]" />
        {t.dashboard.actions.back}
      </Link>
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{t.dashboard.actions.newEquipment}</h1>
        <p className="text-fg-soft mt-2">سجّل قطعة جديدة بصورتها وبيانها وحدّد المسؤول الحالي عنها.</p>
      </div>

      <div className="bezel">
        <div className="bezel-inner p-6 md:p-8">
          <EquipmentForm categories={categories} members={members} mode="create" />
        </div>
      </div>
    </div>
  );
}
