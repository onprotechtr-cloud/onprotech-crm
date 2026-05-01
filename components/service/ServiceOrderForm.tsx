"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createServiceOrder, updateServiceOrder } from "@/lib/actions/service-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Customer = { id: string; name: string; company?: string | null };
type Technician = { id: string; name: string; role: string };

interface ServiceOrderFormProps {
  customers: Customer[];
  technicians: Technician[];
}

interface EditFormProps extends ServiceOrderFormProps {
  order: {
    id: string;
    customerId: string;
    assignedToId: string | null;
    type: string;
    priority: string;
    title: string;
    description: string | null;
    scheduledDate: Date | null;
    scheduledTime: string | null;
    location: string | null;
    customerNotes: string | null;
    technicianNotes: string | null;
  };
}

function toDateInput(d: Date | null): string {
  if (!d) return "";
  return d.toISOString().split("T")[0];
}

function ServiceOrderFormFields({
  customers,
  technicians,
  defaults,
}: ServiceOrderFormProps & {
  defaults?: Partial<{
    customerId: string;
    assignedToId: string | null;
    type: string;
    priority: string;
    title: string;
    description: string | null;
    scheduledDate: string;
    scheduledTime: string | null;
    location: string | null;
    customerNotes: string | null;
    technicianNotes: string | null;
  }>;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Temel Bilgiler</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Müşteri *</label>
              <select
                name="customerId"
                defaultValue={defaults?.customerId ?? ""}
                required
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              >
                <option value="">Müşteri seçin...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}{c.company ? ` — ${c.company}` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Atanan Teknisyen</label>
              <select
                name="assignedToId"
                defaultValue={defaults?.assignedToId ?? ""}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              >
                <option value="">Atanmadı</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Servis Tipi *</label>
              <select
                name="type"
                defaultValue={defaults?.type ?? "KURULUM"}
                required
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              >
                <option value="KURULUM">Kurulum</option>
                <option value="BAKIM">Bakım</option>
                <option value="ARIZA">Arıza</option>
                <option value="REVIZYON">Revizyon</option>
                <option value="KONTROL">Kontrol</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Öncelik *</label>
              <select
                name="priority"
                defaultValue={defaults?.priority ?? "NORMAL"}
                required
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              >
                <option value="DUSUK">Düşük</option>
                <option value="NORMAL">Normal</option>
                <option value="YUKSEK">Yüksek</option>
                <option value="ACIL">Acil</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Başlık *</label>
            <Input
              name="title"
              defaultValue={defaults?.title ?? ""}
              placeholder="Servis emri başlığı"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama</label>
            <textarea
              name="description"
              defaultValue={defaults?.description ?? ""}
              placeholder="Detaylı açıklama..."
              rows={3}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 resize-y"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Zamanlama ve Konum</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Planlanan Tarih</label>
              <Input type="date" name="scheduledDate" defaultValue={defaults?.scheduledDate ?? ""} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Planlanan Saat</label>
              <Input type="time" name="scheduledTime" defaultValue={defaults?.scheduledTime ?? ""} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Konum / Adres</label>
              <Input name="location" defaultValue={defaults?.location ?? ""} placeholder="Müşteri adresi veya konum" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Notlar</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Müşteri Notları</label>
            <textarea
              name="customerNotes"
              defaultValue={defaults?.customerNotes ?? ""}
              placeholder="Müşteriden gelen notlar..."
              rows={2}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 resize-y"
            />
          </div>
          {defaults && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Teknisyen Notları</label>
              <textarea
                name="technicianNotes"
                defaultValue={defaults?.technicianNotes ?? ""}
                placeholder="Teknisyen notları ve saha gözlemleri..."
                rows={2}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 resize-y"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function NewServiceOrderForm({ customers, technicians }: ServiceOrderFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createServiceOrder({
        customerId: form.get("customerId") as string,
        assignedToId: (form.get("assignedToId") as string) || undefined,
        type: form.get("type") as string,
        priority: form.get("priority") as string,
        title: form.get("title") as string,
        description: (form.get("description") as string) || undefined,
        scheduledDate: (form.get("scheduledDate") as string) || undefined,
        scheduledTime: (form.get("scheduledTime") as string) || undefined,
        location: (form.get("location") as string) || undefined,
        customerNotes: (form.get("customerNotes") as string) || undefined,
      });

      if ("error" in result && result.error) {
        toast.error(result.error as string);
      } else if ("data" in result && result.data) {
        toast.success("Servis emri oluşturuldu.");
        router.push(`/dashboard/teknik-servis/${result.data.id}`);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <ServiceOrderFormFields customers={customers} technicians={technicians} />
      <div className="mt-6 flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Kaydediliyor..." : "Servis Emri Oluştur"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          İptal
        </Button>
      </div>
    </form>
  );
}

export function EditServiceOrderForm({ order, customers, technicians }: EditFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateServiceOrder(order.id, {
        customerId: form.get("customerId") as string,
        assignedToId: (form.get("assignedToId") as string) || undefined,
        type: form.get("type") as string,
        priority: form.get("priority") as string,
        title: form.get("title") as string,
        description: (form.get("description") as string) || undefined,
        scheduledDate: (form.get("scheduledDate") as string) || undefined,
        scheduledTime: (form.get("scheduledTime") as string) || undefined,
        location: (form.get("location") as string) || undefined,
        customerNotes: (form.get("customerNotes") as string) || undefined,
        technicianNotes: (form.get("technicianNotes") as string) || undefined,
      });

      if ("error" in result && result.error) {
        toast.error(result.error as string);
      } else {
        toast.success("Servis emri güncellendi.");
        router.push(`/dashboard/teknik-servis/${order.id}`);
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <ServiceOrderFormFields
        customers={customers}
        technicians={technicians}
        defaults={{
          ...order,
          scheduledDate: toDateInput(order.scheduledDate),
        }}
      />
      <div className="mt-6 flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/dashboard/teknik-servis/${order.id}`)}
        >
          İptal
        </Button>
      </div>
    </form>
  );
}
