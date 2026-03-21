import { z } from "zod";
import type { Database } from "@/types/database";

export const clientStatusOptions = ["lead", "active", "inactive"] as const;

const clientFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "El nombre completo debe tener al menos 2 caracteres.")
    .max(120, "El nombre completo debe tener como máximo 120 caracteres."),
  email: z
    .union([z.string().trim().email("Introduce un correo electrónico válido."), z.literal("")])
    .transform((value) => (value === "" ? null : value)),
  phone: z
    .union([
      z.string().trim().max(32, "El teléfono debe tener como máximo 32 caracteres."),
      z.literal(""),
    ])
    .transform((value) => (value === "" ? null : value)),
  status: z.enum(clientStatusOptions),
});

export const createClientSchema = clientFormSchema;
export const updateClientSchema = clientFormSchema;

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;

export function getClientStatusLabel(status: Database["public"]["Enums"]["client_status"]): string {
  switch (status) {
    case "lead":
      return "Prospecto";
    case "active":
      return "Activo";
    case "inactive":
      return "Inactivo";
    default:
      return status;
  }
}
