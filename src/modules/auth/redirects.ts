import { redirect } from "next/navigation";
import { getPostAuthRedirectPath } from "@/modules/organizations/queries";
import { getCurrentUser } from "@/modules/auth/queries";

export async function redirectAuthenticatedUserFromPublicAuthPages(): Promise<void> {
  const user = await getCurrentUser();

  if (!user) {
    return;
  }

  const destination = await getPostAuthRedirectPath(user.id);
  redirect(destination);
}

export async function redirectFromRoot(): Promise<never> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const destination = await getPostAuthRedirectPath(user.id);
  redirect(destination);
}
