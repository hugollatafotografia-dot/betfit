import { redirectFromRoot } from "@/modules/auth/redirects";

export async function RootEntryPage() {
  await redirectFromRoot();
  return null;
}
