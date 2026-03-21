import { z } from "zod";
import type { Database } from "@/types/database";

export const serviceTypeOptions = ["one_to_one", "group", "subscription", "package"] as const;
export const serviceStatusOptions = ["draft", "active", "archived"] as const;
export const serviceBillingTypeOptions = ["one_time", "recurring"] as const;
export const serviceIntervalOptions = ["week", "month", "year"] as const;

const nonNegativeIntegerString = z.string().trim().regex(/^\d+$/, "Introduce un número válido.");

const serviceFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres.")
      .max(120, "El nombre debe tener como máximo 120 caracteres."),
    description: z
      .union([
        z.string().trim().max(600, "La descripción debe tener como máximo 600 caracteres."),
        z.literal(""),
      ])
      .transform((value) => (value === "" ? null : value)),
    serviceType: z.enum(serviceTypeOptions),
    status: z.enum(serviceStatusOptions),
    durationMinutes: z
      .union([nonNegativeIntegerString, z.literal("")])
      .transform((value) => (value === "" ? null : Number(value)))
      .refine((value) => value === null || value > 0, "La duración debe ser mayor que 0."),
    priceAmount: nonNegativeIntegerString
      .transform((value) => Number(value))
      .refine((value) => Number.isInteger(value), "El precio debe ser un número entero."),
    currency: z
      .string()
      .trim()
      .min(3, "La moneda debe tener 3 letras.")
      .max(3, "La moneda debe tener 3 letras.")
      .transform((value) => value.toUpperCase()),
    billingType: z.enum(serviceBillingTypeOptions),
    interval: z
      .union([z.enum(serviceIntervalOptions), z.literal("")])
      .transform((value) => (value === "" ? null : value)),
  })
  .superRefine((data, context) => {
    if (data.billingType === "recurring" && !data.interval) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El intervalo es obligatorio para facturación recurrente.",
        path: ["interval"],
      });
    }

    if (data.billingType === "one_time" && data.interval) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El intervalo debe estar vacío para facturación de pago único.",
        path: ["interval"],
      });
    }
  });

export const createServiceSchema = serviceFormSchema;
export const updateServiceSchema = serviceFormSchema;

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;

export function getServiceTypeLabel(type: Database["public"]["Enums"]["service_type"]): string {
  switch (type) {
    case "one_to_one":
      return "1 a 1";
    case "group":
      return "Grupal";
    case "subscription":
      return "Suscripción";
    case "package":
      return "Paquete";
    default:
      return type;
  }
}

export function getServiceStatusLabel(
  status: Database["public"]["Enums"]["service_status"],
): string {
  switch (status) {
    case "draft":
      return "Borrador";
    case "active":
      return "Activo";
    case "archived":
      return "Archivado";
    default:
      return status;
  }
}

export function getServiceBillingTypeLabel(
  billingType: Database["public"]["Enums"]["service_billing_type"],
): string {
  switch (billingType) {
    case "one_time":
      return "Pago único";
    case "recurring":
      return "Recurrente";
    default:
      return billingType;
  }
}

export function getServiceIntervalLabel(
  interval: Database["public"]["Enums"]["service_interval"] | null,
): string {
  switch (interval) {
    case "week":
      return "Semana";
    case "month":
      return "Mes";
    case "year":
      return "Año";
    default:
      return "Ninguno";
  }
}
