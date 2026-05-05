import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TransferRow } from "@/components/dashboard/transfer-row";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id;

  const inbox = await prisma.transfer.findMany({
    where: { receiverId: userId, status: "PENDING" },
    orderBy: { initiatedAt: "desc" },
    include: {
      equipment: { select: { id: true, name: true, nameAr: true, serial: true, images: { where: { isPrimary: true }, take: 1 } } },
      sender: { select: { id: true, name: true, nameAr: true, avatarUrl: true } },
      receiver: { select: { id: true, name: true, nameAr: true, avatarUrl: true } },
    },
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto w-full">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-bg-elev/70 backdrop-blur-md px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-fg-soft mb-3">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          {inbox.length > 0 ? `${inbox.length} طلب جديد` : "صندوق الوارد"}
        </span>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">{t.dashboard.inboxTitle}</h1>
      </div>

      {inbox.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line bg-bg-elev/40 p-16 text-center text-fg-mute">
          {t.dashboard.empty.inbox}
        </div>
      ) : (
        <ul className="space-y-3">
          {inbox.map((tr) => (
            <TransferRow
              key={tr.id}
              transfer={{
                id: tr.id,
                status: tr.status,
                initiatedAt: tr.initiatedAt,
                message: tr.message,
                expectedReturn: tr.expectedReturn,
                equipment: {
                  id: tr.equipment.id,
                  nameAr: tr.equipment.nameAr,
                  name: tr.equipment.name,
                  serial: tr.equipment.serial,
                  image: tr.equipment.images[0]?.url ?? null,
                },
                sender: tr.sender,
                receiver: tr.receiver,
              }}
              perspective="incoming"
              currentUserId={userId}
              isAdmin={session.user.role === "ADMIN"}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
