import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/services/supabase/server";
import type { Database, TableRow } from "@/types/database";

type DatabaseClient = SupabaseClient<Database>;
export type ClientRow = TableRow<"clients">;

export async function listClientsByOrganizationId(
  organizationId: string,
  client?: DatabaseClient,
): Promise<ClientRow[]> {
  const supabase = client ?? (await createSupabaseServerClient());

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data;
}

export async function countClientsByOrganizationId(
  organizationId: string,
  client?: DatabaseClient,
): Promise<number> {
  const supabase = client ?? (await createSupabaseServerClient());

  const { count, error } = await supabase
    .from("clients")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId);

  if (error) {
    return 0;
  }

  return count ?? 0;
}
