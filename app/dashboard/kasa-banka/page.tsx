import Link from "next/link";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { getCashAccounts, getDashboardCashStats } from "@/lib/actions/cashbank-actions";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/dashboard/kpi-card";

export default async function CashBankPage() {
  const [accounts, stats] = await Promise.all([getCashAccounts(), getDashboardCashStats()]);

  const kasaAccounts = accounts.filter((a) => a.type === "KASA");
  const bankaAccounts = accounts.filter((a) => a.type === "BANKA");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Kasa ve Banka</h2>
          <p className="text-sm text-slate-500">Nakit ve banka hesaplarını yönetin, işlemleri takip edin.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/kasa-banka/yeni">
            <Plus className="h-4 w-4" />Yeni Hesap
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Toplam Kasa" value={formatCurrency(stats.totalKasa)} description="Nakit kasa toplamı" />
        <KpiCard title="Toplam Banka" value={formatCurrency(stats.totalBanka)} description="Banka hesapları toplamı" />
        <KpiCard title="Bugün Gelir" value={formatCurrency(stats.todayIncome)} description="Günlük tahsilat" />
        <KpiCard title="Bugün Gider" value={formatCurrency(stats.todayExpense)} description="Günlük ödeme" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Kasalar</h3>
          {kasaAccounts.length === 0 ? (
            <p className="text-sm text-slate-500">Kasa hesabı bulunmuyor.</p>
          ) : (
            kasaAccounts.map((acc) => (
              <Link key={acc.id} href={`/dashboard/kasa-banka/${acc.id}`}>
                <Card className="hover:border-orange-300 transition-colors cursor-pointer">
                  <CardContent className="flex items-center justify-between pt-4">
                    <div>
                      <p className="font-semibold text-slate-900">{acc.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="default">Kasa</Badge>
                        <span className="text-xs text-slate-500">{acc._count.transactions} işlem</span>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-slate-900">{formatCurrency(acc.balance, acc.currency)}</p>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Banka Hesapları</h3>
          {bankaAccounts.length === 0 ? (
            <p className="text-sm text-slate-500">Banka hesabı bulunmuyor.</p>
          ) : (
            bankaAccounts.map((acc) => (
              <Link key={acc.id} href={`/dashboard/kasa-banka/${acc.id}`}>
                <Card className="hover:border-orange-300 transition-colors cursor-pointer">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{acc.name}</p>
                        {acc.bankName && <p className="text-sm text-slate-500">{acc.bankName}</p>}
                        {acc.iban && <p className="text-xs text-slate-400 font-mono mt-1">{acc.iban}</p>}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="default">Banka</Badge>
                          <span className="text-xs text-slate-500">{acc._count.transactions} işlem</span>
                        </div>
                      </div>
                      <p className="text-xl font-bold text-slate-900">{formatCurrency(acc.balance, acc.currency)}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Toplam Bakiye</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-slate-600">Kasa + Banka Toplamı</span>
            </div>
            <span className="text-2xl font-bold text-slate-900">
              {formatCurrency(stats.totalKasa + stats.totalBanka)}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span>Bugün Gelen: {formatCurrency(stats.todayIncome)}</span>
            </div>
            <div className="flex items-center gap-2 text-rose-600">
              <TrendingDown className="h-4 w-4" />
              <span>Bugün Giden: {formatCurrency(stats.todayExpense)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
