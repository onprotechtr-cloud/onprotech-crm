"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createWarehouse, updateWarehouse } from "@/lib/actions/warehouse-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WarehouseData {
  id: string;
  name: string;
  type: string;
  description: string | null;
  address: string | null;
  responsible: string | null;
  isActive: boolean;
}

export function WarehouseForm({ warehouse }: { warehouse?: WarehouseData }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isEdit = !!warehouse;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const data = {
        name: form.get("name") as string,
        type: form.get("type") as string,
        description: (form.get("description") as string) || undefined,
        address: (form.get("address") as string) || undefined,
        responsible: (form.get("responsible") as string) || undefined,
      };

      if (isEdit) {
        const result = await updateWarehouse(warehouse.id, {
          ...data,
          isActive: form.get("isActive") === "on",
        });
        if ("error" in result && result.error) {
          toast.error("Depo güncellenemedi.");
        } else {
          toast.success("Depo güncellendi.");
          router.push(`/dashboard/depolar/${warehouse.id}`);
          router.refresh();
        }
      } else {
        const result = await createWarehouse(data);
        if ("error" in result && result.error) {
          toast.error("Depo oluşturulamadı.");
        } else if ("data" in result && result.data) {
          toast.success("Depo oluşturuldu.");
          router.push(`/dashboard/depolar/${result.data.id}`);
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader><CardTitle>Depo Bilgileri</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Depo Adı *</label>
              <Input name="name" defaultValue={warehouse?.name ?? ""} required placeholder="Merkez Depo" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tip *</label>
              <select
                name="type"
                defaultValue={warehouse?.type ?? "MERKEZ"}
                required
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              >
                <option value="MERKEZ">Merkez Depo</option>
                <option value="SUBE">Şube Deposu</option>
                <option value="ARAC">Araç Deposu</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sorumlu Kişi</label>
              <Input name="responsible" defaultValue={warehouse?.responsible ?? ""} placeholder="Depo sorumlusu" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Adres</label>
              <Input name="address" defaultValue={warehouse?.address ?? ""} placeholder="Depo adresi" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama</label>
              <textarea
                name="description"
                defaultValue={warehouse?.description ?? ""}
                rows={2}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 resize-y"
                placeholder="Ek notlar..."
              />
            </div>
            {isEdit && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  defaultChecked={warehouse.isActive}
                  className="rounded border-slate-300"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                  Aktif Depo
                </label>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <div className="mt-6 flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Kaydediliyor..." : isEdit ? "Değişiklikleri Kaydet" : "Depo Oluştur"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>İptal</Button>
      </div>
    </form>
  );
}
