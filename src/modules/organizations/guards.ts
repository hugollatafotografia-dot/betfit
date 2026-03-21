import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { requireAuthenticatedUser } from "@/modules/auth/queries";
import { getActiveMembershipForUserId, type OrganizationMembershipContext } from "./queries";

export type OnboardedUserContext = OrganizationMembershipContext & {
  user: User;
};

export async function requireUserWithoutOrganization(): Promise<User> {
  const user = await requireAuthenticatedUser();
  const membershipContext = await getActiveMembershipForUserId(user.id);

  if (membershipContext) {
    redirect("/app");
  }

  return user;
}

export async function requireOnboardedUser(): Promise<OnboardedUserContext> {
  const user = await requireAuthenticatedUser();
  const membershipContext = await getActiveMembershipForUserId(user.id);

  if (!membershipContext) {
    redirect("/onboarding");
  }

  return {
    user,
    ...membershipContext,
  };
}
