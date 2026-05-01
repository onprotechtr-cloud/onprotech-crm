"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import trLocale from "@fullcalendar/core/locales/tr";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type EventInput = {
  id: string;
  title: string;
  start: string;
  end: string;
  color: string;
};

export function CalendarView({ events }: { events: EventInput[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Takvim Görünümü</CardTitle>
      </CardHeader>
      <CardContent>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth"
          locale={trLocale}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          }}
          height="auto"
          events={events}
          eventContent={(arg) => (
            <Link href={`/dashboard/randevular/${arg.event.id}`} className="block rounded-md px-1 py-0.5 text-xs font-medium text-white">
              {arg.timeText} {arg.event.title}
            </Link>
          )}
        />
      </CardContent>
    </Card>
  );
}