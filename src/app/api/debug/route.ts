import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET /api/debug?token=<DEBUG_TOKEN>
// Returns counts only — never password hashes.
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

  const env = {
    AUTH_URL: process.env.AUTH_URL ?? null,
    NODE_ENV: process.env.NODE_ENV ?? null,
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasAuthSecret: Boolean(process.env.AUTH_SECRET),
    runSeed: process.env.RUN_SEED ?? null,
    adminEmail: process.env.ADMIN_EMAIL ?? null,
    adminUsername: process.env.ADMIN_USERNAME ?? null,
    adminNameLength: (process.env.ADMIN_NAME ?? "").length,
    adminPasswordLength: (process.env.ADMIN_PASSWORD ?? "").length,
  };

  // Test 1: raw DB connectivity
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        stage: "db-connection",
        error: err instanceof Error ? err.message : String(err),
        env,
      },
      { status: 500 }
    );
  }

  // Test 2: schema exists
  try {
    const userCount = await prisma.user.count();
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    const equipmentCount = await prisma.equipment.count();
    const transferCount = await prisma.transfer.count();

    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true, email: true, username: true, active: true, createdAt: true },
      take: 5,
    });

    const allUsers = await prisma.user.findMany({
      select: { email: true, username: true, role: true, active: true },
      take: 10,
    });

    return NextResponse.json({
      ok: true,
      stage: "ok",
      seeded: userCount > 0,
      hasAdmin: adminCount > 0,
      counts: { users: userCount, admins: adminCount, equipment: equipmentCount, transfers: transferCount },
      admins,
      allUsers,
      env,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        stage: "schema-or-query",
        error: err instanceof Error ? err.message : String(err),
        hint: "Likely the schema wasn't pushed. Check Coolify deploy logs for 'prisma db push' output.",
        env,
      },
      { status: 500 }
    );
  }
}
