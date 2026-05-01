import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { createUser } from "@/lib/actions/kullanici-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function YeniKullaniciPage() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Yeni Kullanıcı</h2>
        <p className="text-sm text-slate-500">Sisteme yeni bir kullanıcı hesabı ekleyin.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Kullanıcı Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createUser} className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Ad Soyad *</label>
              <input
                name="name"
                required
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">E-posta *</label>
              <input
                name="email"
                type="email"
                required
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Şifre *</label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Rol</label>
              <select
                name="role"
                defaultValue="SATIS"
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
              >
                <option value="SATIS">Satış</option>
                <option value="ADMIN">Yönetici</option>
                <option value="MUHASEBE">Muhasebe</option>
                <option value="TEKNISYEN">Teknisyen</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Telefon</label>
              <input
                name="phone"
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                defaultChecked
                className="h-4 w-4 rounded border-slate-300 text-orange-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                Hesap Aktif
              </label>
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Kullanıcı Oluştur</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
