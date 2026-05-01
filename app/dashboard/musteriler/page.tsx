import Link from "next/link";
import { Plus } from "lucide-react";
import { getCustomers } from "@/lib/data";
import { formatDateShort } from "@/lib/utils";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: { q?: string; sort?: string };
}) {
  const customers = await getCustomers(searchParams.q, searchParams.sort);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Müşteriler</h2>
          <p className="text-sm text-slate-500">Portföyünüzdeki tüm müşteri kayıtlarını yönetin.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/musteriler/yeni">
            <Plus className="h-4 w-4" />
            Yeni Müşteri
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Arama ve Sıralama</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
            <Input name="q" defaultValue={searchParams.q} placeholder="Ad, şirket, e-posta veya şehir ara" />
            <select
              name="sort"
              defaultValue={searchParams.sort ?? "createdAt"}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="createdAt">Yeniye göre sırala</option>
              <option value="name">Ada göre sırala</option>
              <option value="company">Şirkete göre sırala</option>
            </select>
            <Button type="submit">Uygula</Button>
          </form>
        </CardContent>
      </Card>

      {customers.length ? (
        <Card>
          <CardContent className="pt-6">
            <Table className="mobile-card-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Müşteri</TableHead>
                  <TableHead>İletişim</TableHead>
                  <TableHead>Şehir</TableHead>
                  <TableHead>Teklif</TableHead>
                  <TableHead>Randevu</TableHead>
                  <TableHead>Oluşturulma</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell data-label="Müşteri">
                      <Link href={`/dashboard/musteriler/${customer.id}`} className="font-semibold text-slate-900 hover:text-orange-600">
                        {customer.name}
                      </Link>
                      <div className="text-sm text-slate-500">{customer.company ?? "Şirket bilgisi yok"}</div>
                    </TableCell>
                    <TableCell data-label="İletişim">
                      <div>{customer.email ?? "-"}</div>
                      <div className="text-sm text-slate-500">{customer.phone ?? "-"}</div>
                    </TableCell>
                    <TableCell data-label="Şehir">{customer.city ?? "-"}</TableCell>
                    <TableCell data-label="Teklif">{customer.quotes.length}</TableCell>
                    <TableCell data-label="Randevu">{customer.appointments.length}</TableCell>
                    <TableCell data-label="Oluşturulma">{formatDateShort(customer.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <EmptyState title="Müşteri bulunamadı" description="Arama kriterlerini değiştirin veya yeni bir müşteri ekleyin." />
      )}
    </div>
  );
}