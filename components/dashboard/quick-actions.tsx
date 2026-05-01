import Link from "next/link";
import { CalendarPlus2, ReceiptText, UserPlus2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hızlı İşlemler</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-3">
        <Button asChild className="justify-start">
          <Link href="/dashboard/teklifler/yeni">
            <ReceiptText className="h-4 w-4" />
            Yeni Teklif
          </Link>
        </Button>
        <Button asChild variant="outline" className="justify-start">
          <Link href="/dashboard/randevular/yeni">
            <CalendarPlus2 className="h-4 w-4" />
            Yeni Randevu
          </Link>
        </Button>
        <Button asChild variant="outline" className="justify-start">
          <Link href="/dashboard/musteriler/yeni">
            <UserPlus2 className="h-4 w-4" />
            Yeni Müşteri
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}