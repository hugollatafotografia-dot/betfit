import { ServicesPage } from "@/modules/services/pages/services-page";

type PageProps = {
  searchParams?: {
    created?: string;
  };
};

export default async function Page({ searchParams }: PageProps) {
  const created = searchParams?.created === "1";
  return <ServicesPage created={created} />;
}
