"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction } from "@/modules/auth/actions";
import { createInitialFormState, type LoginField } from "@/modules/auth/types";

const initialState = createInitialFormState<LoginField>();

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
          required
        />
        {state.fieldErrors.email && (
          <p className="text-sm text-red-600">{state.fieldErrors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
          required
        />
        {state.fieldErrors.password && (
          <p className="text-sm text-red-600">{state.fieldErrors.password}</p>
        )}
      </div>

      {state.message && state.status === "error" && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <button
        type="submit"
        className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
      >
        {isPending ? "Iniciando sesión..." : "Iniciar sesión"}
      </button>

      <p className="text-sm text-slate-600">
        ¿No tienes cuenta?{" "}
        <Link
          href="/signup"
          className="font-medium text-slate-900 underline-offset-2 hover:underline"
        >
          Crear cuenta
        </Link>
      </p>
    </form>
  );
}
