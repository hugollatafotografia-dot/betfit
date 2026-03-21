"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/modules/auth/types";
import { canManageTenantRole, getActiveMembershipForUserId } from "@/modules/organizations/queries";
import { createSupabaseServerClient } from "@/services/supabase/server";
import { updateTeamMemberSchema } from "./schemas";
import type { TeamField } from "./types";

function getTextField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function updateTeamMemberAction(
  _prevState: FormState<TeamField>,
  formData: FormData,
): Promise<FormState<TeamField>> {
  const parsed = updateTeamMemberSchema.safeParse({
    memberId: getTextField(formData, "memberId"),
    role: getTextField(formData, "role"),
    status: getTextField(formData, "status"),
  });

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;

    return {
      status: "error",
      message: "Corrige los campos marcados.",
      fieldErrors: {
        memberId: errors.memberId?.[0],
        role: errors.role?.[0],
        status: errors.status?.[0],
      },
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const membershipContext = await getActiveMembershipForUserId(user.id, supabase);

  if (!membershipContext) {
    redirect("/onboarding");
  }

  if (!canManageTenantRole(membershipContext.membership.role)) {
    return {
      status: "error",
      message: "Solo los miembros propietario/admin pueden gestionar el equipo.",
      fieldErrors: {},
    };
  }

  const { data: targetMember, error: targetMemberError } = await supabase
    .from("organization_members")
    .select("id, organization_id, user_id, role, status")
    .eq("id", parsed.data.memberId)
    .eq("organization_id", membershipContext.organization.id)
    .maybeSingle();

  if (targetMemberError || !targetMember) {
    return {
      status: "error",
      message: "No se encontró el miembro para esta organización.",
      fieldErrors: {},
    };
  }

  const roleChanged = targetMember.role !== parsed.data.role;
  const statusChanged = targetMember.status !== parsed.data.status;

  if (!roleChanged && !statusChanged) {
    return {
      status: "error",
      message: "No hay cambios para guardar.",
      fieldErrors: {},
    };
  }

  const isSelfUpdate = targetMember.user_id === user.id;

  if (isSelfUpdate && roleChanged) {
    return {
      status: "error",
      message: "No puedes cambiar tu propio rol.",
      fieldErrors: {},
    };
  }

  if (isSelfUpdate && parsed.data.status !== "active") {
    return {
      status: "error",
      message: "No puedes cambiar tu estado ni desactivarte.",
      fieldErrors: {},
    };
  }

  const wouldRemoveActiveOwner =
    targetMember.role === "owner" &&
    targetMember.status === "active" &&
    (parsed.data.role !== "owner" || parsed.data.status !== "active");

  if (wouldRemoveActiveOwner) {
    const { count: activeOwnersCount, error: activeOwnersError } = await supabase
      .from("organization_members")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", membershipContext.organization.id)
      .eq("role", "owner")
      .eq("status", "active");

    if (activeOwnersError) {
      return {
        status: "error",
        message: "No se pudo validar la regla de propietarios activos.",
        fieldErrors: {},
      };
    }

    if ((activeOwnersCount ?? 0) <= 1) {
      return {
        status: "error",
        message: "La organización debe mantener al menos un propietario activo.",
        fieldErrors: {},
      };
    }
  }

  const { error: updateError } = await supabase
    .from("organization_members")
    .update({
      role: parsed.data.role,
      status: parsed.data.status,
    })
    .eq("id", targetMember.id)
    .eq("organization_id", membershipContext.organization.id);

  if (updateError) {
    return {
      status: "error",
      message: updateError.message,
      fieldErrors: {},
    };
  }

  if (roleChanged) {
    await supabase.from("audit_logs").insert({
      organization_id: membershipContext.organization.id,
      actor_user_id: user.id,
      action: "member_role_updated",
      entity_type: "organization_member",
      entity_id: targetMember.id,
      metadata: {
        target_user_id: targetMember.user_id,
        previous_role: targetMember.role,
        new_role: parsed.data.role,
      },
    });
  }

  if (statusChanged) {
    await supabase.from("audit_logs").insert({
      organization_id: membershipContext.organization.id,
      actor_user_id: user.id,
      action: "member_status_updated",
      entity_type: "organization_member",
      entity_id: targetMember.id,
      metadata: {
        target_user_id: targetMember.user_id,
        previous_status: targetMember.status,
        new_status: parsed.data.status,
      },
    });
  }

  revalidatePath("/app");
  revalidatePath("/app/team");
  redirect("/app/team?updated=1");
}
