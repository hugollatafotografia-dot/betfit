# BETFIT CRM (Sprint 1 Foundation)

BETFIT es un SaaS multi-tenant en construcción.  
Este repositorio contiene la base del **CRM interno** (fase actual), construido con Next.js + TypeScript + Supabase.

## Estado Actual

Incluido en esta fase:

- Auth: signup / login / logout
- Onboarding de organización (tenant inicial)
- Workspace privado con navegación interna
- Módulos CRM base: `team`, `clients`, `services`, `bookings`
- Supabase con RLS y migraciones SQL

No incluido aún:

- Web pública comercial
- Plataforma completa para entrenadores
- App final para clientes de entrenadores

## Requisitos

- Node.js `>=20`
- npm `>=10`

## Setup Local (menos de 10 minutos)

1. Instalar dependencias:

```bash
npm ci
```

2. Configurar variables de entorno:

```bash
cp .env.example .env.local
```

3. Completar `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Ejecutar en local:

```bash
npm run dev
```

5. Abrir:

- http://localhost:3000

## Scripts

- `npm run dev`: entorno local
- `npm run build`: build de producción
- `npm run start`: ejecutar build generado
- `npm run lint`: ESLint (sin warnings permitidos)
- `npm run lint:fix`: ESLint con autocorrección
- `npm run typecheck`: TypeScript sin emitir artefactos
- `npm run check`: validación completa (`lint` + `typecheck` + `build`)
- `npm run format`: Prettier write
- `npm run format:check`: Prettier check

## Estructura del Proyecto

```text
.
├─ src/
│  ├─ app/         # rutas App Router (capas finas)
│  ├─ modules/     # lógica por dominio CRM
│  ├─ services/    # integraciones externas (Supabase SSR/browser)
│  ├─ lib/         # utilidades compartidas y configuración
│  ├─ components/  # UI compartida transversal
│  ├─ hooks/       # hooks reutilizables
│  └─ types/       # tipos compartidos (incluye tipos DB)
├─ supabase/
│  └─ migrations/  # esquema SQL + RLS
├─ docs/           # documentación técnica del producto
└─ .github/
   └─ workflows/   # CI
```

## Base de Datos y Migraciones

Migraciones actuales:

- `20260320192000_sprint1_multitenant_auth.sql`
- `20260321120000_sprint2_clients_services_workspace.sql`
- `20260321130000_sprint3_bookings_foundation.sql`

Aplicación recomendada (con Supabase CLI):

```bash
supabase db push
```

## CI

Hay una pipeline en GitHub Actions: `.github/workflows/ci.yml`.

Valida en cada push/pull_request:

- instalación (`npm ci`)
- lint (`npm run lint`)
- typecheck (`npm run typecheck`)
- build (`npm run build`)

## Troubleshooting Rápido

- Error de variables de entorno: revisa `.env.local` y reinicia `npm run dev`.
- `eslint: command not found`: ejecuta `npm ci`.
- Error de conexión a Supabase: valida URL/anon key y que el proyecto remoto esté activo.

## Documentación Técnica

- Arquitectura del CRM: `docs/architecture-crm.md`
