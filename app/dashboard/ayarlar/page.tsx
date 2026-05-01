import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { saveCompanySettings } from "@/lib/actions/ayarlar-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AyarlarPage() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    redirect("/dashboard");
  }

  const settings = await prisma.companySettings.findFirst();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Şirket Ayarları</h2>
        <p className="text-sm text-slate-500">Şirket bilgilerini ve sistem varsayılanlarını yapılandırın.</p>
      </div>

      <form action={saveCompanySettings} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Şirket Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Şirket Adı</label>
              <input
                name="companyName"
                defaultValue={settings?.companyName ?? ""}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">E-posta</label>
              <input
                name="email"
                type="email"
                defaultValue={settings?.email ?? ""}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Telefon</label>
              <input
                name="phone"
                defaultValue={settings?.phone ?? ""}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Web Sitesi</label>
              <input
                name="website"
                defaultValue={settings?.website ?? ""}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Şehir</label>
              <input
                name="city"
                defaultValue={settings?.city ?? ""}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Adres</label>
              <input
                name="address"
                defaultValue={settings?.address ?? ""}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Vergi Numarası</label>
              <input
                name="taxNumber"
                defaultValue={settings?.taxNumber ?? ""}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Vergi Dairesi</label>
              <input
                name="taxOffice"
                defaultValue={settings?.taxOffice ?? ""}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Varsayılan Değerler</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Para Birimi</label>
              <select
                name="defaultCurrency"
                defaultValue={settings?.defaultCurrency ?? "TRY"}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
              >
                <option value="TRY">TRY - Türk Lirası</option>
                <option value="USD">USD - Amerikan Doları</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Varsayılan KDV Oranı (%)</label>
              <input
                name="defaultTaxRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                defaultValue={settings?.defaultTaxRate ?? 18}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Fatura Öneki</label>
              <input
                name="invoicePrefix"
                defaultValue={settings?.invoicePrefix ?? "INV"}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Teklif Öneki</label>
              <input
                name="quotePrefix"
                defaultValue={settings?.quotePrefix ?? "ONP"}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Servis Öneki</label>
              <input
                name="servicePrefix"
                defaultValue={settings?.servicePrefix ?? "SRV"}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
          </CardContent>
        </Card>

        <div>
          <Button type="submit">Ayarları Kaydet</Button>
        </div>
      </form>
    </div>
  );
}
