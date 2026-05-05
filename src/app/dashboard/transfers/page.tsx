import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { TransferRow } from "@/components/dashboard/transfer-row";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function TransfersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  const baseInclude = {
    equipment: { select: { id: true, name: true, nameAr: true, serial: true, images: { where: { isPrimary: true }, take: 1 } } },
    sender: { select: { id: true, name: true, nameAr: true, avatarUrl: true } },
    receiver: { select: { id: true, name: true, nameAr: true, avatarUrl: true } },
  };

  const [outgoing, history] = await Promise.all([
    prisma.transfer.findMany({
      where: { senderId: userId, status: "PENDING" },
      orderBy: { initiatedAt: "desc" },
      include: baseInclude,
    }),
    prisma.transfer.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
        status: { in: ["CONFIRMED", "REJECTED", "CANCELLED"] },
      },
      orderBy: { initiatedAt: "desc" },
      take: 30,
      include: baseInclude,
    }),
  ]);

  function flat(t: typeof outgoing[number]) {
    return {
      id: t.id,
      status: t.status,
      initiatedAt: t.initiatedAt,
      message: t.message,
      expectedReturn: t.expectedReturn,
      equipment: {
        id: t.equipment.id,
        nameAr: t.equipment.nameAr,
        name: t.equipment.name,
        serial: t.equipment.serial,
        image: t.equipment.images[0]?.url ?? null,
      },
      sender: t.sender,
      receiver: t.receiver,
    };
  }

  return (
    <div className="space-y-10 max-w-5xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{t.dashboard.sections.transfers}</h1>
          <p className="text-fg-soft mt-2">طلباتك الصادرة وسجلّ التحويلات السابقة.</p>
        </div>
        <Button asChild variant="accent">
          <Link href="/dashboard/transfers/new">
            <Plus size={16} weight="bold" />
            {t.dashboard.actions.newTransfer}
          </Link>
        </Button>
      </div>

      <section>
        <h2 className="text-lg font-semibold tracking-tight mb-4">{t.dashboard.outboxTitle}</h2>
        {outgoing.length === 0 ? (
          <p className="text-fg-mute text-sm rounded-3xl border border-dashed border-line bg-bg-elev/40 p-10 text-center">
            لا طلبات صادرة بانتظار التأكيد.
          </p>
        ) : (
          <ul className="space-y-3">
            {outgoing.map((tr) => (
              <TransferRow key={tr.id} transfer={flat(tr)} perspective="outgoing" currentUserId={userId} isAdmin={isAdmin} />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold tracking-tight mb-4">{t.dashboard.historyTitle}</h2>
        {history.length === 0 ? (
          <p className="text-fg-mute text-sm rounded-3xl border border-dashed border-line bg-bg-elev/40 p-10 text-center">
            لا سجل تحويلات بعد.
          </p>
        ) : (
          <ul className="space-y-3">
            {history.map((tr) => (
              <TransferRow key={tr.id} transfer={flat(tr)} perspective="history" currentUserId={userId} isAdmin={isAdmin} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
