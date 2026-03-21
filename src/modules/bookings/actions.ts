"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/modules/auth/types";
import { canManageTenantRole, getActiveMembershipForUserId } from "@/modules/organizations/queries";
import { createSupabaseServerClient } from "@/services/supabase/server";
import { createBookingSchema } from "./schemas";
import type { BookingField } from "./types";

function getTextField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
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
      message: "Please fix the highlighted fields.",
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
      message: "Only owner/admin members can create bookings.",
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
      message: "Client or service is invalid for this tenant.",
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
