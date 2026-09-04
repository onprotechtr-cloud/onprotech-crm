"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import {
  BanknoteIcon,
  BarChart3,
  CalendarDays,
  ClipboardList,
  FileText,
  HeadphonesIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ReceiptText,
  RefreshCw,
  Settings,
  UserCheck,
  UserCog,
  Users,
  Wallet,
  Warehouse,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  roles?: string[];
  group?: string;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Genel Bakış", icon: LayoutDashboard },
  { href: "/dashboard/musteriler", label: "Müşteriler", icon: Users, roles: ["ADMIN", "SATIS"] },
  { href: "/dashboard/teklifler", label: "Teklifler", icon: ReceiptText, roles: ["ADMIN", "SATIS", "MUHASEBE"] },
  { href: "/dashboard/randevular", label: "Randevular", icon: CalendarDays, roles: ["ADMIN", "SATIS"] },
  { href: "/dashboard/teknik-servis", label: "Teknik Servis", icon: Wrench, roles: ["ADMIN", "SATIS", "TEKNISYEN"] },
  { href: "/dashboard/stok", label: "Stok Yönetimi", icon: Package, roles: ["ADMIN", "SATIS", "MUHASEBE", "TEKNISYEN"] },
  { href: "/dashboard/depolar", label: "Depo & Şube Yönetimi", icon: Warehouse, roles: ["ADMIN", "SATIS", "MUHASEBE", "TEKNISYEN"] },
  // Financial modules
  { href: "/dashboard/faturalar", label: "Faturalar", icon: FileText, roles: ["ADMIN", "MUHASEBE"], group: "Finans" },
  { href: "/dashboard/abonelikler", label: "Abonelikler", icon: RefreshCw, roles: ["ADMIN", "SATIS", "MUHASEBE"], group: "Finans" },
  { href: "/dashboard/kasa-banka", label: "Kasa ve Banka", icon: BanknoteIcon, roles: ["ADMIN", "MUHASEBE"], group: "Finans" },
  { href: "/dashboard/masraflar", label: "Masraf Merkezi", icon: Wallet, roles: ["ADMIN", "MUHASEBE"], group: "Finans" },
  // Phase 3B modules
  { href: "/dashboard/personel", label: "Personel Yönetimi", icon: UserCheck, roles: ["ADMIN"], group: "Yönetim" },
  { href: "/dashboard/kullanicilar", label: "Kullanıcılar", icon: UserCog, roles: ["ADMIN"], group: "Yönetim" },
  { href: "/dashboard/is-plani", label: "İş Planı", icon: ClipboardList, roles: ["ADMIN", "SATIS", "TEKNISYEN"], group: "Yönetim" },
  { href: "/dashboard/destek", label: "Destek Sistemi", icon: HeadphonesIcon, roles: ["ADMIN", "SATIS"], group: "Yönetim" },
  { href: "/dashboard/raporlar", label: "Raporlar", icon: BarChart3, roles: ["ADMIN", "MUHASEBE"], group: "Yönetim" },
  { href: "/dashboard/ayarlar", label: "Ayarlar", icon: Settings, roles: ["ADMIN"], group: "Yönetim" },
];

const roleLabel: Record<string, string> = {
  ADMIN: "Yönetici",
  SATIS: "Satış Uzmanı",
  MUHASEBE: "Muhasebe",
  TEKNISYEN: "Teknisyen",
};

function SidebarNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user?.role ?? "SATIS") as string;

  const visible = navItems.filter(
    (item) => !item.roles || item.roles.includes(role),
  );

  const coreItems = visible.filter((i) => !i.group);
  const financeItems = visible.filter((i) => i.group === "Finans");
  const mgmtItems = visible.filter((i) => i.group === "Yönetim");

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive =
      pathname === item.href ||
      (item.href !== "/dashboard" && pathname.startsWith(item.href));
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
          isActive ? "bg-white/15 text-white" : "text-slate-300 hover:bg-white/8 hover:text-white",
        )}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-8 flex-shrink-0">
        <div className="text-xs font-bold uppercase tracking-widest text-orange-400">ONPROTECH</div>
        <div className="mt-1 text-xl font-semibold text-white">CRM</div>
        <div className="mt-1 rounded-md bg-white/10 px-2 py-0.5 text-xs text-slate-300 inline-block">
          {roleLabel[role] ?? role}
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {coreItems.map(renderItem)}
        {financeItems.length > 0 && (
          <>
            <div className="mt-4 mb-1 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Finans
            </div>
            {financeItems.map(renderItem)}
          </>
        )}
        {mgmtItems.length > 0 && (
          <>
            <div className="mt-4 mb-1 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Yönetim
            </div>
            {mgmtItems.map(renderItem)}
          </>
        )}
      </nav>
      <div className="mt-4 flex-shrink-0 space-y-2">
        <div className="rounded-xl bg-white/5 px-3 py-2 text-xs text-slate-400">
          <div className="font-medium text-slate-300">{session?.user?.name}</div>
          <div className="truncate">{session?.user?.email}</div>
        </div>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/8 hover:text-white"
          onClick={() => signOut({ callbackUrl: "/giris" })}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          <span>Çıkış Yap</span>
        </button>
      </div>
    </div>
  );
}

export function DesktopSidebar() {
  return (
    <aside className="hidden w-64 flex-shrink-0 flex-col bg-primary px-5 py-8 lg:flex">
      <SidebarNav />
    </aside>
  );
}

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col bg-primary px-5 py-8">
        <SidebarNav />
      </SheetContent>
    </Sheet>
  );
}
