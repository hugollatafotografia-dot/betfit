import { requireUserWithoutOrganization } from "@/modules/organizations/guards";
import { OnboardingForm } from "@/modules/organizations/components/onboarding-form";

export async function OnboardingPage() {
  await requireUserWithoutOrganization();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-6 py-12">
      <section className="w-full rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur-sm">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">Set up your organization</h1>
          <p className="text-sm text-slate-600">
            Create your first tenant to unlock the private application workspace.
          </p>
        </header>

        <div className="mt-6">
          <OnboardingForm />
        </div>
      </section>
    </main>
  );
}
