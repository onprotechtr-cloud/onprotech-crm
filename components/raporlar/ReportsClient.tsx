"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const COLORS = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#ef4444"];

type QuoteData = {
  id: string;
  total: number;
  status: string;
  createdAt: string;
};

type CustomerData = {
  id: string;
  name: string;
  company: string | null;
  createdAt: string;
  totalQuoteValue: number;
};

type ServiceOrderData = {
  id: string;
  type: string;
  status: string;
  createdAt: string;
};

type ProductData = {
  id: string;
  name: string;
  category: string | null;
  stockQuantity: number;
  minStockLevel: number;
  unitPrice: number;
};

type TicketData = {
  id: string;
  status: string;
  priority: string;
  createdAt: string;
};

interface ReportsClientProps {
  quotes: QuoteData[];
  customers: CustomerData[];
  serviceOrders: ServiceOrderData[];
  products: ProductData[];
  tickets: TicketData[];
}

const MONTH_NAMES = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

function getMonthKey(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(key: string) {
  const [year, month] = key.split("-");
  return `${MONTH_NAMES[parseInt(month) - 1]} ${year.slice(2)}`;
}

function getLast6MonthKeys() {
  const today = new Date();
  const keys: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return keys;
}

export function ReportsClient({ quotes, customers, serviceOrders, products, tickets }: ReportsClientProps) {
  const last6Months = getLast6MonthKeys();

  // === SATIŞ RAPORU ===
  const salesByMonth = last6Months.map((key) => {
    const monthQuotes = quotes.filter((q) => getMonthKey(q.createdAt) === key);
    return {
      month: getMonthLabel(key),
      total: monthQuotes.reduce((sum, q) => sum + q.total, 0),
      count: monthQuotes.length,
    };
  });

  // === MÜŞTERİ RAPORU ===
  const top5Customers = [...customers]
    .sort((a, b) => b.totalQuoteValue - a.totalQuoteValue)
    .slice(0, 5)
    .map((c) => ({
      name: c.company ?? c.name,
      value: c.totalQuoteValue,
    }));

  const newCustomersByMonth = last6Months.map((key) => ({
    month: getMonthLabel(key),
    count: customers.filter((c) => getMonthKey(c.createdAt) === key).length,
  }));

  // === SERVİS RAPORU ===
  const serviceByType = Object.entries(
    serviceOrders.reduce<Record<string, number>>((acc, s) => {
      acc[s.type] = (acc[s.type] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const serviceByStatus = Object.entries(
    serviceOrders.reduce<Record<string, number>>((acc, s) => {
      acc[s.status] = (acc[s.status] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // === STOK RAPORU ===
  const lowStockItems = products.filter((p) => p.stockQuantity <= p.minStockLevel);

  const stockValueByCategory = Object.entries(
    products.reduce<Record<string, number>>((acc, p) => {
      const cat = p.category ?? "Diğer";
      acc[cat] = (acc[cat] ?? 0) + p.stockQuantity * p.unitPrice;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value: Math.round(value) }));

  // === DESTEK RAPORU ===
  const ticketsByStatus = Object.entries(
    tickets.reduce<Record<string, number>>((acc, t) => {
      acc[t.status] = (acc[t.status] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const ticketsByPriority = Object.entries(
    tickets.reduce<Record<string, number>>((acc, t) => {
      acc[t.priority] = (acc[t.priority] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 0 }).format(v);

  return (
    <Tabs defaultValue="satis">
      <TabsList className="flex flex-wrap gap-1 h-auto">
        <TabsTrigger value="satis">Satış</TabsTrigger>
        <TabsTrigger value="musteri">Müşteri</TabsTrigger>
        <TabsTrigger value="servis">Servis</TabsTrigger>
        <TabsTrigger value="stok">Stok</TabsTrigger>
        <TabsTrigger value="destek">Destek</TabsTrigger>
      </TabsList>

      {/* SATIŞ */}
      <TabsContent value="satis" className="space-y-4 mt-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-slate-900">
                {formatCurrency(quotes.reduce((s, q) => s + q.total, 0))}
              </div>
              <div className="text-sm text-slate-500">Toplam Teklif Değeri (6 ay)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-slate-900">{quotes.length}</div>
              <div className="text-sm text-slate-500">Toplam Teklif Sayısı (6 ay)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-slate-900">
                {formatCurrency(
                  quotes.length > 0
                    ? quotes.reduce((s, q) => s + q.total, 0) / quotes.length
                    : 0
                )}
              </div>
              <div className="text-sm text-slate-500">Ortalama Teklif Tutarı</div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Aylık Teklif Toplam Değeri</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), ""]} />
                <Legend />
                <Bar dataKey="total" name="Toplam (₺)" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Aylık Teklif Sayısı</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={salesByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" name="Teklif Sayısı" stroke="#3b82f6" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      {/* MÜŞTERİ */}
      <TabsContent value="musteri" className="space-y-4 mt-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>En Değerli 5 Müşteri</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={top5Customers} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), ""]} />
                  <Bar dataKey="value" name="Teklif Değeri (₺)" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Aylık Yeni Müşteri</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={newCustomersByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="Yeni Müşteri" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-900">{customers.length}</div>
            <div className="text-sm text-slate-500">Toplam Müşteri Sayısı</div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* SERVİS */}
      <TabsContent value="servis" className="space-y-4 mt-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Servis Tiplerine Göre</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={serviceByType}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {serviceByType.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Servis Durumlarına Göre</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={serviceByStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {serviceByStatus.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* STOK */}
      <TabsContent value="stok" className="space-y-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Kritik Stok Seviyeleri ({lowStockItems.length} ürün)</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-2 font-medium text-slate-700">Ürün</th>
                      <th className="text-left py-2 px-2 font-medium text-slate-700">Kategori</th>
                      <th className="text-right py-2 px-2 font-medium text-slate-700">Stok</th>
                      <th className="text-right py-2 px-2 font-medium text-slate-700">Min.</th>
                      <th className="text-left py-2 px-2 font-medium text-slate-700">Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockItems.map((p) => (
                      <tr key={p.id} className="border-b border-slate-100">
                        <td className="py-2 px-2 font-medium text-slate-900">{p.name}</td>
                        <td className="py-2 px-2 text-slate-500">{p.category ?? "-"}</td>
                        <td className="py-2 px-2 text-right font-medium text-rose-600">{p.stockQuantity}</td>
                        <td className="py-2 px-2 text-right text-slate-500">{p.minStockLevel}</td>
                        <td className="py-2 px-2">
                          <Badge variant="danger">Kritik</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Kritik stok seviyesinde ürün bulunmuyor.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Kategoriye Göre Stok Değeri</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stockValueByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), ""]} />
                <Bar dataKey="value" name="Stok Değeri (₺)" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      {/* DESTEK */}
      <TabsContent value="destek" className="space-y-4 mt-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Durumlara Göre Talepler</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={ticketsByStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {ticketsByStatus.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Önceliğe Göre Talepler</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={ticketsByPriority}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" name="Talep Sayısı" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-900">{tickets.length}</div>
            <div className="text-sm text-slate-500">Toplam Destek Talebi</div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
