export type FormStatus = "idle" | "error" | "success";

export type FormState<TField extends string> = {
  status: FormStatus;
  message: string | null;
  fieldErrors: Partial<Record<TField, string | undefined>>;
};

export type LoginField = "email" | "password";

export type SignupField = "email" | "password" | "fullName";

export function createInitialFormState<TField extends string>(): FormState<TField> {
  return {
    status: "idle",
    message: null,
    fieldErrors: {},
  };
}
