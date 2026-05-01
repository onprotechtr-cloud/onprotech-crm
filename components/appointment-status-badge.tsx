import { AppointmentStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  if (status === "COMPLETED") return <Badge variant="success">Tamamlandı</Badge>;
  if (status === "CANCELLED") return <Badge variant="danger">İptal Edildi</Badge>;
  return <Badge variant="accent">Planlandı</Badge>;
}