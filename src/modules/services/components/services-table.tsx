import type { ServiceWithPrice } from "@/modules/services/queries";
import {
  getServiceBillingTypeLabel,
  getServiceIntervalLabel,
  getServiceStatusLabel,
  getServiceTypeLabel,
} from "@/modules/services/schemas";

type ServicesTableProps = {
  services: ServiceWithPrice[];
  canManage: boolean;
};

function formatPriceLabel(service: ServiceWithPrice): string {
  if (!service.latestPrice) {
    return "-";
  }

  const recurringSuffix =
    service.latestPrice.billing_type === "recurring" && service.latestPrice.interval
      ? ` / ${getServiceIntervalLabel(service.latestPrice.interval)}`
      : "";

  return `${service.latestPrice.price_amount} ${service.latestPrice.currency} (${getServiceBillingTypeLabel(service.latestPrice.billing_type)})${recurringSuffix}`;
}

export function ServicesTable({ services, canManage }: ServicesTableProps) {
  if (services.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white/80 p-6 text-sm text-slate-600">
        No hay servicios todavía.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white/90">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Nombre</th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Tipo</th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Estado</th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Duración</th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Precio</th>
            {canManage && (
              <th className="px-4 py-3 text-left font-medium text-slate-600">Acciones</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {services.map((item) => (
            <tr key={item.service.id}>
              <td className="px-4 py-3 text-slate-900">{item.service.name}</td>
              <td className="px-4 py-3 text-slate-700">
                {getServiceTypeLabel(item.service.service_type)}
              </td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                  {getServiceStatusLabel(item.service.status)}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-700">
                {item.service.duration_minutes ? `${item.service.duration_minutes} min` : "-"}
              </td>
              <td className="px-4 py-3 text-slate-700">{formatPriceLabel(item)}</td>
              {canManage && (
                <td className="px-4 py-3">
                  <a
                    href={`/app/services?edit=${encodeURIComponent(item.service.id)}`}
                    className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    Editar
                  </a>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
