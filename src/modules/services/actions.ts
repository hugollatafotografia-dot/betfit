"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/modules/auth/types";
import type { ServicePriceRow } from "@/modules/services/queries";
import { canManageTenantRole, getActiveMembershipForUserId } from "@/modules/organizations/queries";
import { createSupabaseServerClient } from "@/services/supabase/server";
import type { Json } from "@/types/database";
import { createServiceSchema, updateServiceSchema } from "./schemas";
import type { ServiceField } from "./types";

function getTextField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function hasPriceChanged(
  currentPrice: ServicePriceRow | null,
  nextPrice: {
    priceAmount: number;
    currency: string;
    billingType: ServicePriceRow["billing_type"];
    interval: ServicePriceRow["interval"];
  },
): boolean {
  if (!currentPrice) {
    return true;
  }

  return (
    currentPrice.price_amount !== nextPrice.priceAmount ||
    currentPrice.currency !== nextPrice.currency ||
    currentPrice.billing_type !== nextPrice.billingType ||
    (currentPrice.interval ?? null) !== (nextPrice.interval ?? null)
  );
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
      message: "Corrige los campos marcados.",
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
      message: "Solo los miembros propietario/admin pueden crear servicios.",
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

export async function updateServiceAction(
  _prevState: FormState<ServiceField>,
  formData: FormData,
): Promise<FormState<ServiceField>> {
  const serviceId = getTextField(formData, "serviceId").trim();

  const parsed = updateServiceSchema.safeParse({
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
      message: "Corrige los campos marcados.",
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

  if (!isUuid(serviceId)) {
    return {
      status: "error",
      message: "Servicio inválido.",
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
      message: "Solo los miembros propietario/admin pueden editar servicios.",
      fieldErrors: {},
    };
  }

  const { data: existingService, error: existingServiceError } = await supabase
    .from("services")
    .select("id")
    .eq("id", serviceId)
    .eq("organization_id", membershipContext.organization.id)
    .maybeSingle();

  if (existingServiceError || !existingService) {
    return {
      status: "error",
      message: "No se encontró el servicio para esta organización.",
      fieldErrors: {},
    };
  }

  const { error: updateError } = await supabase
    .from("services")
    .update({
      name: parsed.data.name,
      description: parsed.data.description,
      service_type: parsed.data.serviceType,
      status: parsed.data.status,
      duration_minutes: parsed.data.durationMinutes,
    })
    .eq("id", serviceId)
    .eq("organization_id", membershipContext.organization.id);

  if (updateError) {
    return {
      status: "error",
      message: updateError.message,
      fieldErrors: {},
    };
  }

  const { data: currentPrice, error: currentPriceError } = await supabase
    .from("service_prices")
    .select("*")
    .eq("organization_id", membershipContext.organization.id)
    .eq("service_id", serviceId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (currentPriceError) {
    return {
      status: "error",
      message: currentPriceError.message,
      fieldErrors: {},
    };
  }

  const mustCreatePrice = hasPriceChanged(currentPrice, {
    priceAmount: parsed.data.priceAmount,
    currency: parsed.data.currency,
    billingType: parsed.data.billingType,
    interval: parsed.data.interval,
  });

  let createdPriceId: string | null = null;

  if (mustCreatePrice) {
    const { data: createdPrice, error: createdPriceError } = await supabase
      .from("service_prices")
      .insert({
        service_id: serviceId,
        organization_id: membershipContext.organization.id,
        price_amount: parsed.data.priceAmount,
        currency: parsed.data.currency,
        billing_type: parsed.data.billingType,
        interval: parsed.data.interval,
      })
      .select("id")
      .single();

    if (createdPriceError) {
      return {
        status: "error",
        message: createdPriceError.message,
        fieldErrors: {},
      };
    }

    createdPriceId = createdPrice.id;
  }

  const auditEntries: Array<{
    organization_id: string;
    actor_user_id: string;
    action: string;
    entity_type: string;
    entity_id: string;
    metadata: Json;
  }> = [
    {
      organization_id: membershipContext.organization.id,
      actor_user_id: user.id,
      action: "service_updated",
      entity_type: "service",
      entity_id: serviceId,
      metadata: {
        status: parsed.data.status,
        service_type: parsed.data.serviceType,
        duration_minutes: parsed.data.durationMinutes,
      },
    },
  ];

  if (mustCreatePrice && createdPriceId) {
    auditEntries.push({
      organization_id: membershipContext.organization.id,
      actor_user_id: user.id,
      action: "service_price_created",
      entity_type: "service_price",
      entity_id: createdPriceId,
      metadata: {
        billing_type: parsed.data.billingType,
        interval: parsed.data.interval,
        currency: parsed.data.currency,
        price_amount: parsed.data.priceAmount,
      },
    });
  }

  await supabase.from("audit_logs").insert(auditEntries);

  revalidatePath("/app");
  revalidatePath("/app/services");
  redirect("/app/services?updated=1");
}
