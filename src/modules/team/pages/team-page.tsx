import Link from "next/link";
import { requireOnboardedUser } from "@/modules/organizations/guards";
import { canManageTenantRole } from "@/modules/organizations/queries";
import { EditMemberForm } from "@/modules/team/components/edit-member-form";
import { TeamTable } from "@/modules/team/components/team-table";
import { listTeamMembersByOrganizationId } from "@/modules/team/queries";

type TeamPageProps = {
  updated: boolean;
  editMemberId: string | null;
};

export async function TeamPage({ updated, editMemberId }: TeamPageProps) {
  const { organization, membership } = await requireOnboardedUser();
  const canManage = canManageTenantRole(membership.role);
  const members = await listTeamMembersByOrganizationId(organization.id);

  const editingMember = editMemberId
    ? (members.find((member) => member.id === editMemberId) ?? null)
    : null;
  const isEditing = Boolean(editingMember);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">Equipo</h2>
        <p className="text-sm text-slate-600">
          Gestiona los miembros y permisos de la organización actual.
        </p>
      </header>

      {updated && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Miembro actualizado correctamente.
        </div>
      )}

      {!canManage && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Tienes acceso de solo lectura. Pide a un propietario/admin que gestione el equipo.
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div>
          <TeamTable members={members} canManage={canManage} />
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">
            {isEditing ? "Editar miembro" : "Detalle del miembro"}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            {isEditing
              ? `Actualiza rol y estado del miembro en ${organization.name}.`
              : "Selecciona un miembro de la tabla para editar su rol y estado."}
          </p>
          <div className="mt-4">
            {editingMember ? (
              <>
                <EditMemberForm member={editingMember} canManage={canManage} />
                <Link
                  href="/app/team"
                  className="mt-3 inline-flex text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
                >
                  Cancelar edición
                </Link>
              </>
            ) : (
              <p className="text-sm text-slate-600">
                {canManage
                  ? "Pulsa en Editar para modificar un miembro."
                  : "Tu rol actual no permite editar miembros."}
              </p>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
