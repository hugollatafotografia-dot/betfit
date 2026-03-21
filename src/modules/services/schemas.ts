import { z } from "zod";

export const serviceTypeOptions = ["one_to_one", "group", "subscription", "package"] as const;
export const serviceStatusOptions = ["draft", "active", "archived"] as const;
export const serviceBillingTypeOptions = ["one_time", "recurring"] as const;
export const serviceIntervalOptions = ["week", "month", "year"] as const;

const nonNegativeIntegerString = z.string().trim().regex(/^\d+$/, "Enter a valid number.");

export const createServiceSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters.")
      .max(120, "Name must be 120 characters or less."),
    description: z
      .union([
        z.string().trim().max(600, "Description must be 600 characters or less."),
        z.literal(""),
      ])
      .transform((value) => (value === "" ? null : value)),
    serviceType: z.enum(serviceTypeOptions),
    status: z.enum(serviceStatusOptions),
    durationMinutes: z
      .union([nonNegativeIntegerString, z.literal("")])
      .transform((value) => (value === "" ? null : Number(value)))
      .refine((value) => value === null || value > 0, "Duration must be greater than 0."),
    priceAmount: nonNegativeIntegerString
      .transform((value) => Number(value))
      .refine((value) => Number.isInteger(value), "Price amount must be an integer."),
    currency: z
      .string()
      .trim()
      .min(3, "Currency must be a 3-letter code.")
      .max(3, "Currency must be a 3-letter code.")
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
        message: "Interval is required for recurring billing.",
        path: ["interval"],
      });
    }

    if (data.billingType === "one_time" && data.interval) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Interval must be empty for one-time billing.",
        path: ["interval"],
      });
    }
  });

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
