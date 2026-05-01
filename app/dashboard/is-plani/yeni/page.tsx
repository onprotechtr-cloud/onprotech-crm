import { prisma } from "@/lib/prisma";
import { createWorkPlan } from "@/lib/actions/is-plani-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function YeniGorevPage() {
  const [users, customers] = await Promise.all([
    prisma.user.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.customer.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, company: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Yeni Görev</h2>
        <p className="text-sm text-slate-500">Yeni bir iş planı görevi oluşturun.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Görev Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createWorkPlan} className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Başlık *</label>
              <input
                name="title"
                required
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Açıklama</label>
              <textarea
                name="description"
                rows={3}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Atanan Kişi</label>
              <select
                name="assignedToId"
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
                defaultValue="NORMAL"
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
              >
                <option value="DUSUK">Düşük</option>
                <option value="NORMAL">Normal</option>
                <option value="YUKSEK">Yüksek</option>
                <option value="ACIL">Acil</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Son Tarih</label>
              <input
                name="dueDate"
                type="date"
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Kategori</label>
              <input
                name="category"
                placeholder="Örn: Satış, Teknik, Destek"
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Notlar</label>
              <textarea
                name="notes"
                rows={2}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Görevi Oluştur</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
