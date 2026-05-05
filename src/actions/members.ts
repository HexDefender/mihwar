"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { AuditAction, Role } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  if (session.user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return session.user;
}

const memberSchema = z.object({
  email: z.string().email(),
  username: z.string().min(2).regex(/^[a-zA-Z0-9._-]+$/),
  name: z.string().min(2),
  nameAr: z.string().optional().nullable(),
  password: z.string().min(8),
  phone: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  positionAr: z.string().optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  role: z.nativeEnum(Role).default(Role.MEMBER),
});

export async function createMember(formData: FormData) {
  const user = await requireAdmin();

  const parsed = memberSchema.parse({
    email: String(formData.get("email")).toLowerCase(),
    username: formData.get("username"),
    name: formData.get("name"),
    nameAr: formData.get("nameAr") || null,
    password: formData.get("password"),
    phone: formData.get("phone") || null,
    position: formData.get("position") || null,
    positionAr: formData.get("positionAr") || null,
    avatarUrl: formData.get("avatarUrl") || null,
    role: (formData.get("role") as Role) || Role.MEMBER,
  });

  const passwordHash = await bcrypt.hash(parsed.password, 12);

  const created = await prisma.user.create({
    data: {
      email: parsed.email,
      username: parsed.username,
      name: parsed.name,
      nameAr: parsed.nameAr,
      passwordHash,
      phone: parsed.phone,
      position: parsed.position,
      positionAr: parsed.positionAr,
      avatarUrl: parsed.avatarUrl,
      role: parsed.role,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: AuditAction.USER_CREATE,
      entityType: "User",
      entityId: created.id,
      metadata: { name: created.name },
    },
  });

  revalidatePath("/dashboard/members");
  redirect("/dashboard/members");
}

const updateMemberSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  nameAr: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  positionAr: z.string().optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  role: z.nativeEnum(Role).optional(),
  active: z.boolean().optional(),
  newPassword: z.string().min(8).optional().or(z.literal("")),
});

export async function updateMember(formData: FormData) {
  const user = await requireAdmin();
  const id = String(formData.get("id"));

  const parsed = updateMemberSchema.parse({
    id,
    name: formData.get("name") || undefined,
    nameAr: formData.get("nameAr") || null,
    phone: formData.get("phone") || null,
    position: formData.get("position") || null,
    positionAr: formData.get("positionAr") || null,
    avatarUrl: formData.get("avatarUrl") || null,
    role: (formData.get("role") as Role) || undefined,
    active: formData.get("active") === "true" ? true : formData.get("active") === "false" ? false : undefined,
    newPassword: (formData.get("newPassword") as string) || undefined,
  });

  const data: Record<string, unknown> = {
    name: parsed.name,
    nameAr: parsed.nameAr,
    phone: parsed.phone,
    position: parsed.position,
    positionAr: parsed.positionAr,
    avatarUrl: parsed.avatarUrl,
    role: parsed.role,
    active: parsed.active,
  };
  if (parsed.newPassword && parsed.newPassword.length >= 8) {
    data.passwordHash = await bcrypt.hash(parsed.newPassword, 12);
  }

  await prisma.user.update({ where: { id }, data });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: AuditAction.USER_UPDATE,
      entityType: "User",
      entityId: id,
    },
  });

  revalidatePath("/dashboard/members");
  revalidatePath(`/dashboard/members/${id}`);
}

export async function deleteMember(formData: FormData) {
  const user = await requireAdmin();
  const id = String(formData.get("id"));
  if (id === user.id) throw new Error("CANNOT_DELETE_SELF");
  await prisma.user.delete({ where: { id } });
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: AuditAction.USER_DELETE,
      entityType: "User",
      entityId: id,
    },
  });
  revalidatePath("/dashboard/members");
  redirect("/dashboard/members");
}
