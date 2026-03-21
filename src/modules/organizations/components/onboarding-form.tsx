"use client";

import { useActionState } from "react";
import { createInitialFormState } from "@/modules/auth/types";
import { createOrganizationAction } from "@/modules/organizations/actions";
import type { OnboardingField } from "@/modules/organizations/types";

const initialState = createInitialFormState<OnboardingField>();

export function OnboardingForm() {
  const [state, formAction, isPending] = useActionState(createOrganizationAction, initialState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">
          Nombre de la organización
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="organization"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
          required
        />
        {state.fieldErrors.name && <p className="text-sm text-red-600">{state.fieldErrors.name}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="vertical" className="block text-sm font-medium text-slate-700">
          Sector
        </label>
        <input
          id="vertical"
          name="vertical"
          type="text"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
          placeholder="Estudio Wellness"
          required
        />
        {state.fieldErrors.vertical && (
          <p className="text-sm text-red-600">{state.fieldErrors.vertical}</p>
        )}
      </div>

      {state.message && <p className="text-sm text-red-600">{state.message}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Creando organización..." : "Crear organización"}
      </button>
    </form>
  );
}
