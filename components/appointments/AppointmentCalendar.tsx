"use client";

import { useState, useRef, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import trLocale from "@fullcalendar/core/locales/tr";
import type { EventClickArg } from "@fullcalendar/core";
import type { DateClickArg } from "@fullcalendar/interaction";
import AppointmentModal from "./AppointmentModal";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  color: string;
  extendedProps: {
    status: string;
    location?: string | null;
    notes?: string | null;
    customerName?: string | null;
    customerCompany?: string | null;
  };
}

interface Customer {
  id: string;
  name: string;
  company: string | null;
}

interface AppointmentCalendarProps {
  events: CalendarEvent[];
  customers: Customer[];
}

export default function AppointmentCalendar({
  events,
  customers,
}: AppointmentCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const handleEventClick = useCallback((info: EventClickArg) => {
    const ev = info.event;
    setSelectedEvent({
      id: ev.id,
      title: ev.title,
      start: ev.startStr,
      end: ev.endStr,
      color: ev.backgroundColor ?? "#f97316",
      extendedProps: ev.extendedProps as CalendarEvent["extendedProps"],
    });
    setSelectedDate("");
    setModalOpen(true);
  }, []);

  const handleDateClick = useCallback((info: DateClickArg) => {
    setSelectedEvent(null);
    setSelectedDate(info.dateStr);
    setModalOpen(true);
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
      <style>{`
        .fc .fc-button { background: #f97316 !important; border-color: #f97316 !important; font-size: 12px !important; padding: 5px 10px !important; }
        .fc .fc-button:hover { background: #ea6c10 !important; }
        .fc .fc-button-active, .fc .fc-button:focus { background: #c2530f !important; box-shadow: none !important; }
        .fc-event { cursor: pointer; }
        .fc .fc-toolbar-title { font-size: 16px !important; font-weight: 700 !important; }
      `}</style>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView="dayGridMonth"
        locale={trLocale}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
        }}
        events={events}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        height="auto"
        eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
      />

      <AppointmentModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedEvent(null); }}
        event={selectedEvent}
        defaultDate={selectedDate}
        customers={customers}
      />

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" />
          Planlandı
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-green-600 inline-block" />
          Tamamlandı
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-600 inline-block" />
          İptal
        </span>
      </div>
    </div>
  );
}
