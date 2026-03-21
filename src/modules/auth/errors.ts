import type { AuthError } from "@supabase/supabase-js";

function isFetchFailure(error: unknown): boolean {
  return error instanceof TypeError && error.message.toLowerCase().includes("fetch failed");
}

function isAuthError(error: unknown): error is AuthError {
  return error !== null && typeof error === "object" && "message" in error;
}

export function getSafeAuthErrorMessage(error: unknown): string {
  if (isFetchFailure(error)) {
    return "Cannot reach Supabase Auth. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local, then restart npm run dev.";
  }

  if (isAuthError(error) && typeof error.message === "string" && error.message.trim().length > 0) {
    return error.message;
  }

  return "Unexpected authentication error. Please try again.";
}
