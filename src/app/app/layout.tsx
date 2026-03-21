import type { ReactNode } from "react";
import { PrivateAppShell } from "@/modules/organizations/components/private-app-shell";

type AppLayoutProps = {
  children: ReactNode;
};

export default async function AppLayout({ children }: AppLayoutProps) {
  return <PrivateAppShell>{children}</PrivateAppShell>;
}
