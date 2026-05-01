"use client";

import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";

export function Calendar({
  className,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      locale={tr}
      className={cn("rounded-xl border border-slate-200 bg-white p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-slate-500 rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative",
        day: "h-9 w-9 p-0 font-normal rounded-md hover:bg-slate-100",
        day_selected: "bg-primary text-white hover:bg-primary",
        day_today: "bg-orange-100 text-orange-700",
      }}
      {...props}
    />
  );
}