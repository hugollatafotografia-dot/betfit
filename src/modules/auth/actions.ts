"use server";

import { redirect } from "next/navigation";
import { getPostAuthRedirectPath } from "@/modules/organizations/queries";
import { createSupabaseServerClient } from "@/services/supabase/server";
import { getSafeAuthErrorMessage } from "./errors";
import { loginSchema, signupSchema } from "./schemas";
import type { FormState, LoginField, SignupField } from "./types";

function getTextField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function loginAction(
  _prevState: FormState<LoginField>,
  formData: FormData,
): Promise<FormState<LoginField>> {
  const parsed = loginSchema.safeParse({
    email: getTextField(formData, "email"),
    password: getTextField(formData, "password"),
  });

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;

    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors: {
        email: errors.email?.[0],
        password: errors.password?.[0],
      },
    };
  }

  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error || !data.user) {
      return {
        status: "error",
        message: error?.message ?? "Invalid credentials.",
        fieldErrors: {},
      };
    }

    await supabase.from("audit_logs").insert({
      actor_user_id: data.user.id,
      organization_id: null,
      action: "login_completed",
      entity_type: "auth_user",
      entity_id: data.user.id,
      metadata: {},
    });

    const destination = await getPostAuthRedirectPath(data.user.id, supabase);
    redirect(destination);
  } catch (error: unknown) {
    console.error("loginAction failed:", error);
    return {
      status: "error",
      message: getSafeAuthErrorMessage(error),
      fieldErrors: {},
    };
  }
}

export async function signupAction(
  _prevState: FormState<SignupField>,
  formData: FormData,
): Promise<FormState<SignupField>> {
  const parsed = signupSchema.safeParse({
    fullName: getTextField(formData, "fullName"),
    email: getTextField(formData, "email"),
    password: getTextField(formData, "password"),
  });

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;

    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors: {
        fullName: errors.fullName?.[0],
        email: errors.email?.[0],
        password: errors.password?.[0],
      },
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const fullName = parsed.data.fullName?.trim();

    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          full_name: fullName || undefined,
        },
      },
    });

    if (error) {
      return {
        status: "error",
        message: error.message,
        fieldErrors: {},
      };
    }

    if (data.user && data.session) {
      const destination = await getPostAuthRedirectPath(data.user.id, supabase);
      redirect(destination);
    }

    return {
      status: "success",
      message:
        "Account created. Check your email inbox to verify your account, then return to login.",
      fieldErrors: {},
    };
  } catch (error: unknown) {
    console.error("signupAction failed:", error);
    return {
      status: "error",
      message: getSafeAuthErrorMessage(error),
      fieldErrors: {},
    };
  }
}

export async function logoutAction(): Promise<never> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  redirect("/login");
}
