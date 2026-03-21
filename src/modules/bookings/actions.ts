"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/modules/auth/types";
import { canManageTenantRole, getActiveMembershipForUserId } from "@/modules/organizations/queries";
import { createSupabaseServerClient } from "@/services/supabase/server";
import { createBookingSchema, updateBookingSchema } from "./schemas";
import type { BookingField } from "./types";

function getTextField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function createBookingAction(
  _prevState: FormState<BookingField>,
  formData: FormData,
): Promise<FormState<BookingField>> {
  const parsed = createBookingSchema.safeParse({
    clientId: getTextField(formData, "clientId"),
    serviceId: getTextField(formData, "serviceId"),
    status: getTextField(formData, "status"),
    startsAt: getTextField(formData, "startsAt"),
    endsAt: getTextField(formData, "endsAt"),
    notes: getTextField(formData, "notes"),
  });

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;

    return {
      status: "error",
      message: "Corrige los campos marcados.",
      fieldErrors: {
        clientId: errors.clientId?.[0],
        serviceId: errors.serviceId?.[0],
        status: errors.status?.[0],
        startsAt: errors.startsAt?.[0],
        endsAt: errors.endsAt?.[0],
        notes: errors.notes?.[0],
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
      message: "Solo los miembros propietario/admin pueden crear reservas.",
      fieldErrors: {},
    };
  }

  const [clientLookup, serviceLookup] = await Promise.all([
    supabase
      .from("clients")
      .select("id")
      .eq("id", parsed.data.clientId)
      .eq("organization_id", membershipContext.organization.id)
      .maybeSingle(),
    supabase
      .from("services")
      .select("id")
      .eq("id", parsed.data.serviceId)
      .eq("organization_id", membershipContext.organization.id)
      .maybeSingle(),
  ]);

  if (!clientLookup.data || !serviceLookup.data) {
    return {
      status: "error",
      message: "El cliente o servicio no es válido para esta organización.",
      fieldErrors: {},
    };
  }

  const { data: bookingRow, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      organization_id: membershipContext.organization.id,
      client_id: parsed.data.clientId,
      service_id: parsed.data.serviceId,
      status: parsed.data.status,
      starts_at: parsed.data.startsAt,
      ends_at: parsed.data.endsAt,
      notes: parsed.data.notes,
    })
    .select("id")
    .single();

  if (bookingError) {
    return {
      status: "error",
      message: bookingError.message,
      fieldErrors: {},
    };
  }

  await supabase.from("audit_logs").insert({
    organization_id: membershipContext.organization.id,
    actor_user_id: user.id,
    action: "booking_created",
    entity_type: "booking",
    entity_id: bookingRow.id,
    metadata: {
      status: parsed.data.status,
      starts_at: parsed.data.startsAt,
      ends_at: parsed.data.endsAt,
      client_id: parsed.data.clientId,
      service_id: parsed.data.serviceId,
    },
  });

  revalidatePath("/app");
  revalidatePath("/app/bookings");
  redirect("/app/bookings?created=1");
}

export async function updateBookingAction(
  _prevState: FormState<BookingField>,
  formData: FormData,
): Promise<FormState<BookingField>> {
  const bookingId = getTextField(formData, "bookingId").trim();

  const parsed = updateBookingSchema.safeParse({
    clientId: getTextField(formData, "clientId"),
    serviceId: getTextField(formData, "serviceId"),
    status: getTextField(formData, "status"),
    startsAt: getTextField(formData, "startsAt"),
    endsAt: getTextField(formData, "endsAt"),
    notes: getTextField(formData, "notes"),
  });

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;

    return {
      status: "error",
      message: "Corrige los campos marcados.",
      fieldErrors: {
        clientId: errors.clientId?.[0],
        serviceId: errors.serviceId?.[0],
        status: errors.status?.[0],
        startsAt: errors.startsAt?.[0],
        endsAt: errors.endsAt?.[0],
        notes: errors.notes?.[0],
      },
    };
  }

  if (!isUuid(bookingId)) {
    return {
      status: "error",
      message: "Reserva inválida.",
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
      message: "Solo los miembros propietario/admin pueden editar reservas.",
      fieldErrors: {},
    };
  }

  const [existingBooking, clientLookup, serviceLookup] = await Promise.all([
    supabase
      .from("bookings")
      .select("id")
      .eq("id", bookingId)
      .eq("organization_id", membershipContext.organization.id)
      .maybeSingle(),
    supabase
      .from("clients")
      .select("id")
      .eq("id", parsed.data.clientId)
      .eq("organization_id", membershipContext.organization.id)
      .maybeSingle(),
    supabase
      .from("services")
      .select("id")
      .eq("id", parsed.data.serviceId)
      .eq("organization_id", membershipContext.organization.id)
      .maybeSingle(),
  ]);

  if (!existingBooking.data) {
    return {
      status: "error",
      message: "No se encontró la reserva para esta organización.",
      fieldErrors: {},
    };
  }

  if (!clientLookup.data || !serviceLookup.data) {
    return {
      status: "error",
      message: "El cliente o servicio no es válido para esta organización.",
      fieldErrors: {},
    };
  }

  const { error: updateError } = await supabase
    .from("bookings")
    .update({
      client_id: parsed.data.clientId,
      service_id: parsed.data.serviceId,
      status: parsed.data.status,
      starts_at: parsed.data.startsAt,
      ends_at: parsed.data.endsAt,
      notes: parsed.data.notes,
    })
    .eq("id", bookingId)
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
    action: "booking_updated",
    entity_type: "booking",
    entity_id: bookingId,
    metadata: {
      status: parsed.data.status,
      starts_at: parsed.data.startsAt,
      ends_at: parsed.data.endsAt,
      client_id: parsed.data.clientId,
      service_id: parsed.data.serviceId,
    },
  });

  revalidatePath("/app");
  revalidatePath("/app/bookings");
  redirect("/app/bookings?updated=1");
}
