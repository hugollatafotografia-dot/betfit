import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Introduce un correo electrónico válido."),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(72, "La contraseña debe tener como máximo 72 caracteres."),
});

export const signupSchema = z.object({
  fullName: z
    .string()
    .trim()
    .max(120, "El nombre completo debe tener como máximo 120 caracteres.")
    .optional()
    .or(z.literal("")),
  email: z.string().trim().email("Introduce un correo electrónico válido."),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(72, "La contraseña debe tener como máximo 72 caracteres."),
});
