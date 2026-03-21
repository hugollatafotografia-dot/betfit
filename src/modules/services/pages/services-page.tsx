import { requireOnboardedUser } from "@/modules/organizations/guards";
import { canManageTenantRole } from "@/modules/organizations/queries";
import { CreateServiceForm } from "@/modules/services/components/create-service-form";
import { EditServiceForm } from "@/modules/services/components/edit-service-form";
import { ServicesTable } from "@/modules/services/components/services-table";
import { listServicesWithLatestPriceByOrganizationId } from "@/modules/services/queries";
import Link from "next/link";

type ServicesPageProps = {
  created: boolean;
  updated: boolean;
  editServiceId: string | null;
};

export async function ServicesPage({ created, updated, editServiceId }: ServicesPageProps) {
  const { organization, membership } = await requireOnboardedUser();
  const services = await listServicesWithLatestPriceByOrganizationId(organization.id);
  const canManage = canManageTenantRole(membership.role);
  const editingService = editServiceId
    ? (services.find((item) => item.service.id === editServiceId) ?? null)
    : null;
  const isEditing = Boolean(editingService);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">Servicios</h2>
        <p className="text-sm text-slate-600">Gestiona tu catálogo de servicios y precios.</p>
      </header>

      {created && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Servicio creado correctamente.
        </div>
      )}

      {updated && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Servicio actualizado correctamente.
        </div>
      )}

      {!canManage && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Tienes acceso de solo lectura. Pide a un propietario/admin que gestione servicios.
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div>
          <ServicesTable services={services} canManage={canManage} />
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">
            {isEditing ? "Editar servicio" : "Nuevo servicio"}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            {isEditing
              ? `Actualiza el servicio dentro de ${organization.name}.`
              : `Crea un servicio dentro de ${organization.name}.`}
          </p>
          <div className="mt-4">
            {editingService ? (
              <>
                <EditServiceForm service={editingService} canManage={canManage} />
                <Link
                  href="/app/services"
                  className="mt-3 inline-flex text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
                >
                  Cancelar edición
                </Link>
              </>
            ) : (
              <CreateServiceForm canManage={canManage} />
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
