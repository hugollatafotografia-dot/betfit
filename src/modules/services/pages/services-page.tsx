import { requireOnboardedUser } from "@/modules/organizations/guards";
import { canManageTenantRole } from "@/modules/organizations/queries";
import { CreateServiceForm } from "@/modules/services/components/create-service-form";
import { ServicesTable } from "@/modules/services/components/services-table";
import { listServicesWithLatestPriceByOrganizationId } from "@/modules/services/queries";

type ServicesPageProps = {
  created: boolean;
};

export async function ServicesPage({ created }: ServicesPageProps) {
  const { organization, membership } = await requireOnboardedUser();
  const services = await listServicesWithLatestPriceByOrganizationId(organization.id);
  const canManage = canManageTenantRole(membership.role);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">Services</h2>
        <p className="text-sm text-slate-600">Manage your service catalog and pricing.</p>
      </header>

      {created && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Service created successfully.
        </div>
      )}

      {!canManage && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You have read-only access. Ask an owner/admin to create services.
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div>
          <ServicesTable services={services} />
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">New service</h3>
          <p className="mt-1 text-sm text-slate-600">
            Create a service inside {organization.name}.
          </p>
          <div className="mt-4">
            <CreateServiceForm canManage={canManage} />
          </div>
        </aside>
      </section>
    </div>
  );
}
