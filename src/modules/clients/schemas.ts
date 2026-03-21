import { z } from "zod";

export const clientStatusOptions = ["lead", "active", "inactive"] as const;

export const createClientSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters.")
    .max(120, "Full name must be 120 characters or less."),
  email: z
    .union([z.string().trim().email("Enter a valid email address."), z.literal("")])
    .transform((value) => (value === "" ? null : value)),
  phone: z
    .union([z.string().trim().max(32, "Phone must be 32 characters or less."), z.literal("")])
    .transform((value) => (value === "" ? null : value)),
  status: z.enum(clientStatusOptions),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
