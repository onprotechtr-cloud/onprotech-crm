import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { formatDateShort } from "@/lib/utils";
import { toggleUserActive } from "@/lib/actions/kullanici-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const roleLabel: Record<string, string> = {
  ADMIN: "Yönetici",
  SATIS: "Satış",
  MUHASEBE: "Muhasebe",
  TEKNISYEN: "Teknisyen",
};

export default async function KullanicilarPage({
  searchParams,
}: {
  searchParams: { role?: string };
}) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    where: searchParams.role ? { role: searchParams.role as UserRole } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Kullanıcı Yönetimi</h2>
          <p className="text-sm text-slate-500">Sistem kullanıcılarını ve yetkilerini yönetin.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/kullanicilar/yeni">
            <Plus className="h-4 w-4" />
            Yeni Kullanıcı
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtrele</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-wrap gap-3">
            <select
              name="role"
              defaultValue={searchParams.role ?? ""}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
            >
              <option value="">Tüm Roller</option>
              <option value="ADMIN">Yönetici</option>
              <option value="SATIS">Satış</option>
              <option value="MUHASEBE">Muhasebe</option>
              <option value="TEKNISYEN">Teknisyen</option>
            </select>
            <Button type="submit" size="sm">Filtrele</Button>
          </form>
        </CardContent>
      </Card>

      {users.length ? (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad</TableHead>
                  <TableHead>E-posta</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Oluşturulma</TableHead>
                  <TableHead>İşlem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-slate-900">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="default">{roleLabel[user.role] ?? user.role}</Badge>
                    </TableCell>
                    <TableCell>{(user as { phone?: string | null }).phone ?? "-"}</TableCell>
                    <TableCell>
                      {(user as { isActive?: boolean }).isActive !== false ? (
                        <Badge variant="success">Aktif</Badge>
                      ) : (
                        <Badge variant="danger">Pasif</Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDateShort(user.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link
                          href={`/dashboard/kullanicilar/${user.id}/duzenle`}
                          className="text-xs text-orange-500 hover:underline"
                        >
                          Düzenle
                        </Link>
                        <form
                          action={async () => {
                            "use server";
                            const isActive = (user as { isActive?: boolean }).isActive !== false;
                            await toggleUserActive(user.id, !isActive);
                          }}
                        >
                          <button
                            type="submit"
                            className="text-xs text-slate-500 hover:text-slate-700 hover:underline"
                          >
                            {(user as { isActive?: boolean }).isActive !== false ? "Pasifleştir" : "Aktifleştir"}
                          </button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-slate-500">
            Kullanıcı bulunamadı.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
