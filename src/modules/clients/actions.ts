"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/modules/auth/types";
import { canManageTenantRole, getActiveMembershipForUserId } from "@/modules/organizations/queries";
import { createSupabaseServerClient } from "@/services/supabase/server";
import { createClientSchema, updateClientSchema } from "./schemas";
import type { ClientField } from "./types";

function getTextField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function createClientAction(
  _prevState: FormState<ClientField>,
  formData: FormData,
): Promise<FormState<ClientField>> {
  const parsed = createClientSchema.safeParse({
    fullName: getTextField(formData, "fullName"),
    email: getTextField(formData, "email"),
    phone: getTextField(formData, "phone"),
    status: getTextField(formData, "status"),
  });

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;

    return {
      status: "error",
      message: "Corrige los campos marcados.",
      fieldErrors: {
        fullName: errors.fullName?.[0],
        email: errors.email?.[0],
        phone: errors.phone?.[0],
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
      message: "Solo los miembros propietario/admin pueden crear clientes.",
      fieldErrors: {},
    };
  }

  const { data: clientRow, error } = await supabase
    .from("clients")
    .insert({
      organization_id: membershipContext.organization.id,
      full_name: parsed.data.fullName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      status: parsed.data.status,
    })
    .select("id")
    .single();

  if (error) {
    return {
      status: "error",
      message: error.message,
      fieldErrors: {},
    };
  }

  await supabase.from("audit_logs").insert({
    organization_id: membershipContext.organization.id,
    actor_user_id: user.id,
    action: "client_created",
    entity_type: "client",
    entity_id: clientRow.id,
    metadata: {
      status: parsed.data.status,
      full_name: parsed.data.fullName,
    },
  });

  revalidatePath("/app");
  revalidatePath("/app/clients");
  redirect("/app/clients?created=1");
}

export async function updateClientAction(
  _prevState: FormState<ClientField>,
  formData: FormData,
): Promise<FormState<ClientField>> {
  const clientId = getTextField(formData, "clientId").trim();

  const parsed = updateClientSchema.safeParse({
    fullName: getTextField(formData, "fullName"),
    email: getTextField(formData, "email"),
    phone: getTextField(formData, "phone"),
    status: getTextField(formData, "status"),
  });

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;

    return {
      status: "error",
      message: "Corrige los campos marcados.",
      fieldErrors: {
        fullName: errors.fullName?.[0],
        email: errors.email?.[0],
        phone: errors.phone?.[0],
        status: errors.status?.[0],
      },
    };
  }

  if (
    !clientId ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(clientId)
  ) {
    return {
      status: "error",
      message: "Cliente inválido.",
      fieldErrors: {},
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
      message: "Solo los miembros propietario/admin pueden editar clientes.",
      fieldErrors: {},
    };
  }

  const { data: existingClient, error: existingClientError } = await supabase
    .from("clients")
    .select("id")
    .eq("id", clientId)
    .eq("organization_id", membershipContext.organization.id)
    .maybeSingle();

  if (existingClientError || !existingClient) {
    return {
      status: "error",
      message: "No se encontró el cliente para esta organización.",
      fieldErrors: {},
    };
  }

  const { error: updateError } = await supabase
    .from("clients")
    .update({
      full_name: parsed.data.fullName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      status: parsed.data.status,
    })
    .eq("id", clientId)
    .eq("organization_id", membershipContext.organization.id);

  if (updateError) {
    return {
      status: "error",
      message: updateError.message,
      fieldErrors: {},
    };
  }

  await supabase.from("audit_logs").insert({
    organization_id: membershipContext.organization.id,
    actor_user_id: user.id,
    action: "client_updated",
    entity_type: "client",
    entity_id: clientId,
    metadata: {
      status: parsed.data.status,
      full_name: parsed.data.fullName,
    },
  });

  revalidatePath("/app");
  revalidatePath("/app/clients");
  redirect("/app/clients?updated=1");
}
