"use client";

import { useActionState } from "react";
import { createInitialFormState } from "@/modules/auth/types";
import { updateTeamMemberAction } from "@/modules/team/actions";
import type { TeamMemberListItem } from "@/modules/team/queries";
import {
  getMemberRoleLabel,
  getMemberStatusLabel,
  memberRoleOptions,
  memberStatusOptions,
} from "@/modules/team/schemas";
import type { TeamField } from "@/modules/team/types";

const initialState = createInitialFormState<TeamField>();

type EditMemberFormProps = {
  member: TeamMemberListItem;
  canManage: boolean;
};

export function EditMemberForm({ member, canManage }: EditMemberFormProps) {
  const [state, formAction, isPending] = useActionState(updateTeamMemberAction, initialState);
  const isDisabled = !canManage || isPending;

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="memberId" value={member.id} />

      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
        <p className="font-medium text-slate-900">{member.fullName ?? "Sin nombre"}</p>
        <p>{member.email ?? "-"}</p>
      </div>

      <div className="space-y-2">
        <label htmlFor={`role-${member.id}`} className="block text-sm font-medium text-slate-700">
          Rol
        </label>
        <select
          id={`role-${member.id}`}
          name="role"
          defaultValue={member.role}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
          disabled={isDisabled}
        >
          {memberRoleOptions.map((role) => (
            <option key={role} value={role}>
              {getMemberRoleLabel(role)}
            </option>
          ))}
        </select>
        {state.fieldErrors.role && <p className="text-sm text-red-600">{state.fieldErrors.role}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor={`status-${member.id}`} className="block text-sm font-medium text-slate-700">
          Estado
        </label>
        <select
          id={`status-${member.id}`}
          name="status"
          defaultValue={member.status}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-300 transition focus:ring-2"
          disabled={isDisabled}
        >
          {memberStatusOptions.map((status) => (
            <option key={status} value={status}>
              {getMemberStatusLabel(status)}
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
