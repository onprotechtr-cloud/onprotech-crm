import { Bell, Search } from "lucide-react";
import { MobileSidebar } from "@/components/dashboard/sidebar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function DashboardHeader({ userName }: { userName: string }) {
  return (
    <header className="flex flex-col gap-4 border-b border-slate-200 bg-white px-4 py-4 md:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <MobileSidebar />
          <div>
            <p className="text-sm text-slate-500">Hoş geldin</p>
            <h1 className="text-xl font-semibold text-slate-900">{userName}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="accent">ONPROTECH CRM Faz 1</Badge>
          <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 md:flex">
            <Bell className="h-4 w-4" />
          </div>
        </div>
      </div>
      <div className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input className="pl-10" placeholder="Müşteri, teklif veya randevu ara..." />
      </div>
    </header>
  );
}