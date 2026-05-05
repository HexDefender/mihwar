"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { AuditAction, EquipmentCondition, EquipmentStatus } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  if (session.user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return session.user;
}

const equipmentSchema = z.object({
  serial: z.string().min(2),
  name: z.string().min(1),
  nameAr: z.string().min(1),
  brand: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  descriptionAr: z.string().optional().nullable(),
  status: z.nativeEnum(EquipmentStatus).default(EquipmentStatus.AVAILABLE),
  condition: z.nativeEnum(EquipmentCondition).default(EquipmentCondition.EXCELLENT),
  categoryId: z.string().optional().nullable(),
  ownerId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  imageUrls: z.array(z.string().url()).optional().default([]),
});

export async function createEquipment(formData: FormData) {
  const user = await requireAdmin();

  const imageUrls = formData
    .getAll("imageUrls")
    .map((v) => String(v).trim())
    .filter(Boolean);

  const parsed = equipmentSchema.parse({
    serial: formData.get("serial"),
    name: formData.get("name"),
    nameAr: formData.get("nameAr"),
    brand: formData.get("brand") || null,
    model: formData.get("model") || null,
    description: formData.get("description") || null,
    descriptionAr: formData.get("descriptionAr") || null,
    status: formData.get("status") || EquipmentStatus.AVAILABLE,
    condition: formData.get("condition") || EquipmentCondition.EXCELLENT,
    categoryId: formData.get("categoryId") || null,
    ownerId: formData.get("ownerId") || null,
    notes: formData.get("notes") || null,
    imageUrls,
  });

  const { imageUrls: imgs, ...data } = parsed;

  const eq = await prisma.equipment.create({
    data: {
      ...data,
      images: {
        create: imgs.map((url, i) => ({
          url,
          isPrimary: i === 0,
          position: i,
        })),
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: AuditAction.EQUIPMENT_CREATE,
      entityType: "Equipment",
      entityId: eq.id,
      metadata: { name: eq.name },
    },
  });

  revalidatePath("/dashboard/equipment");
  revalidatePath("/dashboard");
  redirect(`/dashboard/equipment/${eq.id}`);
}

const updateSchema = equipmentSchema.partial().extend({ id: z.string() });

export async function updateEquipment(formData: FormData) {
  const user = await requireAdmin();
  const id = String(formData.get("id"));
  const imageUrls = formData
    .getAll("imageUrls")
    .map((v) => String(v).trim())
    .filter(Boolean);

  const parsed = updateSchema.parse({
    id,
    serial: formData.get("serial") || undefined,
    name: formData.get("name") || undefined,
    nameAr: formData.get("nameAr") || undefined,
    brand: formData.get("brand") ?? undefined,
    model: formData.get("model") ?? undefined,
    description: formData.get("description") ?? undefined,
    descriptionAr: formData.get("descriptionAr") ?? undefined,
    status: formData.get("status") || undefined,
    condition: formData.get("condition") || undefined,
    categoryId: formData.get("categoryId") ?? undefined,
    ownerId: formData.get("ownerId") ?? undefined,
    notes: formData.get("notes") ?? undefined,
    imageUrls,
  });

  const { id: eqId, imageUrls: imgs, ...data } = parsed;

  await prisma.equipment.update({
    where: { id: eqId },
    data,
  });

  if (imgs && imgs.length > 0) {
    await prisma.equipmentImage.deleteMany({ where: { equipmentId: eqId } });
    await prisma.equipmentImage.createMany({
      data: imgs.map((url, i) => ({
        equipmentId: eqId,
        url,
        isPrimary: i === 0,
        position: i,
      })),
    });
  }

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: AuditAction.EQUIPMENT_UPDATE,
      entityType: "Equipment",
      entityId: eqId,
    },
  });

  revalidatePath("/dashboard/equipment");
  revalidatePath(`/dashboard/equipment/${eqId}`);
}

export async function deleteEquipment(formData: FormData) {
  const user = await requireAdmin();
  const id = String(formData.get("id"));

  await prisma.equipment.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: AuditAction.EQUIPMENT_DELETE,
      entityType: "Equipment",
      entityId: id,
    },
  });

  revalidatePath("/dashboard/equipment");
  redirect("/dashboard/equipment");
}
