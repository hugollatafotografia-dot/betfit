import type { ReactNode } from "react";
import { logoutAction } from "@/modules/auth/actions";
import { requireOnboardedUser } from "@/modules/organizations/guards";
import { PrivateNav } from "@/modules/organizations/components/private-nav";

type PrivateAppShellProps = {
  children: ReactNode;
};

export async function PrivateAppShell({ children }: PrivateAppShellProps) {
  const { user, organization, membership } = await requireOnboardedUser();

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Workspace
            </p>
            <h1 className="text-lg font-semibold text-slate-900">{organization.name}</h1>
            <p className="text-xs text-slate-600">
              {organization.slug} • {membership.role}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <p className="hidden text-sm text-slate-600 sm:block">{user.email}</p>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Logout
              </button>
            </form>
          </div>
        </div>

        <PrivateNav />
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
