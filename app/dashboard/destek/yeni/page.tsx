import { prisma } from "@/lib/prisma";
import { createTicket } from "@/lib/actions/destek-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function YeniTalepPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, company: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Yeni Destek Talebi</h2>
        <p className="text-sm text-slate-500">Müşteri için yeni bir destek talebi oluşturun.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Talep Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createTicket} className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Müşteri *</label>
              <select
                name="customerId"
                required
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
              >
                <option value="">Müşteri seçin...</option>
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
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Konu *</label>
              <input
                name="subject"
                required
                placeholder="Talep konusunu girin"
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Kategori</label>
              <input
                name="category"
                placeholder="Örn: Teknik, Fatura, Genel"
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">İlk Mesaj *</label>
              <textarea
                name="message"
                required
                rows={5}
                placeholder="Talep detaylarını açıklayın..."
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Talep Oluştur</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
