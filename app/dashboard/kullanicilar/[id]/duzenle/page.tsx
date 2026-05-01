import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { updateUser, resetUserPassword } from "@/lib/actions/kullanici-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function KullaniciDuzenlePage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    redirect("/dashboard");
  }

  const user = await prisma.user.findUnique({ where: { id: params.id } });

  if (!user) {
    notFound();
  }

  const updateWithId = updateUser.bind(null, params.id);
  const resetPasswordWithId = resetUserPassword.bind(null, params.id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Kullanıcı Düzenle</h2>
        <p className="text-sm text-slate-500">{user.name} hesabını güncelleyin.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kullanıcı Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateWithId} className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Ad Soyad *</label>
              <input
                name="name"
                required
                defaultValue={user.name ?? ""}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">E-posta *</label>
              <input
                name="email"
                type="email"
                required
                defaultValue={user.email}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Rol</label>
              <select
                name="role"
                defaultValue={user.role}
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
                defaultValue={(user as { phone?: string | null }).phone ?? ""}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                defaultChecked={(user as { isActive?: boolean }).isActive !== false}
                className="h-4 w-4 rounded border-slate-300 text-orange-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                Hesap Aktif
              </label>
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Değişiklikleri Kaydet</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Şifre Sıfırla</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={resetPasswordWithId} className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Yeni Şifre</label>
              <input
                name="newPassword"
                type="password"
                minLength={6}
                required
                placeholder="En az 6 karakter"
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 w-64"
              />
            </div>
            <Button type="submit" variant="outline">Şifreyi Güncelle</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
