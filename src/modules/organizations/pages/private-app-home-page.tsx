import Link from "next/link";
import { countBookingsByOrganizationId } from "@/modules/bookings/queries";
import { countClientsByOrganizationId } from "@/modules/clients/queries";
import { countServicesByOrganizationId } from "@/modules/services/queries";
import { countTeamMembersByOrganizationId } from "@/modules/team/queries";
import { requireOnboardedUser } from "@/modules/organizations/guards";
import type { Database } from "@/types/database";

function getRoleLabel(role: Database["public"]["Enums"]["member_role"]): string {
  switch (role) {
    case "owner":
      return "Propietario";
    case "admin":
      return "Administrador";
    case "staff":
      return "Personal";
    case "client":
      return "Cliente";
    default:
      return role;
  }
}

export async function PrivateAppHomePage() {
  const { organization, membership } = await requireOnboardedUser();
  const [totalTeam, totalClients, totalServices, totalBookings] = await Promise.all([
    countTeamMembersByOrganizationId(organization.id),
    countClientsByOrganizationId(organization.id),
    countServicesByOrganizationId(organization.id),
    countBookingsByOrganizationId(organization.id),
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Panel del espacio de trabajo</h2>
        <p className="mt-2 text-sm text-slate-600">
          Bienvenido a {organization.name}. Has iniciado sesión como{" "}
          <strong>{getRoleLabel(membership.role)}</strong>.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white/90 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Equipo</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{totalTeam}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white/90 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Clientes</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{totalClients}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white/90 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Servicios</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{totalServices}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white/90 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reservas</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{totalBookings}</p>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white/90 p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Accesos rápidos</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/app/team"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Ir a equipo
          </Link>
          <Link
            href="/app/clients"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Ir a clientes
          </Link>
          <Link
            href="/app/services"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Ir a servicios
          </Link>
          <Link
            href="/app/bookings"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Ir a reservas
          </Link>
        </div>
      </section>
    </div>
  );
}
