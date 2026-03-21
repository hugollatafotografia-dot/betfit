import Link from "next/link";
import { countBookingsByOrganizationId } from "@/modules/bookings/queries";
import { countClientsByOrganizationId } from "@/modules/clients/queries";
import { countServicesByOrganizationId } from "@/modules/services/queries";
import { requireOnboardedUser } from "@/modules/organizations/guards";

export async function PrivateAppHomePage() {
  const { organization, membership } = await requireOnboardedUser();
  const [totalClients, totalServices, totalBookings] = await Promise.all([
    countClientsByOrganizationId(organization.id),
    countServicesByOrganizationId(organization.id),
    countBookingsByOrganizationId(organization.id),
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Workspace dashboard</h2>
        <p className="mt-2 text-sm text-slate-600">
          Welcome to {organization.name}. You are signed in as <strong>{membership.role}</strong>.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white/90 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Clients</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{totalClients}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white/90 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Services</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{totalServices}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white/90 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bookings</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{totalBookings}</p>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white/90 p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Quick links</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/app/clients"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Go to clients
          </Link>
          <Link
            href="/app/services"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Go to services
          </Link>
          <Link
            href="/app/bookings"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Go to bookings
          </Link>
        </div>
      </section>
    </div>
  );
}
