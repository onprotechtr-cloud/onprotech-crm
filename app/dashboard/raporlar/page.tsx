import { prisma } from "@/lib/prisma";
import { ReportsClient } from "@/components/raporlar/ReportsClient";

export default async function RaporlarPage() {
  const today = new Date();
  const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);

  const [quotes, customers, serviceOrders, products, tickets] = await Promise.all([
    prisma.quote.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { id: true, total: true, status: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.customer.findMany({
      select: {
        id: true,
        name: true,
        company: true,
        createdAt: true,
        quotes: { select: { total: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.serviceOrder.findMany({
      select: { id: true, type: true, status: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.product.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        stockQuantity: true,
        minStockLevel: true,
        unitPrice: true,
      },
    }),
    prisma.ticket.findMany({
      select: { id: true, status: true, priority: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Raporlar</h2>
        <p className="text-sm text-slate-500">İş analitiklerini ve raporları görüntüleyin.</p>
      </div>
      <ReportsClient
        quotes={quotes.map((q) => ({
          ...q,
          total: Number(q.total),
          createdAt: q.createdAt.toISOString(),
        }))}
        customers={customers.map((c) => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
          totalQuoteValue: c.quotes.reduce((sum, q) => sum + Number(q.total), 0),
        }))}
        serviceOrders={serviceOrders.map((s) => ({
          ...s,
          createdAt: s.createdAt.toISOString(),
        }))}
        products={products.map((p) => ({
          ...p,
          unitPrice: Number(p.unitPrice),
        }))}
        tickets={tickets.map((t) => ({
          ...t,
          createdAt: t.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
