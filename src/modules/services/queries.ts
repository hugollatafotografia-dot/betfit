import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/services/supabase/server";
import type { Database, TableRow } from "@/types/database";

type DatabaseClient = SupabaseClient<Database>;
export type ServiceRow = TableRow<"services">;
export type ServicePriceRow = TableRow<"service_prices">;

export type ServiceWithPrice = {
  service: ServiceRow;
  latestPrice: ServicePriceRow | null;
};

export async function listServicesWithLatestPriceByOrganizationId(
  organizationId: string,
  client?: DatabaseClient,
): Promise<ServiceWithPrice[]> {
  const supabase = client ?? (await createSupabaseServerClient());

  const { data: services, error: servicesError } = await supabase
    .from("services")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (servicesError || !services) {
    return [];
  }

  if (services.length === 0) {
    return [];
  }

  const serviceIds = services.map((service) => service.id);

  const { data: prices, error: pricesError } = await supabase
    .from("service_prices")
    .select("*")
    .eq("organization_id", organizationId)
    .in("service_id", serviceIds)
    .order("created_at", { ascending: false });

  const latestPriceByServiceId = new Map<string, ServicePriceRow>();

  if (!pricesError && prices) {
    for (const price of prices) {
      if (!latestPriceByServiceId.has(price.service_id)) {
        latestPriceByServiceId.set(price.service_id, price);
      }
    }
  }

  return services.map((service) => ({
    service,
    latestPrice: latestPriceByServiceId.get(service.id) ?? null,
  }));
}

export async function countServicesByOrganizationId(
  organizationId: string,
  client?: DatabaseClient,
): Promise<number> {
  const supabase = client ?? (await createSupabaseServerClient());

  const { count, error } = await supabase
    .from("services")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId);

  if (error) {
    return 0;
  }

  return count ?? 0;
}
