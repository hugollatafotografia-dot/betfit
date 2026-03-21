import { z } from "zod";
import type { Database } from "@/types/database";

export const memberRoleOptions = ["owner", "admin", "staff", "client"] as const;
export const memberStatusOptions = ["active", "invited", "disabled"] as const;

export const updateTeamMemberSchema = z.object({
  memberId: z.string().uuid("Miembro inválido."),
  role: z.enum(memberRoleOptions),
  status: z.enum(memberStatusOptions),
});

export type UpdateTeamMemberInput = z.infer<typeof updateTeamMemberSchema>;

export function getMemberRoleLabel(role: Database["public"]["Enums"]["member_role"]): string {
  switch (role) {
    case "owner":
      return "Propietario";
    case "admin":
      return "Administrador";
    case "staff":
      return "Personal";
    case "client":
      return "Cliente";
    default:
      return role;
  }
}

export function getMemberStatusLabel(status: Database["public"]["Enums"]["member_status"]): string {
  switch (status) {
    case "active":
      return "Activo";
    case "invited":
      return "Invitado";
    case "disabled":
      return "Deshabilitado";
    default:
      return status;
  }
}
