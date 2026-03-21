"use client";

import { useActionState } from "react";
import { createInitialFormState } from "@/modules/auth/types";
import { updateClientAction } from "@/modules/clients/actions";
import { clientStatusOptions, getClientStatusLabel } from "@/modules/clients/schemas";
import type { ClientRow } from "@/modules/clients/queries";
import type { ClientField } from "@/modules/clients/types";

const initialState = createInitialFormState<ClientField>();

type EditClientFormProps = {
  client: ClientRow;
  canManage: boolean;
};

export function EditClientForm({ client, canManage }: EditClientFormProps) {
  const [state, formAction, isPending] = useActionState(updateClientAction, initialState);
  const isDisabled = !canManage || isPending;

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="clientId" value={client.id} />

      <div className="space-y-2">
        <label
          htmlFor={`fullName-${client.id}`}
          className="block text-sm font-medium text-slate-700"
        >
          Nombre completo
        </label>
        <input
          id={`fullName-${client.id}`}
          name="fullName"
          type="text"
          defaultValue={client.full_name}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
          required
          disabled={isDisabled}
        />
        {state.fieldErrors.fullName && (
          <p className="text-sm text-red-600">{state.fieldErrors.fullName}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor={`email-${client.id}`} className="block text-sm font-medium text-slate-700">
          Correo electrónico (opcional)
        </label>
        <input
          id={`email-${client.id}`}
          name="email"
          type="email"
          defaultValue={client.email ?? ""}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
          disabled={isDisabled}
        />
        {state.fieldErrors.email && (
          <p className="text-sm text-red-600">{state.fieldErrors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor={`phone-${client.id}`} className="block text-sm font-medium text-slate-700">
          Teléfono (opcional)
        </label>
        <input
          id={`phone-${client.id}`}
          name="phone"
          type="text"
          defaultValue={client.phone ?? ""}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
          disabled={isDisabled}
        />
        {state.fieldErrors.phone && (
          <p className="text-sm text-red-600">{state.fieldErrors.phone}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor={`status-${client.id}`} className="block text-sm font-medium text-slate-700">
          Estado
        </label>
        <select
          id={`status-${client.id}`}
          name="status"
          defaultValue={client.status}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
          disabled={isDisabled}
        >
          {clientStatusOptions.map((status) => (
            <option key={status} value={status}>
              {getClientStatusLabel(status)}
            </option>
          ))}
        </select>
        {state.fieldErrors.status && (
          <p className="text-sm text-red-600">{state.fieldErrors.status}</p>
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
