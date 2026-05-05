import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EquipmentForm } from "@/components/dashboard/equipment-form";
import { t } from "@/lib/i18n";

export default async function EditEquipmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const { id } = await params;
  const [eq, categories, members] = await Promise.all([
    prisma.equipment.findUnique({
      where: { id },
      include: { images: { orderBy: { position: "asc" } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  if (!eq) notFound();

  return (
    <div className="space-y-8 max-w-3xl mx-auto w-full">
      <Link href={`/dashboard/equipment/${id}`} className="inline-flex items-center gap-2 text-fg-soft hover:text-fg text-sm">
        <ArrowLeft size={16} weight="bold" className="rtl:scale-x-[-1]" />
        {t.dashboard.actions.back}
      </Link>
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">تعديل: {eq.nameAr}</h1>
        <p className="text-fg-soft mt-2 font-mono text-sm">{eq.serial}</p>
      </div>
      <div className="bezel">
        <div className="bezel-inner p-6 md:p-8">
          <EquipmentForm categories={categories} members={members} mode="update" initial={eq} />
        </div>
      </div>
    </div>
  );
}
