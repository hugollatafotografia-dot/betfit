"use client";

import { useActionState } from "react";
import { createInitialFormState } from "@/modules/auth/types";
import { createBookingAction } from "@/modules/bookings/actions";
import { bookingStatusOptions } from "@/modules/bookings/schemas";
import type { BookingClientOption, BookingServiceOption } from "@/modules/bookings/queries";
import type { BookingField } from "@/modules/bookings/types";

const initialState = createInitialFormState<BookingField>();

type CreateBookingFormProps = {
  canManage: boolean;
  hasDependencies: boolean;
  clientOptions: BookingClientOption[];
  serviceOptions: BookingServiceOption[];
};

export function CreateBookingForm({
  canManage,
  hasDependencies,
  clientOptions,
  serviceOptions,
}: CreateBookingFormProps) {
  const [state, formAction, isPending] = useActionState(createBookingAction, initialState);
  const isDisabled = !canManage || !hasDependencies || isPending;

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div className="space-y-2">
        <label htmlFor="clientId" className="block text-sm font-medium text-slate-700">
          Client
        </label>
        <select
          id="clientId"
          name="clientId"
          defaultValue=""
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
          disabled={isDisabled}
          required
        >
          <option value="">Select client</option>
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
        <label htmlFor="serviceId" className="block text-sm font-medium text-slate-700">
          Service
        </label>
        <select
          id="serviceId"
          name="serviceId"
          defaultValue=""
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
          disabled={isDisabled}
          required
        >
          <option value="">Select service</option>
          {serviceOptions.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} ({service.status})
            </option>
          ))}
        </select>
        {state.fieldErrors.serviceId && (
          <p className="text-sm text-red-600">{state.fieldErrors.serviceId}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="status" className="block text-sm font-medium text-slate-700">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue="scheduled"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
          disabled={isDisabled}
        >
          {bookingStatusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        {state.fieldErrors.status && (
          <p className="text-sm text-red-600">{state.fieldErrors.status}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="startsAt" className="block text-sm font-medium text-slate-700">
            Starts at
          </label>
          <input
            id="startsAt"
            name="startsAt"
            type="datetime-local"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
            disabled={isDisabled}
            required
          />
          {state.fieldErrors.startsAt && (
            <p className="text-sm text-red-600">{state.fieldErrors.startsAt}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="endsAt" className="block text-sm font-medium text-slate-700">
            Ends at
          </label>
          <input
            id="endsAt"
            name="endsAt"
            type="datetime-local"
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
        <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
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
        {isPending ? "Creating booking..." : "Create booking"}
      </button>
    </form>
  );
}
