import Link from "next/link";
import { getStockTransfers } from "@/lib/actions/warehouse-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";
import { formatDateShort } from "@/lib/utils";

const statusLabels: Record<string, string> = {
  BEKLEMEDE: "Beklemede",
  ONAYLANDI: "Onaylandı",
  TAMAMLANDI: "Tamamlandı",
  IPTAL: "İptal",
};

const statusVariants: Record<string, "default" | "warning" | "success" | "danger"> = {
  BEKLEMEDE: "warning",
  ONAYLANDI: "accent" as "default",
  TAMAMLANDI: "success",
  IPTAL: "danger",
};

export default async function TransferGecmisPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const transfers = await getStockTransfers({
    status: searchParams.status,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1">
            <Link href="/dashboard/depolar" className="text-sm text-slate-500 hover:text-orange-500">
              ← Depolar
            </Link>
          </div>
          <h2 className="text-2xl font-semibold text-slate-900">Transfer Geçmişi</h2>
          <p className="text-sm text-slate-500">{transfers.length} transfer kaydı</p>
        </div>
        <Link
          href="/dashboard/depolar/transfer"
          className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
        >
          Yeni Transfer
        </Link>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {(["ALL", "TAMAMLANDI", "BEKLEMEDE", "IPTAL"] as const).map((status) => (
          <Link
            key={status}
            href={status === "ALL" ? "/dashboard/depolar/transfer/gecmis" : `/dashboard/depolar/transfer/gecmis?status=${status}`}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              (searchParams.status ?? "ALL") === status
                ? "bg-orange-500 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {status === "ALL" ? "Tümü" : statusLabels[status]}
          </Link>
        ))}
      </div>

      {transfers.length ? (
        <Card>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transfer No</TableHead>
                  <TableHead>Ürün</TableHead>
                  <TableHead>Kaynak</TableHead>
                  <TableHead>Hedef</TableHead>
                  <TableHead>Miktar</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Tarih</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs">{t.transferNumber}</TableCell>
                    <TableCell>
                      <p className="font-medium text-slate-900">{t.product.name}</p>
                      <p className="text-xs text-slate-500">{t.product.code}</p>
                    </TableCell>
                    <TableCell>
                      <Link href={`/dashboard/depolar/${t.fromWarehouse.id}`} className="hover:text-orange-600 text-sm">
                        {t.fromWarehouse.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/dashboard/depolar/${t.toWarehouse.id}`} className="hover:text-orange-600 text-sm">
                        {t.toWarehouse.name}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">
                      {t.quantity} {t.product.unit}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[t.status] ?? "default"}>
                        {statusLabels[t.status] ?? t.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {formatDateShort(t.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          title="Transfer kaydı yok"
          description="Henüz hiç stok transferi yapılmamış."
        />
      )}
    </div>
  );
}
