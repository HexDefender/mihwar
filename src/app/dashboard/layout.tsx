import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { MobileTabBar } from "@/components/dashboard/mobile-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const pendingInbox = await prisma.transfer.count({
    where: { receiverId: session.user.id, status: "PENDING" },
  });

  return (
    <div className="flex min-h-[100dvh]">
      <DashboardSidebar role={session.user.role} pendingInbox={pendingInbox} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          name={session.user.name}
          nameAr={session.user.nameAr}
          role={session.user.role}
          avatarUrl={session.user.image}
        />
        <main className="flex-1 px-4 lg:px-8 pb-32 lg:pb-12 pt-6">{children}</main>
        <MobileTabBar pendingInbox={pendingInbox} />
      </div>
    </div>
  );
}
