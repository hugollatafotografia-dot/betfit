import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/services/supabase/server";
import type { Database, TableRow } from "@/types/database";

type DatabaseClient = SupabaseClient<Database>;
type OrganizationMemberRow = TableRow<"organization_members">;

export type TeamMemberListItem = {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationMemberRow["role"];
  status: OrganizationMemberRow["status"];
  createdAt: string;
  fullName: string | null;
  email: string | null;
};

export async function listTeamMembersByOrganizationId(
  organizationId: string,
  client?: DatabaseClient,
): Promise<TeamMemberListItem[]> {
  const supabase = client ?? (await createSupabaseServerClient());

  const { data: members, error: membersError } = await supabase
    .from("organization_members")
    .select("id, organization_id, user_id, role, status, created_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: true });

  if (membersError || !members) {
    return [];
  }

  if (members.length === 0) {
    return [];
  }

  const uniqueUserIds = Array.from(new Set(members.map((item) => item.user_id)));

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", uniqueUserIds);

  const profileById = new Map<string, { fullName: string | null; email: string | null }>();

  if (!profilesError && profiles) {
    for (const profile of profiles) {
      profileById.set(profile.id, {
        fullName: profile.full_name,
        email: profile.email,
      });
    }
  }

  return members.map((member) => {
    const profile = profileById.get(member.user_id);

    return {
      id: member.id,
      organizationId: member.organization_id,
      userId: member.user_id,
      role: member.role,
      status: member.status,
      createdAt: member.created_at,
      fullName: profile?.fullName ?? null,
      email: profile?.email ?? null,
    };
  });
}

export async function countTeamMembersByOrganizationId(
  organizationId: string,
  client?: DatabaseClient,
): Promise<number> {
  const supabase = client ?? (await createSupabaseServerClient());

  const { count, error } = await supabase
    .from("organization_members")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId);

  if (error) {
    return 0;
  }

  return count ?? 0;
}
