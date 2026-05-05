"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, X, FloppyDisk } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createEquipment, updateEquipment } from "@/actions/equipment";
import { t } from "@/lib/i18n";

type Category = { id: string; name: string; nameAr: string };
type Member = { id: string; name: string; nameAr: string | null };

type EquipmentInitial = {
  id: string;
  serial: string;
  name: string;
  nameAr: string;
  brand: string | null;
  model: string | null;
  description: string | null;
  descriptionAr: string | null;
  status: string;
  condition: string;
  ownerId: string | null;
  categoryId: string | null;
  notes: string | null;
  images: { url: string; isPrimary: boolean; position: number }[];
};

export function EquipmentForm({
  categories,
  members,
  mode,
  initial,
}: {
  categories: Category[];
  members: Member[];
  mode: "create" | "update";
  initial?: EquipmentInitial;
}) {
  const [images, setImages] = useState<string[]>(initial?.images.map((i) => i.url) ?? []);
  const [newImage, setNewImage] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const action = mode === "create" ? createEquipment : updateEquipment;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.delete("imageUrls");
    images.forEach((u) => fd.append("imageUrls", u));
    if (mode === "update" && initial?.id) fd.set("id", initial.id);
    start(async () => {
      try {
        await action(fd);
      } catch (err) {
        setError(err instanceof Error ? err.message : "حدث خطأ");
      }
    });
  }

  function addImage() {
    const u = newImage.trim();
    if (!u) return;
    try {
      new URL(u);
      setImages((prev) => [...prev, u]);
      setNewImage("");
    } catch {
      setError("رابط الصورة غير صالح");
    }
  }
  function removeImage(i: number) {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  }
  function makePrimary(i: number) {
    setImages((prev) => {
      const arr = [...prev];
      const [picked] = arr.splice(i, 1);
      arr.unshift(picked);
      return arr;
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="serial">{t.dashboard.fields.serial} *</Label>
          <Input id="serial" name="serial" required defaultValue={initial?.serial} placeholder="MHW-XXXX-001" />
        </div>
        <div>
          <Label htmlFor="categoryId">{t.dashboard.fields.category}</Label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={initial?.categoryId ?? ""}
            className="focus-ring h-12 w-full rounded-2xl border border-line bg-bg-elev/60 px-4 text-sm"
          >
            <option value="">— بدون تصنيف —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameAr} · {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="name">{t.dashboard.fields.name} *</Label>
          <Input id="name" name="name" required defaultValue={initial?.name} placeholder="Sony A7 IV" />
        </div>
        <div>
          <Label htmlFor="nameAr">{t.dashboard.fields.nameAr} *</Label>
          <Input id="nameAr" name="nameAr" required defaultValue={initial?.nameAr} placeholder="سوني A7 IV" />
        </div>
        <div>
          <Label htmlFor="brand">{t.dashboard.fields.brand}</Label>
          <Input id="brand" name="brand" defaultValue={initial?.brand ?? ""} placeholder="Sony" />
        </div>
        <div>
          <Label htmlFor="model">{t.dashboard.fields.model}</Label>
          <Input id="model" name="model" defaultValue={initial?.model ?? ""} placeholder="ILCE-7M4" />
        </div>
        <div>
          <Label htmlFor="status">{t.dashboard.fields.status}</Label>
          <select
            id="status"
            name="status"
            defaultValue={initial?.status ?? "AVAILABLE"}
            className="focus-ring h-12 w-full rounded-2xl border border-line bg-bg-elev/60 px-4 text-sm"
          >
            <option value="AVAILABLE">متوفّر</option>
            <option value="IN_USE">قيد الاستخدام</option>
            <option value="IN_TRANSIT">قيد التحويل</option>
            <option value="MAINTENANCE">صيانة</option>
            <option value="RETIRED">محال للأرشيف</option>
          </select>
        </div>
        <div>
          <Label htmlFor="condition">{t.dashboard.fields.condition}</Label>
          <select
            id="condition"
            name="condition"
            defaultValue={initial?.condition ?? "EXCELLENT"}
            className="focus-ring h-12 w-full rounded-2xl border border-line bg-bg-elev/60 px-4 text-sm"
          >
            <option value="PRISTINE">كالجديد</option>
            <option value="EXCELLENT">ممتاز</option>
            <option value="GOOD">جيّد</option>
            <option value="FAIR">مقبول</option>
            <option value="WORN">متآكل</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="ownerId">{t.dashboard.fields.owner}</Label>
          <select
            id="ownerId"
            name="ownerId"
            defaultValue={initial?.ownerId ?? ""}
            className="focus-ring h-12 w-full rounded-2xl border border-line bg-bg-elev/60 px-4 text-sm"
          >
            <option value="">— غير معيّن —</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nameAr || m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="descriptionAr">{t.dashboard.fields.descriptionAr}</Label>
          <Textarea id="descriptionAr" name="descriptionAr" defaultValue={initial?.descriptionAr ?? ""} rows={4} />
        </div>
        <div>
          <Label htmlFor="description">{t.dashboard.fields.description}</Label>
          <Textarea id="description" name="description" defaultValue={initial?.description ?? ""} rows={4} dir="ltr" />
        </div>
      </div>

      <div>
        <Label>{t.dashboard.fields.images}</Label>
        <div className="flex gap-2">
          <Input
            value={newImage}
            onChange={(e) => setNewImage(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            dir="ltr"
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addImage();
              }
            }}
          />
          <Button type="button" variant="outline" onClick={addImage}>
            <Plus size={16} weight="bold" />
            إضافة
          </Button>
        </div>
        {images.length > 0 && (
          <ul className="mt-4 grid gap-3 grid-cols-2 md:grid-cols-3">
            <AnimatePresence initial={false}>
              {images.map((u, i) => (
                <motion.li
                  key={u + i}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 220, damping: 22 }}
                  className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-line bg-fg/5 group"
                >
                  <img src={u} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-x-2 top-2 flex justify-between">
                    {i === 0 && (
                      <span className="rounded-full bg-accent text-accent-fg text-[10px] font-mono uppercase tracking-[0.18em] px-2 py-0.5">
                        رئيسية
                      </span>
                    )}
                    <span />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="rounded-full bg-bg/90 backdrop-blur-md text-fg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="حذف"
                    >
                      <X size={12} weight="bold" />
                    </button>
                  </div>
                  {i !== 0 && (
                    <button
                      type="button"
                      onClick={() => makePrimary(i)}
                      className="absolute inset-x-2 bottom-2 rounded-full bg-bg/90 backdrop-blur-md text-fg text-[11px] py-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {t.dashboard.actions.makePrimaryImage}
                    </button>
                  )}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-[color-mix(in_oklab,var(--danger)_30%,transparent)] bg-[color-mix(in_oklab,var(--danger)_8%,transparent)] px-4 py-3 text-sm text-[var(--danger)]">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="submit" variant="accent" size="lg" disabled={pending}>
          <FloppyDisk size={16} weight="bold" />
          {pending ? "جارٍ الحفظ…" : mode === "create" ? "إضافة المعدّة" : t.dashboard.actions.saveChanges}
        </Button>
      </div>
    </form>
  );
}
