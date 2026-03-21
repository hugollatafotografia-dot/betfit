begin;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete cascade,
  status text not null check (status in ('scheduled', 'completed', 'cancelled')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_starts_before_ends check (ends_at > starts_at)
);

create index if not exists bookings_organization_id_idx on public.bookings (organization_id);
create index if not exists bookings_organization_starts_at_idx on public.bookings (organization_id, starts_at);
create index if not exists bookings_client_id_idx on public.bookings (client_id);
create index if not exists bookings_service_id_idx on public.bookings (service_id);
create index if not exists bookings_status_idx on public.bookings (status);

alter table public.bookings enable row level security;

drop trigger if exists set_bookings_updated_at on public.bookings;
create trigger set_bookings_updated_at
before update on public.bookings
for each row
execute procedure public.set_updated_at();

grant select, insert, update, delete on public.bookings to authenticated;

drop policy if exists bookings_select_same_org_members on public.bookings;
create policy bookings_select_same_org_members
on public.bookings
for select
to authenticated
using (public.is_org_member(organization_id));

drop policy if exists bookings_insert_owner_admin on public.bookings;
create policy bookings_insert_owner_admin
on public.bookings
for insert
to authenticated
with check (public.has_org_role(organization_id, array['owner', 'admin']::text[]));

drop policy if exists bookings_update_owner_admin on public.bookings;
create policy bookings_update_owner_admin
on public.bookings
for update
to authenticated
using (public.has_org_role(organization_id, array['owner', 'admin']::text[]))
with check (public.has_org_role(organization_id, array['owner', 'admin']::text[]));

drop policy if exists bookings_delete_owner_admin on public.bookings;
create policy bookings_delete_owner_admin
on public.bookings
for delete
to authenticated
using (public.has_org_role(organization_id, array['owner', 'admin']::text[]));

commit;
