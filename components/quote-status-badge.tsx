import { QuoteStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  if (status === "ACCEPTED") return <Badge variant="success">Onaylandı</Badge>;
  if (status === "REJECTED") return <Badge variant="danger">Reddedildi</Badge>;
  if (status === "SENT") return <Badge variant="accent">Gönderildi</Badge>;
  return <Badge variant="warning">Taslak</Badge>;
}