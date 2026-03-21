import { requireOnboardedUser } from "@/modules/organizations/guards";
import { canManageTenantRole } from "@/modules/organizations/queries";
import { BookingsTable } from "@/modules/bookings/components/bookings-table";
import { CreateBookingForm } from "@/modules/bookings/components/create-booking-form";
import {
  listBookingsByOrganizationId,
  listBookingClientOptionsByOrganizationId,
  listBookingServiceOptionsByOrganizationId,
} from "@/modules/bookings/queries";

type BookingsPageProps = {
  created: boolean;
};

export async function BookingsPage({ created }: BookingsPageProps) {
  const { organization, membership } = await requireOnboardedUser();

  const [bookings, clientOptions, serviceOptions] = await Promise.all([
    listBookingsByOrganizationId(organization.id),
    listBookingClientOptionsByOrganizationId(organization.id),
    listBookingServiceOptionsByOrganizationId(organization.id),
  ]);

  const canManage = canManageTenantRole(membership.role);
  const hasDependencies = clientOptions.length > 0 && serviceOptions.length > 0;

  const clientsById = new Map(clientOptions.map((item) => [item.id, item.fullName]));
  const servicesById = new Map(serviceOptions.map((item) => [item.id, item.name]));

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">Bookings</h2>
        <p className="text-sm text-slate-600">Schedule and track reservations for your tenant.</p>
      </header>

      {created && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Booking created successfully.
        </div>
      )}

      {!canManage && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You have read-only access. Ask an owner/admin to create bookings.
        </div>
      )}

      {canManage && !hasDependencies && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Create at least one client and one service before adding bookings.
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div>
          <BookingsTable
            bookings={bookings}
            clientsById={clientsById}
            servicesById={servicesById}
          />
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">New booking</h3>
          <p className="mt-1 text-sm text-slate-600">Create a booking in {organization.name}.</p>
          <div className="mt-4">
            <CreateBookingForm
              canManage={canManage}
              hasDependencies={hasDependencies}
              clientOptions={clientOptions}
              serviceOptions={serviceOptions}
            />
          </div>
        </aside>
      </section>
    </div>
  );
}
