import { redirectAuthenticatedUserFromPublicAuthPages } from "@/modules/auth/redirects";
import { AuthCard } from "@/modules/auth/components/auth-card";
import { LoginForm } from "@/modules/auth/components/login-form";

export async function LoginPage() {
  await redirectAuthenticatedUserFromPublicAuthPages();

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to access your tenant workspace."
      footer={<span>Protected by Supabase Auth and server-side route guards.</span>}
    >
      <LoginForm />
    </AuthCard>
  );
}
