"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { AuditAction, EquipmentStatus, TransferStatus } from "@prisma/client";

async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  return session.user;
}

const initiateSchema = z.object({
  equipmentId: z.string(),
  receiverId: z.string(),
  message: z.string().optional().nullable(),
  expectedReturn: z.string().optional().nullable(),
});

export async function initiateTransfer(formData: FormData) {
  const user = await requireUser();

  const parsed = initiateSchema.parse({
    equipmentId: formData.get("equipmentId"),
    receiverId: formData.get("receiverId"),
    message: formData.get("message") || null,
    expectedReturn: formData.get("expectedReturn") || null,
  });

  if (parsed.receiverId === user.id) {
    throw new Error("CANNOT_SEND_TO_SELF");
  }

  const equipment = await prisma.equipment.findUnique({ where: { id: parsed.equipmentId } });
  if (!equipment) throw new Error("EQUIPMENT_NOT_FOUND");
  if (user.role !== "ADMIN" && equipment.ownerId !== user.id) {
    throw new Error("FORBIDDEN_NOT_OWNER");
  }

  const open = await prisma.transfer.findFirst({
    where: { equipmentId: parsed.equipmentId, status: TransferStatus.PENDING },
  });
  if (open) throw new Error("TRANSFER_ALREADY_PENDING");

  const transfer = await prisma.transfer.create({
    data: {
      equipmentId: parsed.equipmentId,
      senderId: user.id,
      receiverId: parsed.receiverId,
      message: parsed.message,
      expectedReturn: parsed.expectedReturn ? new Date(parsed.expectedReturn) : null,
    },
  });

  await prisma.equipment.update({
    where: { id: parsed.equipmentId },
    data: { status: EquipmentStatus.IN_TRANSIT },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: AuditAction.TRANSFER_INITIATE,
      entityType: "Transfer",
      entityId: transfer.id,
      metadata: { equipmentId: parsed.equipmentId, receiverId: parsed.receiverId },
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transfers");
  revalidatePath("/dashboard/inbox");
  redirect("/dashboard/transfers");
}

const confirmSchema = z.object({
  id: z.string(),
  responseNote: z.string().optional().nullable(),
});

export async function confirmTransfer(formData: FormData) {
  const user = await requireUser();
  const parsed = confirmSchema.parse({
    id: formData.get("id"),
    responseNote: formData.get("responseNote") || null,
  });

  const transfer = await prisma.transfer.findUnique({ where: { id: parsed.id } });
  if (!transfer) throw new Error("NOT_FOUND");
  if (transfer.status !== TransferStatus.PENDING) throw new Error("ALREADY_RESOLVED");
  if (transfer.receiverId !== user.id) throw new Error("FORBIDDEN_NOT_RECEIVER");

  await prisma.$transaction(async (tx) => {
    await tx.transfer.update({
      where: { id: parsed.id },
      data: {
        status: TransferStatus.CONFIRMED,
        confirmedAt: new Date(),
        responseNote: parsed.responseNote,
      },
    });
    await tx.equipment.update({
      where: { id: transfer.equipmentId },
      data: {
        ownerId: transfer.receiverId,
        status: EquipmentStatus.IN_USE,
      },
    });
    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: AuditAction.TRANSFER_CONFIRM,
        entityType: "Transfer",
        entityId: parsed.id,
        metadata: { equipmentId: transfer.equipmentId },
      },
    });
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transfers");
  revalidatePath("/dashboard/inbox");
  revalidatePath("/dashboard/equipment");
}

export async function rejectTransfer(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const responseNote = (formData.get("responseNote") as string) || null;

  const transfer = await prisma.transfer.findUnique({ where: { id } });
  if (!transfer) throw new Error("NOT_FOUND");
  if (transfer.status !== TransferStatus.PENDING) throw new Error("ALREADY_RESOLVED");
  if (transfer.receiverId !== user.id) throw new Error("FORBIDDEN_NOT_RECEIVER");

  await prisma.$transaction(async (tx) => {
    await tx.transfer.update({
      where: { id },
      data: {
        status: TransferStatus.REJECTED,
        rejectedAt: new Date(),
        responseNote,
      },
    });
    const equipment = await tx.equipment.findUnique({ where: { id: transfer.equipmentId } });
    if (equipment && equipment.status === EquipmentStatus.IN_TRANSIT) {
      await tx.equipment.update({
        where: { id: transfer.equipmentId },
        data: {
          status: equipment.ownerId ? EquipmentStatus.IN_USE : EquipmentStatus.AVAILABLE,
        },
      });
    }
    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: AuditAction.TRANSFER_REJECT,
        entityType: "Transfer",
        entityId: id,
      },
    });
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transfers");
  revalidatePath("/dashboard/inbox");
}

export async function cancelTransfer(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));

  const transfer = await prisma.transfer.findUnique({ where: { id } });
  if (!transfer) throw new Error("NOT_FOUND");
  if (transfer.status !== TransferStatus.PENDING) throw new Error("ALREADY_RESOLVED");
  if (transfer.senderId !== user.id && user.role !== "ADMIN") throw new Error("FORBIDDEN");

  await prisma.$transaction(async (tx) => {
    await tx.transfer.update({
      where: { id },
      data: {
        status: TransferStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });
    const equipment = await tx.equipment.findUnique({ where: { id: transfer.equipmentId } });
    if (equipment && equipment.status === EquipmentStatus.IN_TRANSIT) {
      await tx.equipment.update({
        where: { id: transfer.equipmentId },
        data: {
          status: equipment.ownerId ? EquipmentStatus.IN_USE : EquipmentStatus.AVAILABLE,
        },
      });
    }
    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: AuditAction.TRANSFER_CANCEL,
        entityType: "Transfer",
        entityId: id,
      },
    });
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transfers");
  revalidatePath("/dashboard/inbox");
}
