import { canManageTenantRole } from "@/modules/organizations/queries";
import { requireOnboardedUser } from "@/modules/organizations/guards";
import { CreateClientForm } from "@/modules/clients/components/create-client-form";
import { EditClientForm } from "@/modules/clients/components/edit-client-form";
import { ClientsTable } from "@/modules/clients/components/clients-table";
import { listClientsByOrganizationId } from "@/modules/clients/queries";
import Link from "next/link";

type ClientsPageProps = {
  created: boolean;
  updated: boolean;
  editClientId: string | null;
};

export async function ClientsPage({ created, updated, editClientId }: ClientsPageProps) {
  const { organization, membership } = await requireOnboardedUser();
  const clients = await listClientsByOrganizationId(organization.id);
  const canManage = canManageTenantRole(membership.role);
  const editingClient = editClientId
    ? (clients.find((client) => client.id === editClientId) ?? null)
    : null;
  const isEditing = Boolean(editingClient);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">Clientes</h2>
        <p className="text-sm text-slate-600">Gestiona los clientes de tu organización.</p>
      </header>

      {created && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Cliente creado correctamente.
        </div>
      )}

      {updated && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Cliente actualizado correctamente.
        </div>
      )}

      {!canManage && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Tienes acceso de solo lectura. Pide a un propietario/admin que gestione clientes.
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <ClientsTable clients={clients} canManage={canManage} />
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">
            {isEditing ? "Editar cliente" : "Nuevo cliente"}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            {isEditing
              ? `Actualiza la información del cliente en ${organization.name}.`
              : `Crea un cliente dentro de ${organization.name}.`}
          </p>
          <div className="mt-4">
            {editingClient ? (
              <>
                <EditClientForm client={editingClient} canManage={canManage} />
                <Link
                  href="/app/clients"
                  className="mt-3 inline-flex text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
                >
                  Cancelar edición
                </Link>
              </>
            ) : (
              <CreateClientForm canManage={canManage} />
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
