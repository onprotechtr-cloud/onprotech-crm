"use client";

import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Building, Phone, Mail, MapPin, FileText, Calendar } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  createdAt: Date;
  _count: { quotes: number; appointments: number };
}

export default function CustomerList({ customers }: { customers: Customer[] }) {
  return (
    <div className="divide-y divide-gray-100">
      {customers.map((c) => (
        <Link
          key={c.id}
          href={`/musteriler/${c.id}`}
          className="flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 transition-colors group"
        >
          <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-orange-600 font-semibold text-sm">
              {c.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 text-sm">{c.name}</span>
              {c.company && (
                <span className="text-xs text-gray-400 flex items-center gap-0.5">
                  <Building size={11} />
                  {c.company}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              {c.phone && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Phone size={11} />
                  {c.phone}
                </span>
              )}
              {c.email && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Mail size={11} />
                  {c.email}
                </span>
              )}
              {c.city && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <MapPin size={11} />
                  {c.city}
                </span>
              )}
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-900">{c._count.quotes}</div>
              <div className="text-xs text-gray-400 flex items-center gap-0.5">
                <FileText size={10} />Teklif
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-900">{c._count.appointments}</div>
              <div className="text-xs text-gray-400 flex items-center gap-0.5">
                <Calendar size={10} />Randevu
              </div>
            </div>
            <div className="text-xs text-gray-400">{formatDate(c.createdAt)}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
