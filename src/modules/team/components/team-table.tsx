import Link from "next/link";
import type { TeamMemberListItem } from "@/modules/team/queries";
import { getMemberRoleLabel, getMemberStatusLabel } from "@/modules/team/schemas";

type TeamTableProps = {
  members: TeamMemberListItem[];
  canManage: boolean;
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString();
}

export function TeamTable({ members, canManage }: TeamTableProps) {
  if (members.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white/80 p-6 text-sm text-slate-600">
        No hay miembros en el equipo todavía.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white/90">
      <table className="min-w-[860px] divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Nombre</th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Correo</th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Rol</th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Estado</th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Fecha de alta</th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {members.map((member) => (
            <tr key={member.id}>
              <td className="px-4 py-3 text-slate-900">{member.fullName ?? "Sin nombre"}</td>
              <td className="px-4 py-3 text-slate-700">{member.email ?? "-"}</td>
              <td className="px-4 py-3 text-slate-700">{getMemberRoleLabel(member.role)}</td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                  {getMemberStatusLabel(member.status)}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-700">{formatDate(member.createdAt)}</td>
              <td className="px-4 py-3 text-slate-700">
                {canManage ? (
                  <Link
                    href={`/app/team?edit=${member.id}`}
                    className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    Editar
                  </Link>
                ) : (
                  <span>Solo lectura</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
