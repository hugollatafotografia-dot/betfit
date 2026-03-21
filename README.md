# BETFIT SaaS Starter - Sprint 1

Production-grade Sprint 1 foundation for a multi-tenant B2B2C SaaS:

- Next.js App Router + TypeScript (strict)
- TailwindCSS
- Supabase Auth + RLS
- Modular domain architecture
- Auth, onboarding, tenant membership, and RBAC foundations

## Folder Architecture

```text
src
├─ app/          # Routes only (thin pages/layouts)
├─ modules/      # Domain logic (auth, organizations)
├─ lib/          # Shared config/helpers
├─ services/     # External integrations (Supabase clients)
├─ hooks/
├─ components/   # Shared UI
└─ types/        # Shared type definitions
```

## Sprint 1 Scope

Implemented:

- Email/password signup, login, logout
- Session handling with Supabase SSR + middleware
- Multi-tenant onboarding (create first organization)
- Organization membership as dedicated join model
- Role-ready foundation: `owner`, `admin`, `staff`, `client`
- Protected app shell with server-side redirects
- Audit logging for key actions
- SQL schema + RLS policies for secure tenant isolation

## Database Migration

Migration file:

- `supabase/migrations/20260320192000_sprint1_multitenant_auth.sql`

Apply with your Supabase workflow (for example Supabase CLI):

```bash
supabase db push
```

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Required vars:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

No service role key is used in the client or exposed to the browser.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run lint:fix`
- `npm run format`
- `npm run format:check`

## Local Run

```bash
npm install
npm run dev
```
