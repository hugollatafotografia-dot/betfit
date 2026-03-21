import { z } from "zod";

export const onboardingSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Organization name must be at least 2 characters.")
    .max(100, "Organization name must be 100 characters or less."),
  vertical: z
    .string()
    .trim()
    .min(2, "Vertical is required.")
    .max(80, "Vertical must be 80 characters or less."),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
