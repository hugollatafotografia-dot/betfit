import { BookingsPage } from "@/modules/bookings/pages/bookings-page";

type SearchParams = {
  created?: string;
  updated?: string;
  edit?: string;
};

type PageProps = {
  searchParams?: SearchParams | Promise<SearchParams>;
};

export default async function Page({ searchParams }: PageProps) {
  const params = await Promise.resolve(searchParams ?? {});
  const created = params.created === "1";
  const updated = params.updated === "1";
  const editBookingId = params.edit ?? null;
  return <BookingsPage created={created} updated={updated} editBookingId={editBookingId} />;
}
