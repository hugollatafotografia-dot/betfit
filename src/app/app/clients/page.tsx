import { ClientsPage } from "@/modules/clients/pages/clients-page";

type PageProps = {
  searchParams?: {
    created?: string;
  };
};

export default async function Page({ searchParams }: PageProps) {
  const created = searchParams?.created === "1";
  return <ClientsPage created={created} />;
}
