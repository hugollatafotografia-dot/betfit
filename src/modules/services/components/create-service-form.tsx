"use client";

import { useActionState, useState } from "react";
import { createInitialFormState } from "@/modules/auth/types";
import { createServiceAction } from "@/modules/services/actions";
import {
  serviceBillingTypeOptions,
  serviceIntervalOptions,
  serviceStatusOptions,
  serviceTypeOptions,
} from "@/modules/services/schemas";
import type { ServiceField } from "@/modules/services/types";

const initialState = createInitialFormState<ServiceField>();

type CreateServiceFormProps = {
  canManage: boolean;
};

export function CreateServiceForm({ canManage }: CreateServiceFormProps) {
  const [state, formAction, isPending] = useActionState(createServiceAction, initialState);
  const [billingType, setBillingType] =
    useState<(typeof serviceBillingTypeOptions)[number]>("one_time");

  const isDisabled = !canManage || isPending;

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
          required
          disabled={isDisabled}
        />
        {state.fieldErrors.name && <p className="text-sm text-red-600">{state.fieldErrors.name}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-slate-700">
          Description (optional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
          disabled={isDisabled}
        />
        {state.fieldErrors.description && (
          <p className="text-sm text-red-600">{state.fieldErrors.description}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="serviceType" className="block text-sm font-medium text-slate-700">
            Service type
          </label>
          <select
            id="serviceType"
            name="serviceType"
            defaultValue="one_to_one"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
            disabled={isDisabled}
          >
            {serviceTypeOptions.map((serviceType) => (
              <option key={serviceType} value={serviceType}>
                {serviceType}
              </option>
            ))}
          </select>
          {state.fieldErrors.serviceType && (
            <p className="text-sm text-red-600">{state.fieldErrors.serviceType}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="status" className="block text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue="draft"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
            disabled={isDisabled}
          >
            {serviceStatusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          {state.fieldErrors.status && (
            <p className="text-sm text-red-600">{state.fieldErrors.status}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="durationMinutes" className="block text-sm font-medium text-slate-700">
            Duration in minutes (optional)
          </label>
          <input
            id="durationMinutes"
            name="durationMinutes"
            type="number"
            min={1}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
            disabled={isDisabled}
          />
          {state.fieldErrors.durationMinutes && (
            <p className="text-sm text-red-600">{state.fieldErrors.durationMinutes}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="priceAmount" className="block text-sm font-medium text-slate-700">
            Price amount (minor units)
          </label>
          <input
            id="priceAmount"
            name="priceAmount"
            type="number"
            min={0}
            step={1}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
            required
            disabled={isDisabled}
          />
          {state.fieldErrors.priceAmount && (
            <p className="text-sm text-red-600">{state.fieldErrors.priceAmount}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="currency" className="block text-sm font-medium text-slate-700">
            Currency
          </label>
          <input
            id="currency"
            name="currency"
            type="text"
            defaultValue="EUR"
            maxLength={3}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm uppercase text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
            disabled={isDisabled}
          />
          {state.fieldErrors.currency && (
            <p className="text-sm text-red-600">{state.fieldErrors.currency}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="billingType" className="block text-sm font-medium text-slate-700">
            Billing type
          </label>
          <select
            id="billingType"
            name="billingType"
            value={billingType}
            onChange={(event) => {
              setBillingType(event.target.value as (typeof serviceBillingTypeOptions)[number]);
            }}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
            disabled={isDisabled}
          >
            {serviceBillingTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {state.fieldErrors.billingType && (
            <p className="text-sm text-red-600">{state.fieldErrors.billingType}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="interval" className="block text-sm font-medium text-slate-700">
            Interval (recurring only)
          </label>
          <select
            id="interval"
            name="interval"
            defaultValue=""
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
            disabled={isDisabled || billingType !== "recurring"}
          >
            <option value="">None</option>
            {serviceIntervalOptions.map((interval) => (
              <option key={interval} value={interval}>
                {interval}
              </option>
            ))}
          </select>
          {state.fieldErrors.interval && (
            <p className="text-sm text-red-600">{state.fieldErrors.interval}</p>
          )}
        </div>
      </div>

      {state.message && <p className="text-sm text-red-600">{state.message}</p>}

      <button
        type="submit"
        disabled={isDisabled}
        className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Creating service..." : "Create service"}
      </button>
    </form>
  );
}
