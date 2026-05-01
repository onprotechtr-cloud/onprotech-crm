import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDateShort } from "@/lib/utils";
import { updateWorkPlanStatus, deleteWorkPlan } from "@/lib/actions/is-plani-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

type WorkPlanWithRelations = {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  dueDate: Date | null;
  category: string | null;
  notes: string | null;
  assignedTo: { id: string; name: string | null } | null;
  customer: { id: string; name: string } | null;
};

function KanbanCard({
  plan,
  showMovePrev,
  showMoveNext,
  prevStatus,
  nextStatus,
}: {
  plan: WorkPlanWithRelations;
  showMovePrev: boolean;
  showMoveNext: boolean;
  prevStatus?: string;
  nextStatus?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:border-orange-200 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <Badge variant={priorityVariant[plan.priority] ?? "default"} className="text-xs">
          {priorityLabel[plan.priority] ?? plan.priority}
        </Badge>
        <div className="flex gap-1">
          {showMovePrev && prevStatus && (
            <form
              action={async () => {
                "use server";
                await updateWorkPlanStatus(plan.id, prevStatus);
              }}
            >
              <button
                type="submit"
                className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600 hover:bg-slate-200"
                title="Geri Al"
              >
                ←
              </button>
            </form>
          )}
          {showMoveNext && nextStatus && (
            <form
              action={async () => {
                "use server";
                await updateWorkPlanStatus(plan.id, nextStatus);
              }}
            >
              <button
                type="submit"
                className="rounded bg-orange-100 px-1.5 py-0.5 text-xs text-orange-600 hover:bg-orange-200"
                title="İlerle"
              >
                →
              </button>
            </form>
          )}
        </div>
      </div>
      <Link
        href={`/dashboard/is-plani/${plan.id}/duzenle`}
        className="text-sm font-semibold text-slate-900 hover:text-orange-600 line-clamp-2 block"
      >
        {plan.title}
      </Link>
      {plan.description && (
        <p className="mt-1 text-xs text-slate-500 line-clamp-2">{plan.description}</p>
      )}
      <div className="mt-2 flex flex-wrap gap-1 text-xs text-slate-400">
        {plan.assignedTo && <span className="font-medium text-slate-500">{plan.assignedTo.name}</span>}
        {plan.assignedTo && plan.dueDate && <span>·</span>}
        {plan.dueDate && <span>{formatDateShort(plan.dueDate)}</span>}
        {plan.customer && (
          <>
            <span>·</span>
            <span className="text-slate-400">{plan.customer.name}</span>
          </>
        )}
      </div>
    </div>
  );
}

export default async function IsPLaniPage({
  searchParams,
}: {
  searchParams: { user?: string; priority?: string };
}) {
  const [plans, users] = await Promise.all([
    prisma.workPlan.findMany({
      where: {
        ...(searchParams.user ? { assignedToId: searchParams.user } : {}),
        ...(searchParams.priority ? { priority: searchParams.priority as never } : {}),
      },
      include: {
        assignedTo: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const yapilacak = plans.filter((p) => p.status === "YAPILACAK");
  const devamEdiyor = plans.filter((p) => p.status === "DEVAM_EDIYOR");
  const tamamlandi = plans.filter((p) => p.status === "TAMAMLANDI");
  const iptal = plans.filter((p) => p.status === "IPTAL");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">İş Planı</h2>
          <p className="text-sm text-slate-500">Görevleri takip edin ve yönetin.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/is-plani/yeni">
            <Plus className="h-4 w-4" />
            Yeni Görev
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <form className="flex flex-wrap gap-3">
            <select
              name="user"
              defaultValue={searchParams.user ?? ""}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
            >
              <option value="">Tüm Kişiler</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
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
            <Link href="/dashboard/is-plani">
              <Button type="button" variant="outline" size="sm">Sıfırla</Button>
            </Link>
          </form>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Yapılacak */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-slate-400"></div>
            <h3 className="font-semibold text-slate-700">Yapılacak</h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {yapilacak.length}
            </span>
          </div>
          <div className="space-y-2 min-h-24">
            {yapilacak.map((plan) => (
              <KanbanCard
                key={plan.id}
                plan={plan}
                showMovePrev={false}
                showMoveNext={true}
                nextStatus="DEVAM_EDIYOR"
              />
            ))}
            {yapilacak.length === 0 && (
              <div className="rounded-lg border-2 border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
                Görev yok
              </div>
            )}
          </div>
        </div>

        {/* Devam Ediyor */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-orange-400"></div>
            <h3 className="font-semibold text-slate-700">Devam Ediyor</h3>
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-600">
              {devamEdiyor.length}
            </span>
          </div>
          <div className="space-y-2 min-h-24">
            {devamEdiyor.map((plan) => (
              <KanbanCard
                key={plan.id}
                plan={plan}
                showMovePrev={true}
                showMoveNext={true}
                prevStatus="YAPILACAK"
                nextStatus="TAMAMLANDI"
              />
            ))}
            {devamEdiyor.length === 0 && (
              <div className="rounded-lg border-2 border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
                Görev yok
              </div>
            )}
          </div>
        </div>

        {/* Tamamlandı */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-400"></div>
            <h3 className="font-semibold text-slate-700">Tamamlandı</h3>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-600">
              {tamamlandi.length}
            </span>
          </div>
          <div className="space-y-2 min-h-24">
            {tamamlandi.map((plan) => (
              <KanbanCard
                key={plan.id}
                plan={plan}
                showMovePrev={true}
                showMoveNext={false}
                prevStatus="DEVAM_EDIYOR"
              />
            ))}
            {tamamlandi.length === 0 && (
              <div className="rounded-lg border-2 border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
                Görev yok
              </div>
            )}
          </div>
        </div>
      </div>

      {/* İptal */}
      {iptal.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-slate-500">İptal Edilenler ({iptal.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {iptal.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-500"
                >
                  <span className="line-through">{plan.title}</span>
                  <div className="flex gap-2">
                    <form
                      action={async () => {
                        "use server";
                        await updateWorkPlanStatus(plan.id, "YAPILACAK");
                      }}
                    >
                      <button
                        type="submit"
                        className="text-xs text-orange-500 hover:underline"
                      >
                        Yeniden Aç
                      </button>
                    </form>
                    <form
                      action={async () => {
                        "use server";
                        await deleteWorkPlan(plan.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="text-xs text-rose-500 hover:underline"
                      >
                        Sil
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
