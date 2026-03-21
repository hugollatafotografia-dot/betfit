import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/services/supabase/server";
import type { Database, TableRow } from "@/types/database";

type DatabaseClient = SupabaseClient<Database>;
type OrganizationMembership = TableRow<"organization_members">;
type Organization = TableRow<"organizations">;

export type OrganizationMembershipContext = {
  membership: OrganizationMembership;
  organization: Organization;
};

export async function getActiveMembershipForUserId(
  userId: string,
  client?: DatabaseClient,
): Promise<OrganizationMembershipContext | null> {
  const supabase = client ?? (await createSupabaseServerClient());

  const { data: membership, error: membershipError } = await supabase
    .from("organization_members")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (membershipError || !membership) {
    return null;
  }

  const { data: organization, error: organizationError } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", membership.organization_id)
    .maybeSingle();

  if (organizationError || !organization) {
    return null;
  }

  return {
    membership,
    organization,
  };
}

export function canManageTenantRole(role: Database["public"]["Enums"]["member_role"]): boolean {
  return role === "owner" || role === "admin";
}

export async function getPostAuthRedirectPath(
  userId: string,
  client?: DatabaseClient,
): Promise<string> {
  const membershipContext = await getActiveMembershipForUserId(userId, client);
  return membershipContext ? "/app" : "/onboarding";
}
