begin;

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text null,
  avatar_url text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  vertical text not null,
  owner_user_id uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organizations_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'staff', 'client')),
  status text not null default 'active' check (status in ('active', 'invited', 'disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  assigned_user_id uuid null references auth.users (id) on delete set null,
  email text null,
  full_name text not null,
  phone text null,
  status text not null default 'lead' check (status in ('lead', 'active', 'inactive')),
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid null references public.organizations (id) on delete set null,
  actor_user_id uuid null references auth.users (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists organizations_owner_user_id_idx on public.organizations (owner_user_id);
create index if not exists organization_members_user_id_idx on public.organization_members (user_id);
create index if not exists organization_members_organization_id_idx on public.organization_members (organization_id);
create index if not exists clients_organization_id_idx on public.clients (organization_id);
create index if not exists clients_assigned_user_id_idx on public.clients (assigned_user_id);
create index if not exists audit_logs_organization_id_idx on public.audit_logs (organization_id);
create index if not exists audit_logs_actor_user_id_idx on public.audit_logs (actor_user_id);
create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_organizations_updated_at on public.organizations;
create trigger set_organizations_updated_at
before update on public.organizations
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_organization_members_updated_at on public.organization_members;
create trigger set_organization_members_updated_at
before update on public.organization_members
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_clients_updated_at on public.clients;
create trigger set_clients_updated_at
before update on public.clients
for each row
execute procedure public.set_updated_at();

create or replace function public.is_org_member(
  p_organization_id uuid,
  p_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = p_organization_id
      and om.user_id = coalesce(p_user_id, auth.uid())
      and om.status = 'active'
  );
$$;

create or replace function public.has_org_role(
  p_organization_id uuid,
  p_roles text[],
  p_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = p_organization_id
      and om.user_id = coalesce(p_user_id, auth.uid())
      and om.status = 'active'
      and om.role = any (p_roles)
  );
$$;

create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
        updated_at = now();

  insert into public.audit_logs (
    organization_id,
    actor_user_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    null,
    new.id,
    'signup_completed',
    'auth_user',
    new.id,
    jsonb_build_object('email', new.email)
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_auth_user_created();

create or replace function public.create_organization_with_owner(
  p_name text,
  p_slug text,
  p_vertical text
)
returns public.organizations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_organization public.organizations%rowtype;
  v_member public.organization_members%rowtype;
begin
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if coalesce(trim(p_name), '') = '' then
    raise exception 'ORGANIZATION_NAME_REQUIRED';
  end if;

  if coalesce(trim(p_vertical), '') = '' then
    raise exception 'ORGANIZATION_VERTICAL_REQUIRED';
  end if;

  if p_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'INVALID_SLUG_FORMAT';
  end if;

  if exists (
    select 1
    from public.organization_members om
    where om.user_id = v_user_id
      and om.status = 'active'
  ) then
    raise exception 'USER_ALREADY_ONBOARDED';
  end if;

  insert into public.organizations (name, slug, vertical, owner_user_id)
  values (trim(p_name), p_slug, trim(p_vertical), v_user_id)
  returning * into v_organization;

  insert into public.organization_members (organization_id, user_id, role, status)
  values (v_organization.id, v_user_id, 'owner', 'active')
  returning * into v_member;

  insert into public.audit_logs (
    organization_id,
    actor_user_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values
    (
      v_organization.id,
      v_user_id,
      'organization_created',
      'organization',
      v_organization.id,
      jsonb_build_object(
        'name', v_organization.name,
        'slug', v_organization.slug,
        'vertical', v_organization.vertical
      )
    ),
    (
      v_organization.id,
      v_user_id,
      'membership_created',
      'organization_member',
      v_member.id,
      jsonb_build_object(
        'organization_id', v_organization.id,
        'user_id', v_user_id,
        'role', 'owner',
        'status', 'active'
      )
    );

  return v_organization;
end;
$$;

revoke all on function public.is_org_member(uuid, uuid) from public;
revoke all on function public.has_org_role(uuid, text[], uuid) from public;
revoke all on function public.create_organization_with_owner(text, text, text) from public;

grant execute on function public.is_org_member(uuid, uuid) to authenticated;
grant execute on function public.has_org_role(uuid, text[], uuid) to authenticated;
grant execute on function public.create_organization_with_owner(text, text, text) to authenticated;

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.organizations to authenticated;
grant select, insert, update, delete on public.organization_members to authenticated;
grant select, insert, update, delete on public.clients to authenticated;
grant select, insert on public.audit_logs to authenticated;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.clients enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists organizations_select_member on public.organizations;
create policy organizations_select_member
on public.organizations
for select
to authenticated
using (public.is_org_member(id));

drop policy if exists organizations_insert_owner on public.organizations;
create policy organizations_insert_owner
on public.organizations
for insert
to authenticated
with check (owner_user_id = auth.uid());

drop policy if exists organizations_update_owner_admin on public.organizations;
create policy organizations_update_owner_admin
on public.organizations
for update
to authenticated
using (public.has_org_role(id, array['owner', 'admin']::text[]))
with check (public.has_org_role(id, array['owner', 'admin']::text[]));

drop policy if exists organizations_delete_owner_admin on public.organizations;
create policy organizations_delete_owner_admin
on public.organizations
for delete
to authenticated
using (public.has_org_role(id, array['owner', 'admin']::text[]));

drop policy if exists organization_members_select_same_org on public.organization_members;
create policy organization_members_select_same_org
on public.organization_members
for select
to authenticated
using (public.is_org_member(organization_id));

drop policy if exists organization_members_insert_owner_admin on public.organization_members;
create policy organization_members_insert_owner_admin
on public.organization_members
for insert
to authenticated
with check (public.has_org_role(organization_id, array['owner', 'admin']::text[]));

drop policy if exists organization_members_update_owner_admin on public.organization_members;
create policy organization_members_update_owner_admin
on public.organization_members
for update
to authenticated
using (public.has_org_role(organization_id, array['owner', 'admin']::text[]))
with check (public.has_org_role(organization_id, array['owner', 'admin']::text[]));

drop policy if exists organization_members_delete_owner_admin on public.organization_members;
create policy organization_members_delete_owner_admin
on public.organization_members
for delete
to authenticated
using (public.has_org_role(organization_id, array['owner', 'admin']::text[]));

drop policy if exists clients_select_same_org on public.clients;
create policy clients_select_same_org
on public.clients
for select
to authenticated
using (public.is_org_member(organization_id));

drop policy if exists clients_insert_owner_admin on public.clients;
create policy clients_insert_owner_admin
on public.clients
for insert
to authenticated
with check (public.has_org_role(organization_id, array['owner', 'admin']::text[]));

drop policy if exists clients_update_owner_admin on public.clients;
create policy clients_update_owner_admin
on public.clients
for update
to authenticated
using (public.has_org_role(organization_id, array['owner', 'admin']::text[]))
with check (public.has_org_role(organization_id, array['owner', 'admin']::text[]));

drop policy if exists clients_delete_owner_admin on public.clients;
create policy clients_delete_owner_admin
on public.clients
for delete
to authenticated
using (public.has_org_role(organization_id, array['owner', 'admin']::text[]));

drop policy if exists audit_logs_select_own_or_org_admin on public.audit_logs;
create policy audit_logs_select_own_or_org_admin
on public.audit_logs
for select
to authenticated
using (
  (organization_id is null and actor_user_id = auth.uid())
  or (
    organization_id is not null
    and public.has_org_role(organization_id, array['owner', 'admin']::text[])
  )
);

drop policy if exists audit_logs_insert_own_or_org_admin on public.audit_logs;
create policy audit_logs_insert_own_or_org_admin
on public.audit_logs
for insert
to authenticated
with check (
  actor_user_id = auth.uid()
  and (
    organization_id is null
    or public.has_org_role(organization_id, array['owner', 'admin']::text[])
  )
);

commit;
