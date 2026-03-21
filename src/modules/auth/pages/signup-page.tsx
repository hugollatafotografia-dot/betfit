import { redirectAuthenticatedUserFromPublicAuthPages } from "@/modules/auth/redirects";
import { AuthCard } from "@/modules/auth/components/auth-card";
import { SignupForm } from "@/modules/auth/components/signup-form";

export async function SignupPage() {
  await redirectAuthenticatedUserFromPublicAuthPages();

  return (
    <AuthCard
      title="Create your account"
      description="Start by creating your secure owner account."
      footer={<span>After login, you will create your first organization in onboarding.</span>}
    >
      <SignupForm />
    </AuthCard>
  );
}
