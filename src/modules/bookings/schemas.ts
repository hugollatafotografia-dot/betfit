import { z } from "zod";
import type { Database } from "@/types/database";

export const bookingStatusOptions = ["scheduled", "completed", "cancelled"] as const;

const dateTimeInputSchema = z
  .string()
  .trim()
  .min(1, "La fecha y la hora son obligatorias.")
  .refine(
    (value) => !Number.isNaN(new Date(value).getTime()),
    "Introduce una fecha y hora válidas.",
  );

const bookingFormSchema = z
  .object({
    clientId: z.string().uuid("Selecciona un cliente válido."),
    serviceId: z.string().uuid("Selecciona un servicio válido."),
    status: z.enum(bookingStatusOptions),
    startsAt: dateTimeInputSchema.transform((value) => new Date(value).toISOString()),
    endsAt: dateTimeInputSchema.transform((value) => new Date(value).toISOString()),
    notes: z
      .union([
        z.string().trim().max(2000, "Las notas deben tener como máximo 2000 caracteres."),
        z.literal(""),
      ])
      .transform((value) => (value === "" ? null : value)),
  })
  .superRefine((data, context) => {
    if (new Date(data.endsAt).getTime() <= new Date(data.startsAt).getTime()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La fecha de fin debe ser posterior a la de inicio.",
        path: ["endsAt"],
      });
    }
  });

export const createBookingSchema = bookingFormSchema;
export const updateBookingSchema = bookingFormSchema;

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;

export function getBookingStatusLabel(
  status: Database["public"]["Enums"]["booking_status"],
): string {
  switch (status) {
    case "scheduled":
      return "Programada";
    case "completed":
      return "Completada";
    case "cancelled":
      return "Cancelada";
    default:
      return status;
  }
}
