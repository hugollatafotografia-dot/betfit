import { TeamPage } from "@/modules/team/pages/team-page";

type SearchParams = {
  updated?: string | string[];
  edit?: string | string[];
};

type PageProps = {
  searchParams?: SearchParams | Promise<SearchParams>;
};

function getSingleParam(value: string | string[] | undefined): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && value.length > 0) {
    return value[0] ?? null;
  }

  return null;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await Promise.resolve(searchParams ?? {});
  const updated = getSingleParam(params.updated) === "1";
  const editMemberId = getSingleParam(params.edit);

  return <TeamPage updated={updated} editMemberId={editMemberId} />;
}
