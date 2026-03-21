"use client";

import { useActionState } from "react";
import { createInitialFormState } from "@/modules/auth/types";
import { updateBookingAction } from "@/modules/bookings/actions";
import type {
  BookingClientOption,
  BookingRow,
  BookingServiceOption,
} from "@/modules/bookings/queries";
import { bookingStatusOptions, getBookingStatusLabel } from "@/modules/bookings/schemas";
import type { BookingField } from "@/modules/bookings/types";

const initialState = createInitialFormState<BookingField>();

type EditBookingFormProps = {
  booking: BookingRow;
  canManage: boolean;
  clientOptions: BookingClientOption[];
  serviceOptions: BookingServiceOption[];
};

function toDateTimeLocalValue(value: string): string {
  const date = new Date(value);
  const timezoneOffsetInMs = date.getTimezoneOffset() * 60 * 1000;
  const localDate = new Date(date.getTime() - timezoneOffsetInMs);
  return localDate.toISOString().slice(0, 16);
}

export function EditBookingForm({
  booking,
  canManage,
  clientOptions,
  serviceOptions,
}: EditBookingFormProps) {
  const [state, formAction, isPending] = useActionState(updateBookingAction, initialState);
  const isDisabled = !canManage || isPending;

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="bookingId" value={booking.id} />

      <div className="space-y-2">
        <label
          htmlFor={`clientId-${booking.id}`}
          className="block text-sm font-medium text-slate-700"
        >
          Cliente
        </label>
        <select
          id={`clientId-${booking.id}`}
          name="clientId"
          defaultValue={booking.client_id}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
          disabled={isDisabled}
          required
        >
          {clientOptions.map((client) => (
            <option key={client.id} value={client.id}>
              {client.fullName}
            </option>
          ))}
        </select>
        {state.fieldErrors.clientId && (
          <p className="text-sm text-red-600">{state.fieldErrors.clientId}</p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor={`serviceId-${booking.id}`}
          className="block text-sm font-medium text-slate-700"
        >
          Servicio
        </label>
        <select
          id={`serviceId-${booking.id}`}
          name="serviceId"
          defaultValue={booking.service_id}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
          disabled={isDisabled}
          required
        >
          {serviceOptions.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </select>
        {state.fieldErrors.serviceId && (
          <p className="text-sm text-red-600">{state.fieldErrors.serviceId}</p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor={`status-${booking.id}`}
          className="block text-sm font-medium text-slate-700"
        >
          Estado
        </label>
        <select
          id={`status-${booking.id}`}
          name="status"
          defaultValue={booking.status}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
          disabled={isDisabled}
        >
          {bookingStatusOptions.map((status) => (
            <option key={status} value={status}>
              {getBookingStatusLabel(status)}
            </option>
          ))}
        </select>
        {state.fieldErrors.status && (
          <p className="text-sm text-red-600">{state.fieldErrors.status}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor={`startsAt-${booking.id}`}
            className="block text-sm font-medium text-slate-700"
          >
            Inicio
          </label>
          <input
            id={`startsAt-${booking.id}`}
            name="startsAt"
            type="datetime-local"
            defaultValue={toDateTimeLocalValue(booking.starts_at)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
            disabled={isDisabled}
            required
          />
          {state.fieldErrors.startsAt && (
            <p className="text-sm text-red-600">{state.fieldErrors.startsAt}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor={`endsAt-${booking.id}`}
            className="block text-sm font-medium text-slate-700"
          >
            Fin
          </label>
          <input
            id={`endsAt-${booking.id}`}
            name="endsAt"
            type="datetime-local"
            defaultValue={toDateTimeLocalValue(booking.ends_at)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
            disabled={isDisabled}
            required
          />
          {state.fieldErrors.endsAt && (
            <p className="text-sm text-red-600">{state.fieldErrors.endsAt}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor={`notes-${booking.id}`} className="block text-sm font-medium text-slate-700">
          Notas (opcional)
        </label>
        <textarea
          id={`notes-${booking.id}`}
          name="notes"
          rows={3}
          defaultValue={booking.notes ?? ""}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
          disabled={isDisabled}
        />
        {state.fieldErrors.notes && (
          <p className="text-sm text-red-600">{state.fieldErrors.notes}</p>
        )}
      </div>

      {state.message && <p className="text-sm text-red-600">{state.message}</p>}

      <button
        type="submit"
        disabled={isDisabled}
        className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Guardando cambios..." : "Guardar cambios"}
      </button>
    </form>
  );
}
