import Link from "next/link";
import type { ClientRow } from "@/modules/clients/queries";
import { getClientStatusLabel } from "@/modules/clients/schemas";

type ClientsTableProps = {
  clients: ClientRow[];
  canManage: boolean;
};

export function ClientsTable({ clients, canManage }: ClientsTableProps) {
  if (clients.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white/80 p-6 text-sm text-slate-600">
        No hay clientes todavía.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white/90">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Nombre</th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Correo</th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Teléfono</th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Estado</th>
            {canManage && (
              <th className="px-4 py-3 text-left font-medium text-slate-600">Acciones</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {clients.map((client) => (
            <tr key={client.id}>
              <td className="px-4 py-3 text-slate-900">{client.full_name}</td>
              <td className="px-4 py-3 text-slate-700">{client.email ?? "-"}</td>
              <td className="px-4 py-3 text-slate-700">{client.phone ?? "-"}</td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                  {getClientStatusLabel(client.status)}
                </span>
              </td>
              {canManage && (
                <td className="px-4 py-3">
                  <Link
                    href={`/app/clients?edit=${client.id}`}
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
