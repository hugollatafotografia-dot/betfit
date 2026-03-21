export type PublicEnvVar = "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY";

function getRequiredPublicEnv(key: PublicEnvVar): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}. Add it to .env.local.`);
  }

  return value;
}

export function getSupabasePublicEnv(): { url: string; anonKey: string } {
  return {
    url: getRequiredPublicEnv("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: getRequiredPublicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  };
}
