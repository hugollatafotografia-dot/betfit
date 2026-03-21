import { redirectAuthenticatedUserFromPublicAuthPages } from "@/modules/auth/redirects";
import { AuthCard } from "@/modules/auth/components/auth-card";
import { LoginForm } from "@/modules/auth/components/login-form";

export async function LoginPage() {
  await redirectAuthenticatedUserFromPublicAuthPages();

  return (
    <AuthCard
      title="Bienvenido de nuevo"
      description="Inicia sesión para acceder a tu espacio de trabajo."
      footer={<span>Protegido por Supabase Auth y guards del servidor.</span>}
    >
      <LoginForm />
    </AuthCard>
  );
}
