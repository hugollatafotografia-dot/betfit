import { redirectAuthenticatedUserFromPublicAuthPages } from "@/modules/auth/redirects";
import { AuthCard } from "@/modules/auth/components/auth-card";
import { SignupForm } from "@/modules/auth/components/signup-form";

export async function SignupPage() {
  await redirectAuthenticatedUserFromPublicAuthPages();

  return (
    <AuthCard
      title="Crea tu cuenta"
      description="Empieza creando tu cuenta owner de forma segura."
      footer={<span>Después del acceso, crearás tu primera organización en el onboarding.</span>}
    >
      <SignupForm />
    </AuthCard>
  );
}
