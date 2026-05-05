import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/debug?token=<DEBUG_TOKEN>
// Returns counts only — never password hashes.
// Disable by removing DEBUG_TOKEN from env, or set to a strong random string.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const expected = process.env.DEBUG_TOKEN;

  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "DEBUG_TOKEN not configured" },
      { status: 503 }
    );
  }
  if (token !== expected) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const [userCount, adminCount, equipmentCount, transferCount] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.equipment.count(),
      prisma.transfer.count(),
    ]);

    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true, email: true, username: true, active: true, createdAt: true },
      take: 5,
    });

    return NextResponse.json({
      ok: true,
      seeded: userCount > 0,
      counts: { users: userCount, admins: adminCount, equipment: equipmentCount, transfers: transferCount },
      admins,
      env: {
        AUTH_URL: process.env.AUTH_URL ?? null,
        NODE_ENV: process.env.NODE_ENV ?? null,
        hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
        hasAuthSecret: Boolean(process.env.AUTH_SECRET),
        runSeed: process.env.RUN_SEED ?? null,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
