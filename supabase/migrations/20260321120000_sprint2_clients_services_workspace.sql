begin;

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  description text null,
  service_type text not null check (service_type in ('one_to_one', 'group', 'subscription', 'package')),
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  duration_minutes integer null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint services_duration_positive check (duration_minutes is null or duration_minutes > 0)
);

create table if not exists public.service_prices (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  price_amount integer not null,
  currency text not null default 'EUR',
  billing_type text not null check (billing_type in ('one_time', 'recurring')),
  interval text null check (interval in ('week', 'month', 'year') or interval is null),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_prices_price_amount_positive check (price_amount >= 0),
  constraint service_prices_recurring_interval_check check (
    (billing_type = 'recurring' and interval is not null)
    or (billing_type = 'one_time' and interval is null)
  )
);

create index if not exists services_organization_id_idx on public.services (organization_id);
create index if not exists services_organization_status_idx on public.services (organization_id, status);
create index if not exists services_organization_service_type_idx on public.services (organization_id, service_type);
create index if not exists service_prices_organization_id_idx on public.service_prices (organization_id);
create index if not exists service_prices_service_id_idx on public.service_prices (service_id);
create index if not exists service_prices_service_id_created_at_idx on public.service_prices (service_id, created_at desc);

alter table public.services enable row level security;
alter table public.service_prices enable row level security;

drop trigger if exists set_services_updated_at on public.services;
create trigger set_services_updated_at
before update on public.services
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_service_prices_updated_at on public.service_prices;
create trigger set_service_prices_updated_at
before update on public.service_prices
for each row
execute procedure public.set_updated_at();

grant select, insert, update, delete on public.services to authenticated;
grant select, insert, update, delete on public.service_prices to authenticated;

drop policy if exists services_select_same_org_members on public.services;
create policy services_select_same_org_members
on public.services
for select
to authenticated
using (public.is_org_member(organization_id));

drop policy if exists services_insert_owner_admin on public.services;
create policy services_insert_owner_admin
on public.services
for insert
to authenticated
with check (public.has_org_role(organization_id, array['owner', 'admin']::text[]));

drop policy if exists services_update_owner_admin on public.services;
create policy services_update_owner_admin
on public.services
for update
to authenticated
using (public.has_org_role(organization_id, array['owner', 'admin']::text[]))
with check (public.has_org_role(organization_id, array['owner', 'admin']::text[]));

drop policy if exists services_delete_owner_admin on public.services;
create policy services_delete_owner_admin
on public.services
for delete
to authenticated
using (public.has_org_role(organization_id, array['owner', 'admin']::text[]));

drop policy if exists service_prices_select_same_org_members on public.service_prices;
create policy service_prices_select_same_org_members
on public.service_prices
for select
to authenticated
using (public.is_org_member(organization_id));

drop policy if exists service_prices_insert_owner_admin on public.service_prices;
create policy service_prices_insert_owner_admin
on public.service_prices
for insert
to authenticated
with check (public.has_org_role(organization_id, array['owner', 'admin']::text[]));

drop policy if exists service_prices_update_owner_admin on public.service_prices;
create policy service_prices_update_owner_admin
on public.service_prices
for update
to authenticated
using (public.has_org_role(organization_id, array['owner', 'admin']::text[]))
with check (public.has_org_role(organization_id, array['owner', 'admin']::text[]));

drop policy if exists service_prices_delete_owner_admin on public.service_prices;
create policy service_prices_delete_owner_admin
on public.service_prices
for delete
to authenticated
using (public.has_org_role(organization_id, array['owner', 'admin']::text[]));

commit;
