"use server";

import { redirect } from "next/navigation";
import type { FormState } from "@/modules/auth/types";
import { createSupabaseServerClient } from "@/services/supabase/server";
import { appendSlugSuffix, slugifyOrganizationName } from "./slug";
import { getActiveMembershipForUserId } from "./queries";
import { onboardingSchema } from "./schemas";
import type { OnboardingField } from "./types";

const MAX_SLUG_ATTEMPTS = 5;

function getTextField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function createOrganizationAction(
  _prevState: FormState<OnboardingField>,
  formData: FormData,
): Promise<FormState<OnboardingField>> {
  const parsed = onboardingSchema.safeParse({
    name: getTextField(formData, "name"),
    vertical: getTextField(formData, "vertical"),
  });

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;

    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors: {
        name: errors.name?.[0],
        vertical: errors.vertical?.[0],
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

  const existingMembership = await getActiveMembershipForUserId(user.id, supabase);

  if (existingMembership) {
    redirect("/app");
  }

  const baseSlug = slugifyOrganizationName(parsed.data.name);

  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt += 1) {
    const candidateSlug = attempt === 0 ? baseSlug : appendSlugSuffix(baseSlug);

    const { error } = await supabase.rpc("create_organization_with_owner", {
      p_name: parsed.data.name,
      p_slug: candidateSlug,
      p_vertical: parsed.data.vertical,
    });

    if (!error) {
      redirect("/app");
    }

    if (error.message.includes("USER_ALREADY_ONBOARDED")) {
      redirect("/app");
    }

    if (error.code !== "23505") {
      return {
        status: "error",
        message: "Unable to create the organization. Please try again.",
        fieldErrors: {},
      };
    }
  }

  return {
    status: "error",
    message: "Could not generate a unique organization slug. Please try again.",
    fieldErrors: {},
  };
}
