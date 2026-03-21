import { z } from "zod";

export const onboardingSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre de la organización debe tener al menos 2 caracteres.")
    .max(100, "El nombre de la organización debe tener como máximo 100 caracteres."),
  vertical: z
    .string()
    .trim()
    .min(2, "El sector es obligatorio.")
    .max(80, "El sector debe tener como máximo 80 caracteres."),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
