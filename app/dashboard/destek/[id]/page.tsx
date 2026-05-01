import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatDateShort } from "@/lib/utils";
import {
  addTicketMessage,
  updateTicketStatus,
  assignTicket,
} from "@/lib/actions/destek-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

export default async function TicketDetayPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const sessionUserId = (session?.user as { id?: string })?.id ?? "";

  const [ticket, users] = await Promise.all([
    prisma.ticket.findUnique({
      where: { id: params.id },
      include: {
        customer: { select: { id: true, name: true, company: true } },
        createdBy: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: { select: { id: true, name: true } },
          },
        },
      },
    }),
    prisma.user.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!ticket) {
    notFound();
  }

  const addMessageWithId = addTicketMessage.bind(null, params.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-mono text-xs text-slate-500">{ticket.ticketNumber}</span>
            <Badge variant={ticketStatusVariant[ticket.status] ?? "default"}>
              {ticketStatusLabel[ticket.status] ?? ticket.status}
            </Badge>
            <Badge variant={priorityVariant[ticket.priority] ?? "default"}>
              {priorityLabel[ticket.priority] ?? ticket.priority}
            </Badge>
          </div>
          <h2 className="text-2xl font-semibold text-slate-900">{ticket.subject}</h2>
          <p className="text-sm text-slate-500">
            {ticket.customer.name}
            {ticket.customer.company ? ` · ${ticket.customer.company}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/destek">
            <Button variant="outline" size="sm">← Geri</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Messages Thread */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mesajlar ({ticket.messages.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ticket.messages.map((msg) => {
                const isOwn = msg.senderId === sessionUserId;
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                  >
                    <div className="h-8 w-8 flex-shrink-0 rounded-full bg-orange-100 flex items-center justify-center text-xs font-semibold text-orange-700">
                      {(msg.sender.name ?? "?").charAt(0).toUpperCase()}
                    </div>
                    <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col gap-1`}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-700">{msg.sender.name}</span>
                        {msg.isInternal && (
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700 font-medium">
                            İç Not
                          </span>
                        )}
                        <span className="text-xs text-slate-400">{formatDateShort(msg.createdAt)}</span>
                      </div>
                      <div
                        className={`rounded-lg px-3 py-2 text-sm ${
                          msg.isInternal
                            ? "bg-amber-50 border border-amber-200 text-amber-900"
                            : isOwn
                            ? "bg-orange-500 text-white"
                            : "bg-slate-100 text-slate-900"
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  </div>
                );
              })}
              {ticket.messages.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">Henüz mesaj yok.</p>
              )}
            </CardContent>
          </Card>

          {/* Reply Form */}
          {ticket.status !== "KAPANDI" && (
            <Card>
              <CardHeader>
                <CardTitle>Yanıt Yaz</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={addMessageWithId} className="space-y-3">
                  <textarea
                    name="message"
                    required
                    rows={4}
                    placeholder="Mesajınızı yazın..."
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                  />
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="isInternal"
                        id="isInternal"
                        className="h-4 w-4 rounded border-slate-300 text-amber-500"
                      />
                      <label htmlFor="isInternal" className="text-sm text-slate-600">
                        İç Not (müşteri göremez)
                      </label>
                    </div>
                    <Button type="submit">Gönder</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Ticket Info */}
          <Card>
            <CardHeader>
              <CardTitle>Talep Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Müşteri</span>
                <Link
                  href={`/dashboard/musteriler/${ticket.customerId}`}
                  className="font-medium text-orange-600 hover:underline"
                >
                  {ticket.customer.name}
                </Link>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Oluşturan</span>
                <span className="font-medium">{ticket.createdBy.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kategori</span>
                <span>{ticket.category ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Oluşturulma</span>
                <span>{formatDateShort(ticket.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Atanan</span>
                <span>{ticket.assignedTo?.name ?? "Atanmadı"}</span>
              </div>
            </CardContent>
          </Card>

          {/* Status Update */}
          <Card>
            <CardHeader>
              <CardTitle>Durumu Güncelle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(["ACIK", "YANIT_BEKLENIYOR", "COZULDU", "KAPANDI"] as const).map((status) => (
                <form
                  key={status}
                  action={async () => {
                    "use server";
                    await updateTicketStatus(params.id, status);
                  }}
                >
                  <button
                    type="submit"
                    disabled={ticket.status === status}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      ticket.status === status
                        ? "bg-orange-500 text-white font-medium cursor-default"
                        : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {ticketStatusLabel[status]}
                  </button>
                </form>
              ))}
            </CardContent>
          </Card>

          {/* Assign */}
          <Card>
            <CardHeader>
              <CardTitle>Ekip Üyesine Ata</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                action={async (formData: FormData) => {
                  "use server";
                  const assignedToId = formData.get("assignedToId") as string;
                  await assignTicket(params.id, assignedToId);
                }}
                className="space-y-2"
              >
                <select
                  name="assignedToId"
                  defaultValue={ticket.assignedToId ?? ""}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
                >
                  <option value="">Atanmamış</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
                <Button type="submit" size="sm" className="w-full">Ata</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
