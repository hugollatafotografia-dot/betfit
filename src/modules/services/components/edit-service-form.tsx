"use client";

import { useActionState, useState } from "react";
import { createInitialFormState } from "@/modules/auth/types";
import { updateServiceAction } from "@/modules/services/actions";
import type { ServiceWithPrice } from "@/modules/services/queries";
import {
  getServiceBillingTypeLabel,
  getServiceIntervalLabel,
  getServiceStatusLabel,
  getServiceTypeLabel,
  serviceBillingTypeOptions,
  serviceIntervalOptions,
  serviceStatusOptions,
  serviceTypeOptions,
} from "@/modules/services/schemas";
import type { ServiceField } from "@/modules/services/types";

const initialState = createInitialFormState<ServiceField>();

type EditServiceFormProps = {
  service: ServiceWithPrice;
  canManage: boolean;
};

export function EditServiceForm({ service, canManage }: EditServiceFormProps) {
  const [state, formAction, isPending] = useActionState(updateServiceAction, initialState);
  const [billingType, setBillingType] = useState<(typeof serviceBillingTypeOptions)[number]>(
    service.latestPrice?.billing_type ?? "one_time",
  );

  const isDisabled = !canManage || isPending;

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="serviceId" value={service.service.id} />

      <div className="space-y-2">
        <label
          htmlFor={`name-${service.service.id}`}
          className="block text-sm font-medium text-slate-700"
        >
          Nombre
        </label>
        <input
          id={`name-${service.service.id}`}
          name="name"
          type="text"
          defaultValue={service.service.name}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
          required
          disabled={isDisabled}
        />
        {state.fieldErrors.name && <p className="text-sm text-red-600">{state.fieldErrors.name}</p>}
      </div>

      <div className="space-y-2">
        <label
          htmlFor={`description-${service.service.id}`}
          className="block text-sm font-medium text-slate-700"
        >
          Descripción (opcional)
        </label>
        <textarea
          id={`description-${service.service.id}`}
          name="description"
          rows={3}
          defaultValue={service.service.description ?? ""}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
          disabled={isDisabled}
        />
        {state.fieldErrors.description && (
          <p className="text-sm text-red-600">{state.fieldErrors.description}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor={`serviceType-${service.service.id}`}
            className="block text-sm font-medium text-slate-700"
          >
            Tipo de servicio
          </label>
          <select
            id={`serviceType-${service.service.id}`}
            name="serviceType"
            defaultValue={service.service.service_type}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
            disabled={isDisabled}
          >
            {serviceTypeOptions.map((serviceType) => (
              <option key={serviceType} value={serviceType}>
                {getServiceTypeLabel(serviceType)}
              </option>
            ))}
          </select>
          {state.fieldErrors.serviceType && (
            <p className="text-sm text-red-600">{state.fieldErrors.serviceType}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor={`status-${service.service.id}`}
            className="block text-sm font-medium text-slate-700"
          >
            Estado
          </label>
          <select
            id={`status-${service.service.id}`}
            name="status"
            defaultValue={service.service.status}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
            disabled={isDisabled}
          >
            {serviceStatusOptions.map((status) => (
              <option key={status} value={status}>
                {getServiceStatusLabel(status)}
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
          <label
            htmlFor={`durationMinutes-${service.service.id}`}
            className="block text-sm font-medium text-slate-700"
          >
            Duración en minutos (opcional)
          </label>
          <input
            id={`durationMinutes-${service.service.id}`}
            name="durationMinutes"
            type="number"
            min={1}
            defaultValue={service.service.duration_minutes ?? ""}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
            disabled={isDisabled}
          />
          {state.fieldErrors.durationMinutes && (
            <p className="text-sm text-red-600">{state.fieldErrors.durationMinutes}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor={`priceAmount-${service.service.id}`}
            className="block text-sm font-medium text-slate-700"
          >
            Importe del precio (unidades menores)
          </label>
          <input
            id={`priceAmount-${service.service.id}`}
            name="priceAmount"
            type="number"
            min={0}
            step={1}
            defaultValue={service.latestPrice?.price_amount ?? 0}
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
          <label
            htmlFor={`currency-${service.service.id}`}
            className="block text-sm font-medium text-slate-700"
          >
            Moneda
          </label>
          <input
            id={`currency-${service.service.id}`}
            name="currency"
            type="text"
            maxLength={3}
            defaultValue={service.latestPrice?.currency ?? "EUR"}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm uppercase text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
            disabled={isDisabled}
          />
          {state.fieldErrors.currency && (
            <p className="text-sm text-red-600">{state.fieldErrors.currency}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor={`billingType-${service.service.id}`}
            className="block text-sm font-medium text-slate-700"
          >
            Tipo de facturación
          </label>
          <select
            id={`billingType-${service.service.id}`}
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
                {getServiceBillingTypeLabel(option)}
              </option>
            ))}
          </select>
          {state.fieldErrors.billingType && (
            <p className="text-sm text-red-600">{state.fieldErrors.billingType}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor={`interval-${service.service.id}`}
            className="block text-sm font-medium text-slate-700"
          >
            Intervalo (solo recurrente)
          </label>
          <select
            id={`interval-${service.service.id}`}
            name="interval"
            defaultValue={service.latestPrice?.interval ?? ""}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
            disabled={isDisabled || billingType !== "recurring"}
          >
            <option value="">Ninguno</option>
            {serviceIntervalOptions.map((interval) => (
              <option key={interval} value={interval}>
                {getServiceIntervalLabel(interval)}
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
        {isPending ? "Guardando cambios..." : "Guardar cambios"}
      </button>
    </form>
  );
}
