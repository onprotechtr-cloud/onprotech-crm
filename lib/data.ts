import { Prisma, QuoteStatus } from "@prisma/client";
import { startOfDay, endOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";

export async function getDashboardData() {
  const today = new Date();
  const [
    totalCustomers,
    pendingQuotes,
    todayAppointments,
    monthlyRevenue,
    recentQuotes,
    allProducts,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.quote.count({
      where: { status: { in: [QuoteStatus.DRAFT, QuoteStatus.SENT] } },
    }),
    prisma.appointment.findMany({
      where: {
        date: { gte: startOfDay(today), lte: endOfDay(today) },
      },
      include: { customer: true },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    }),
    prisma.quote.aggregate({
      _sum: { total: true },
      where: {
        date: {
          gte: new Date(today.getFullYear(), today.getMonth(), 1),
          lte: new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59),
        },
        status: QuoteStatus.ACCEPTED,
      },
    }),
    prisma.quote.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { customer: true },
    }),
    prisma.product.findMany({ orderBy: { stockQuantity: "asc" } }),
  ]);

  const lowStockProducts = allProducts
    .filter((p) => p.stockQuantity <= p.minStockLevel)
    .slice(0, 5);

  return {
    totalCustomers,
    pendingQuotes,
    todayAppointments,
    monthlyRevenue: monthlyRevenue._sum.total ?? 0,
    recentQuotes,
    lowStockProducts,
  };
}

export async function getCustomers(search?: string, sort?: string) {
  const orderBy: Prisma.CustomerOrderByWithRelationInput =
    sort === "name"
      ? { name: "asc" }
      : sort === "company"
        ? { company: "asc" }
        : { createdAt: "desc" };

  return prisma.customer.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search } },
            { company: { contains: search } },
            { email: { contains: search } },
            { city: { contains: search } },
          ],
        }
      : undefined,
    include: { quotes: true, appointments: true },
    orderBy,
  });
}

export async function getCustomerById(id: string) {
  return prisma.customer.findUnique({
    where: { id },
    include: {
      quotes: { orderBy: { createdAt: "desc" } },
      appointments: { orderBy: [{ date: "desc" }, { startTime: "desc" }] },
    },
  });
}

export async function getQuotes(status?: string) {
  return prisma.quote.findMany({
    where: status && status !== "ALL" ? { status: status as QuoteStatus } : undefined,
    include: {
      customer: true,
      user: true,
      items: { orderBy: { order: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getQuoteById(id: string) {
  return prisma.quote.findUnique({
    where: { id },
    include: {
      customer: true,
      user: true,
      items: { orderBy: { order: "asc" } },
    },
  });
}

export async function getQuoteNumber() {
  const year = new Date().getFullYear();
  const count = await prisma.quote.count({
    where: { quoteNumber: { startsWith: `ONP-${year}-` } },
  });
  return `ONP-${year}-${String(count + 1).padStart(3, "0")}`;
}

export async function getAppointments() {
  return prisma.appointment.findMany({
    include: { customer: true, user: true },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });
}

export async function getAppointmentById(id: string) {
  return prisma.appointment.findUnique({
    where: { id },
    include: { customer: true, user: true },
  });
}

export async function getProducts(search?: string) {
  const products = await prisma.product.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search } },
            { code: { contains: search } },
            { category: { contains: search } },
          ],
        }
      : undefined,
    orderBy: { name: "asc" },
    include: {
      warehouseStocks: {
        include: {
          warehouse: true,
        },
      },
    },
  });

  return products.map((product) => ({
    ...product,
    stockQuantity:
      product.warehouseStocks.length > 0
        ? product.warehouseStocks.reduce((total, stock) => total + stock.quantity, 0)
        : product.stockQuantity,
  }));
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      warehouseStocks: {
        include: {
          warehouse: { select: { id: true, name: true, type: true, isActive: true } },
        },
        orderBy: { warehouse: { name: "asc" } },
      },
    },
  });

  if (!product || product.warehouseStocks.length === 0) {
    return product;
  }

  return {
    ...product,
    stockQuantity: product.warehouseStocks.reduce(
      (total, stock) => total + stock.quantity,
      0,
    ),
  };
}

export async function getLowStockProducts() {
  const products = await getProducts();
  return products.filter((p) => p.stockQuantity <= p.minStockLevel);
}

export async function getSelectOptions() {
  const [customers, products] = await Promise.all([
    prisma.customer.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, company: true },
    }),
    prisma.product.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true, unit: true, unitPrice: true, currency: true },
    }),
  ]);

  return { customers, products };
}

export async function getDashboardServiceStats() {
  const [pendingCount, recentOrders] = await Promise.all([
    prisma.serviceOrder.count({
      where: {
        status: { in: ["BEKLEMEDE", "ATANDI", "YOLDA", "BASLADIM"] },
      },
    }),
    prisma.serviceOrder.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { name: true, company: true } },
        assignedTo: { select: { name: true } },
      },
    }),
  ]);
  return { pendingCount, recentOrders };
}

export async function getDashboardWarehouseStats() {
  const warehouses = await prisma.warehouse.findMany({
    where: { isActive: true },
    include: {
      stocks: {
        include: { product: { select: { minStockLevel: true } } },
      },
    },
    orderBy: { name: "asc" },
  });
  return warehouses.map((w) => ({
    id: w.id,
    name: w.name,
    type: w.type,
    productCount: w.stocks.length,
    totalItems: w.stocks.reduce((sum, s) => sum + s.quantity, 0),
    lowStockCount: w.stocks.filter((s) => s.quantity <= s.product.minStockLevel).length,
  }));
}
