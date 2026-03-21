"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/modules/auth/types";
import { canManageTenantRole, getActiveMembershipForUserId } from "@/modules/organizations/queries";
import { createSupabaseServerClient } from "@/services/supabase/server";
import { createServiceSchema } from "./schemas";
import type { ServiceField } from "./types";

function getTextField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function createServiceAction(
  _prevState: FormState<ServiceField>,
  formData: FormData,
): Promise<FormState<ServiceField>> {
  const parsed = createServiceSchema.safeParse({
    name: getTextField(formData, "name"),
    description: getTextField(formData, "description"),
    serviceType: getTextField(formData, "serviceType"),
    status: getTextField(formData, "status"),
    durationMinutes: getTextField(formData, "durationMinutes"),
    priceAmount: getTextField(formData, "priceAmount"),
    currency: getTextField(formData, "currency"),
    billingType: getTextField(formData, "billingType"),
    interval: getTextField(formData, "interval"),
  });

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;

    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors: {
        name: errors.name?.[0],
        description: errors.description?.[0],
        serviceType: errors.serviceType?.[0],
        status: errors.status?.[0],
        durationMinutes: errors.durationMinutes?.[0],
        priceAmount: errors.priceAmount?.[0],
        currency: errors.currency?.[0],
        billingType: errors.billingType?.[0],
        interval: errors.interval?.[0],
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
      message: "Only owner/admin members can create services.",
      fieldErrors: {},
    };
  }

  const { data: serviceRow, error: serviceError } = await supabase
    .from("services")
    .insert({
      organization_id: membershipContext.organization.id,
      name: parsed.data.name,
      description: parsed.data.description,
      service_type: parsed.data.serviceType,
      status: parsed.data.status,
      duration_minutes: parsed.data.durationMinutes,
    })
    .select("id")
    .single();

  if (serviceError) {
    return {
      status: "error",
      message: serviceError.message,
      fieldErrors: {},
    };
  }

  const { data: priceRow, error: priceError } = await supabase
    .from("service_prices")
    .insert({
      service_id: serviceRow.id,
      organization_id: membershipContext.organization.id,
      price_amount: parsed.data.priceAmount,
      currency: parsed.data.currency,
      billing_type: parsed.data.billingType,
      interval: parsed.data.interval,
    })
    .select("id")
    .single();

  if (priceError) {
    await supabase.from("services").delete().eq("id", serviceRow.id);

    return {
      status: "error",
      message: priceError.message,
      fieldErrors: {},
    };
  }

  await supabase.from("audit_logs").insert([
    {
      organization_id: membershipContext.organization.id,
      actor_user_id: user.id,
      action: "service_created",
      entity_type: "service",
      entity_id: serviceRow.id,
      metadata: {
        status: parsed.data.status,
        service_type: parsed.data.serviceType,
      },
    },
    {
      organization_id: membershipContext.organization.id,
      actor_user_id: user.id,
      action: "service_price_created",
      entity_type: "service_price",
      entity_id: priceRow.id,
      metadata: {
        billing_type: parsed.data.billingType,
        interval: parsed.data.interval,
        currency: parsed.data.currency,
        price_amount: parsed.data.priceAmount,
      },
    },
  ]);

  revalidatePath("/app");
  revalidatePath("/app/services");
  redirect("/app/services?created=1");
}
