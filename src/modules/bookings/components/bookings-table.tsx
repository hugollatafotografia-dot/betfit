import type { BookingRow } from "@/modules/bookings/queries";

type BookingsTableProps = {
  bookings: BookingRow[];
  clientsById: Map<string, string>;
  servicesById: Map<string, string>;
};

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

export function BookingsTable({ bookings, clientsById, servicesById }: BookingsTableProps) {
  if (bookings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white/80 p-6 text-sm text-slate-600">
        No bookings yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white/90">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Client</th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Service</th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Starts</th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Ends</th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Notes</th>
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
                  {booking.status}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-700">{booking.notes ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
