import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDateShort, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const statusLabel: Record<string, string> = {
  AKTIF: "Aktif",
  IZINLI: "İzinli",
  AYRILDI: "Ayrıldı",
};

const statusVariant: Record<string, "success" | "warning" | "danger"> = {
  AKTIF: "success",
  IZINLI: "warning",
  AYRILDI: "danger",
};

export default async function PersonelPage({
  searchParams,
}: {
  searchParams: { q?: string; dept?: string };
}) {
  const employees = await prisma.employee.findMany({
    where: {
      AND: [
        searchParams.q
          ? {
              OR: [
                { firstName: { contains: searchParams.q } },
                { lastName: { contains: searchParams.q } },
                { department: { contains: searchParams.q } },
                { position: { contains: searchParams.q } },
                { email: { contains: searchParams.q } },
              ],
            }
          : {},
        searchParams.dept ? { department: { contains: searchParams.dept } } : {},
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Personel Yönetimi</h2>
          <p className="text-sm text-slate-500">Çalışanları ve bilgilerini yönetin.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/personel/yeni">
            <Plus className="h-4 w-4" />
            Yeni Personel
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Arama ve Filtreleme</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-wrap gap-3">
            <input
              name="q"
              defaultValue={searchParams.q}
              placeholder="Ad, departman veya pozisyon ara"
              className="flex-1 min-w-48 rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
            />
            <input
              name="dept"
              defaultValue={searchParams.dept}
              placeholder="Departman filtrele"
              className="w-44 rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
            />
            <Button type="submit">Filtrele</Button>
          </form>
        </CardContent>
      </Card>

      {employees.length ? (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad Soyad</TableHead>
                  <TableHead>Departman</TableHead>
                  <TableHead>Pozisyon</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>İşe Başlama</TableHead>
                  <TableHead>Maaş</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/personel/${emp.id}`}
                        className="font-semibold text-slate-900 hover:text-orange-600"
                      >
                        {emp.firstName} {emp.lastName}
                      </Link>
                      {emp.email && (
                        <div className="text-xs text-slate-500">{emp.email}</div>
                      )}
                    </TableCell>
                    <TableCell>{emp.department}</TableCell>
                    <TableCell>{emp.position}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[emp.status] ?? "default"}>
                        {statusLabel[emp.status] ?? emp.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDateShort(emp.startDate)}</TableCell>
                    <TableCell>
                      {emp.salary
                        ? `${formatCurrency(emp.salary)} / ${emp.salaryPeriod === "AYLIK" ? "Ay" : "Yıl"}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/dashboard/personel/${emp.id}`}
                        className="text-xs text-orange-500 hover:underline"
                      >
                        Detay →
                      </Link>
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
            Personel bulunamadı. Arama kriterlerini değiştirin veya yeni personel ekleyin.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
