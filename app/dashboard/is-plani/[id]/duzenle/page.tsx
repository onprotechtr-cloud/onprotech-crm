import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateWorkPlan, deleteWorkPlan } from "@/lib/actions/is-plani-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function GorevDuzenlePage({ params }: { params: { id: string } }) {
  const [plan, users, customers] = await Promise.all([
    prisma.workPlan.findUnique({
      where: { id: params.id },
      include: {
        assignedTo: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } },
      },
    }),
    prisma.user.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.customer.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, company: true } }),
  ]);

  if (!plan) {
    notFound();
  }

  const updateWithId = updateWorkPlan.bind(null, params.id);
  const deleteWithId = deleteWorkPlan.bind(null, params.id);

  const toInputDate = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Görevi Düzenle</h2>
          <p className="text-sm text-slate-500">{plan.title}</p>
        </div>
        <form action={deleteWithId}>
          <Button type="submit" variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50">
            Görevi Sil
          </Button>
        </form>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Görev Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateWithId} className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Başlık *</label>
              <input
                name="title"
                required
                defaultValue={plan.title}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Açıklama</label>
              <textarea
                name="description"
                rows={3}
                defaultValue={plan.description ?? ""}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Atanan Kişi</label>
              <select
                name="assignedToId"
                defaultValue={plan.assignedToId ?? ""}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
              >
                <option value="">Seçin...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Müşteri</label>
              <select
                name="customerId"
                defaultValue={plan.customerId ?? ""}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
              >
                <option value="">Seçin...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}{c.company ? ` · ${c.company}` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Öncelik</label>
              <select
                name="priority"
                defaultValue={plan.priority}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
              >
                <option value="DUSUK">Düşük</option>
                <option value="NORMAL">Normal</option>
                <option value="YUKSEK">Yüksek</option>
                <option value="ACIL">Acil</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Durum</label>
              <select
                name="status"
                defaultValue={plan.status}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
              >
                <option value="YAPILACAK">Yapılacak</option>
                <option value="DEVAM_EDIYOR">Devam Ediyor</option>
                <option value="TAMAMLANDI">Tamamlandı</option>
                <option value="IPTAL">İptal</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Son Tarih</label>
              <input
                name="dueDate"
                type="date"
                defaultValue={toInputDate(plan.dueDate)}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Kategori</label>
              <input
                name="category"
                defaultValue={plan.category ?? ""}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Notlar</label>
              <textarea
                name="notes"
                rows={2}
                defaultValue={plan.notes ?? ""}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Değişiklikleri Kaydet</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
