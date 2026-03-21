import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/services/supabase/server";
import type { Database, TableRow } from "@/types/database";

type DatabaseClient = SupabaseClient<Database>;
export type BookingRow = TableRow<"bookings">;

export type BookingClientOption = {
  id: string;
  fullName: string;
};

export type BookingServiceOption = {
  id: string;
  name: string;
  status: Database["public"]["Enums"]["service_status"];
};

export async function listBookingsByOrganizationId(
  organizationId: string,
  client?: DatabaseClient,
): Promise<BookingRow[]> {
  const supabase = client ?? (await createSupabaseServerClient());

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("organization_id", organizationId)
    .order("starts_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data;
}

export async function countBookingsByOrganizationId(
  organizationId: string,
  client?: DatabaseClient,
): Promise<number> {
  const supabase = client ?? (await createSupabaseServerClient());

  const { count, error } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId);

  if (error) {
    return 0;
  }

  return count ?? 0;
}

export async function listBookingClientOptionsByOrganizationId(
  organizationId: string,
  client?: DatabaseClient,
): Promise<BookingClientOption[]> {
  const supabase = client ?? (await createSupabaseServerClient());

  const { data, error } = await supabase
    .from("clients")
    .select("id, full_name")
    .eq("organization_id", organizationId)
    .order("full_name", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map((item) => ({
    id: item.id,
    fullName: item.full_name,
  }));
}

export async function listBookingServiceOptionsByOrganizationId(
  organizationId: string,
  client?: DatabaseClient,
): Promise<BookingServiceOption[]> {
  const supabase = client ?? (await createSupabaseServerClient());

  const { data, error } = await supabase
    .from("services")
    .select("id, name, status")
    .eq("organization_id", organizationId)
    .order("name", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data;
}
