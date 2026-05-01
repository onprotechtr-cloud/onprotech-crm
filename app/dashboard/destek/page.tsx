import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDateShort } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ticketStatusLabel: Record<string, string> = {
  ACIK: "Açık",
  YANIT_BEKLENIYOR: "Yanıt Bekleniyor",
  COZULDU: "Çözüldü",
  KAPANDI: "Kapandı",
};

const ticketStatusVariant: Record<string, "accent" | "warning" | "success" | "default"> = {
  ACIK: "accent",
  YANIT_BEKLENIYOR: "warning",
  COZULDU: "success",
  KAPANDI: "default",
};

const priorityVariant: Record<string, "danger" | "warning" | "accent" | "default"> = {
  ACIL: "danger",
  YUKSEK: "warning",
  NORMAL: "accent",
  DUSUK: "default",
};

const priorityLabel: Record<string, string> = {
  ACIL: "Acil",
  YUKSEK: "Yüksek",
  NORMAL: "Normal",
  DUSUK: "Düşük",
};

export default async function DestekPage({
  searchParams,
}: {
  searchParams: { status?: string; priority?: string };
}) {
  const tickets = await prisma.ticket.findMany({
    where: {
      ...(searchParams.status ? { status: searchParams.status as never } : {}),
      ...(searchParams.priority ? { priority: searchParams.priority as never } : {}),
    },
    include: {
      customer: { select: { id: true, name: true, company: true } },
      createdBy: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Destek Talepleri</h2>
          <p className="text-sm text-slate-500">Müşteri destek taleplerini takip edin ve yönetin.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/destek/yeni">
            <Plus className="h-4 w-4" />
            Yeni Talep
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
              name="status"
              defaultValue={searchParams.status ?? ""}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
            >
              <option value="">Tüm Durumlar</option>
              <option value="ACIK">Açık</option>
              <option value="YANIT_BEKLENIYOR">Yanıt Bekleniyor</option>
              <option value="COZULDU">Çözüldü</option>
              <option value="KAPANDI">Kapandı</option>
            </select>
            <select
              name="priority"
              defaultValue={searchParams.priority ?? ""}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
            >
              <option value="">Tüm Öncelikler</option>
              <option value="ACIL">Acil</option>
              <option value="YUKSEK">Yüksek</option>
              <option value="NORMAL">Normal</option>
              <option value="DUSUK">Düşük</option>
            </select>
            <Button type="submit" size="sm">Filtrele</Button>
            <Link href="/dashboard/destek">
              <Button type="button" variant="outline" size="sm">Sıfırla</Button>
            </Link>
          </form>
        </CardContent>
      </Card>

      {tickets.length ? (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Talep No</TableHead>
                  <TableHead>Müşteri</TableHead>
                  <TableHead>Konu</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Öncelik</TableHead>
                  <TableHead>Atanan</TableHead>
                  <TableHead>Oluşturulma</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/destek/${ticket.id}`}
                        className="font-mono text-xs font-semibold text-orange-600 hover:underline"
                      >
                        {ticket.ticketNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900">{ticket.customer.name}</div>
                      {ticket.customer.company && (
                        <div className="text-xs text-slate-500">{ticket.customer.company}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/dashboard/destek/${ticket.id}`}
                        className="font-medium text-slate-900 hover:text-orange-600 line-clamp-1"
                      >
                        {ticket.subject}
                      </Link>
                      {ticket.category && (
                        <div className="text-xs text-slate-500">{ticket.category}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={ticketStatusVariant[ticket.status] ?? "default"}>
                        {ticketStatusLabel[ticket.status] ?? ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={priorityVariant[ticket.priority] ?? "default"}>
                        {priorityLabel[ticket.priority] ?? ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{ticket.assignedTo?.name ?? "-"}</TableCell>
                    <TableCell>{formatDateShort(ticket.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-slate-500">
            Destek talebi bulunamadı. Filtrelerinizi değiştirin veya yeni bir talep oluşturun.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
