import type { ServiceWithPrice } from "@/modules/services/queries";

type ServicesTableProps = {
  services: ServiceWithPrice[];
};

function formatPriceLabel(service: ServiceWithPrice): string {
  if (!service.latestPrice) {
    return "-";
  }

  const recurringSuffix =
    service.latestPrice.billing_type === "recurring" && service.latestPrice.interval
      ? ` / ${service.latestPrice.interval}`
      : "";

  return `${service.latestPrice.price_amount} ${service.latestPrice.currency}${recurringSuffix}`;
}

export function ServicesTable({ services }: ServicesTableProps) {
  if (services.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white/80 p-6 text-sm text-slate-600">
        No services yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white/90">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Type</th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Duration</th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Price</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {services.map((item) => (
            <tr key={item.service.id}>
              <td className="px-4 py-3 text-slate-900">{item.service.name}</td>
              <td className="px-4 py-3 text-slate-700">{item.service.service_type}</td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                  {item.service.status}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-700">
                {item.service.duration_minutes ? `${item.service.duration_minutes} min` : "-"}
              </td>
              <td className="px-4 py-3 text-slate-700">{formatPriceLabel(item)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
