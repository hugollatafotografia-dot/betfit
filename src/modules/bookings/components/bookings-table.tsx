import Link from "next/link";
import type { BookingRow } from "@/modules/bookings/queries";
import { getBookingStatusLabel } from "@/modules/bookings/schemas";

type BookingsTableProps = {
  bookings: BookingRow[];
  clientsById: Map<string, string>;
  servicesById: Map<string, string>;
  canManage: boolean;
};

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

export function BookingsTable({
  bookings,
  clientsById,
  servicesById,
  canManage,
}: BookingsTableProps) {
  if (bookings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white/80 p-6 text-sm text-slate-600">
        No hay reservas todavía.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white/90">
      <table className="min-w-[920px] divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Cliente</th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Servicio</th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Inicio</th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Fin</th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Estado</th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Notas</th>
            {canManage && (
              <th className="px-4 py-3 text-left font-medium text-slate-600">Acciones</th>
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 bg-white">
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td className="px-4 py-3 text-slate-900">
                {clientsById.get(booking.client_id) ?? "-"}
              </td>
              <td className="px-4 py-3 text-slate-700">
                {servicesById.get(booking.service_id) ?? "-"}
              </td>
              <td className="px-4 py-3 text-slate-700">{formatDate(booking.starts_at)}</td>
              <td className="px-4 py-3 text-slate-700">{formatDate(booking.ends_at)}</td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                  {getBookingStatusLabel(booking.status)}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-700">{booking.notes ?? "-"}</td>
              {canManage && (
                <td className="px-4 py-3">
                  <Link
                    href={`/app/bookings?edit=${booking.id}`}
                    className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    Editar
                  </Link>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
