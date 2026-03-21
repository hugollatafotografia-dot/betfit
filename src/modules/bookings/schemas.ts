import { z } from "zod";

export const bookingStatusOptions = ["scheduled", "completed", "cancelled"] as const;

const dateTimeInputSchema = z
  .string()
  .trim()
  .min(1, "Date and time are required.")
  .refine((value) => !Number.isNaN(new Date(value).getTime()), "Enter a valid date and time.");

export const createBookingSchema = z
  .object({
    clientId: z.string().uuid("Select a valid client."),
    serviceId: z.string().uuid("Select a valid service."),
    status: z.enum(bookingStatusOptions),
    startsAt: dateTimeInputSchema.transform((value) => new Date(value).toISOString()),
    endsAt: dateTimeInputSchema.transform((value) => new Date(value).toISOString()),
    notes: z
      .union([z.string().trim().max(2000, "Notes must be 2000 characters or less."), z.literal("")])
      .transform((value) => (value === "" ? null : value)),
  })
  .superRefine((data, context) => {
    if (new Date(data.endsAt).getTime() <= new Date(data.startsAt).getTime()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End time must be after start time.",
        path: ["endsAt"],
      });
    }
  });

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
