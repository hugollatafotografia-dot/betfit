"use client";

import { useActionState } from "react";
import { createInitialFormState } from "@/modules/auth/types";
import { createClientAction } from "@/modules/clients/actions";
import { clientStatusOptions } from "@/modules/clients/schemas";
import type { ClientField } from "@/modules/clients/types";

const initialState = createInitialFormState<ClientField>();

type CreateClientFormProps = {
  canManage: boolean;
};

export function CreateClientForm({ canManage }: CreateClientFormProps) {
  const [state, formAction, isPending] = useActionState(createClientAction, initialState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div className="space-y-2">
        <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
          required
          disabled={!canManage || isPending}
        />
        {state.fieldErrors.fullName && (
          <p className="text-sm text-red-600">{state.fieldErrors.fullName}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          Email (optional)
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
          disabled={!canManage || isPending}
        />
        {state.fieldErrors.email && (
          <p className="text-sm text-red-600">{state.fieldErrors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
          Phone (optional)
        </label>
        <input
          id="phone"
          name="phone"
          type="text"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
          disabled={!canManage || isPending}
        />
        {state.fieldErrors.phone && (
          <p className="text-sm text-red-600">{state.fieldErrors.phone}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="status" className="block text-sm font-medium text-slate-700">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue="lead"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
          disabled={!canManage || isPending}
        >
          {clientStatusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
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
        disabled={!canManage || isPending}
        className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Creating client..." : "Create client"}
      </button>
    </form>
  );
}
