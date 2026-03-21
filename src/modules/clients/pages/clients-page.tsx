import { canManageTenantRole } from "@/modules/organizations/queries";
import { requireOnboardedUser } from "@/modules/organizations/guards";
import { CreateClientForm } from "@/modules/clients/components/create-client-form";
import { ClientsTable } from "@/modules/clients/components/clients-table";
import { listClientsByOrganizationId } from "@/modules/clients/queries";

type ClientsPageProps = {
  created: boolean;
};

export async function ClientsPage({ created }: ClientsPageProps) {
  const { organization, membership } = await requireOnboardedUser();
  const clients = await listClientsByOrganizationId(organization.id);
  const canManage = canManageTenantRole(membership.role);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">Clients</h2>
        <p className="text-sm text-slate-600">Manage tenant-scoped clients for your workspace.</p>
      </header>

      {created && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Client created successfully.
        </div>
      )}

      {!canManage && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You have read-only access. Ask an owner/admin to create clients.
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <ClientsTable clients={clients} />
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">New client</h3>
          <p className="mt-1 text-sm text-slate-600">
            Create a new client inside {organization.name}.
          </p>
          <div className="mt-4">
            <CreateClientForm canManage={canManage} />
          </div>
        </aside>
      </section>
    </div>
  );
}
