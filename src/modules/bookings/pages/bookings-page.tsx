import { requireOnboardedUser } from "@/modules/organizations/guards";
import { canManageTenantRole } from "@/modules/organizations/queries";
import { BookingsTable } from "@/modules/bookings/components/bookings-table";
import { CreateBookingForm } from "@/modules/bookings/components/create-booking-form";
import { EditBookingForm } from "@/modules/bookings/components/edit-booking-form";
import {
  listBookingsByOrganizationId,
  listBookingClientOptionsByOrganizationId,
  listBookingServiceOptionsByOrganizationId,
} from "@/modules/bookings/queries";
import Link from "next/link";

type BookingsPageProps = {
  created: boolean;
  updated: boolean;
  editBookingId: string | null;
};

export async function BookingsPage({ created, updated, editBookingId }: BookingsPageProps) {
  const { organization, membership } = await requireOnboardedUser();

  const [bookings, clientOptions, serviceOptions] = await Promise.all([
    listBookingsByOrganizationId(organization.id),
    listBookingClientOptionsByOrganizationId(organization.id),
    listBookingServiceOptionsByOrganizationId(organization.id),
  ]);

  const canManage = canManageTenantRole(membership.role);
  const hasDependencies = clientOptions.length > 0 && serviceOptions.length > 0;
  const editingBooking = editBookingId
    ? (bookings.find((booking) => booking.id === editBookingId) ?? null)
    : null;
  const isEditing = Boolean(editingBooking);

  const clientsById = new Map(clientOptions.map((item) => [item.id, item.fullName]));
  const servicesById = new Map(serviceOptions.map((item) => [item.id, item.name]));

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">Reservas</h2>
        <p className="text-sm text-slate-600">
          Programa y gestiona las reservas de tu organización.
        </p>
      </header>

      {created && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Reserva creada correctamente.
        </div>
      )}

      {updated && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Reserva actualizada correctamente.
        </div>
      )}

      {!canManage && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Tienes acceso de solo lectura. Pide a un propietario/admin que gestione reservas.
        </div>
      )}

      {canManage && !hasDependencies && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Crea al menos un cliente y un servicio antes de añadir reservas.
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div>
          <BookingsTable
            bookings={bookings}
            clientsById={clientsById}
            servicesById={servicesById}
            canManage={canManage}
          />
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">
            {isEditing ? "Editar reserva" : "Nueva reserva"}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            {isEditing
              ? `Actualiza la reserva en ${organization.name}.`
              : `Crea una reserva en ${organization.name}.`}
          </p>
          <div className="mt-4">
            {editingBooking ? (
              <>
                <EditBookingForm
                  booking={editingBooking}
                  canManage={canManage}
                  clientOptions={clientOptions}
                  serviceOptions={serviceOptions}
                />
                <Link
                  href="/app/bookings"
                  className="mt-3 inline-flex text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
                >
                  Cancelar edición
                </Link>
              </>
            ) : (
              <CreateBookingForm
                canManage={canManage}
                hasDependencies={hasDependencies}
                clientOptions={clientOptions}
                serviceOptions={serviceOptions}
              />
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
