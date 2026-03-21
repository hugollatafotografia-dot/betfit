import type { AuthError } from "@supabase/supabase-js";

function isFetchFailure(error: unknown): boolean {
  return error instanceof TypeError && error.message.toLowerCase().includes("fetch failed");
}

function isAuthError(error: unknown): error is AuthError {
  return error !== null && typeof error === "object" && "message" in error;
}

export function getSafeAuthErrorMessage(error: unknown): string {
  if (isFetchFailure(error)) {
    return "No se puede conectar con Supabase Auth. Revisa NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local y reinicia npm run dev.";
  }

  if (isAuthError(error) && typeof error.message === "string" && error.message.trim().length > 0) {
    return error.message;
  }

  return "Error inesperado de autenticación. Inténtalo de nuevo.";
}
