# BETFIT CRM - Arquitectura Técnica (Sprint 1)

## 1. Qué es BETFIT hoy

BETFIT es un SaaS multi-tenant en evolución.  
La parte activa hoy es el **CRM interno** para operaciones del equipo BETFIT.

Objetivo actual:

- gestionar autenticación y acceso interno
- operar espacios de trabajo por organización (tenant)
- sostener operaciones CRM base (equipo, clientes, servicios, reservas)

## 2. Alcance funcional actual del CRM

Módulos implementados:

- `auth`: signup/login/logout y redirecciones server-side
- `organizations`: onboarding inicial y contexto de workspace
- `team`: listado y edición de rol/estado de miembros
- `clients`: alta, edición y listado
- `services`: alta, edición y listado con pricing
- `bookings`: alta, edición y listado de reservas

Fuera de alcance en esta fase:

- web pública comercial
- experiencia completa para entrenadores
- app final para usuarios de entrenadores

## 3. Organización de la codebase

```text
src/
├─ app/         # App Router: rutas, layouts y composición
├─ modules/     # dominio por vertical funcional
├─ services/    # clientes de infraestructura externa (Supabase)
├─ lib/         # utilidades compartidas/configuración
├─ components/  # UI reusable transversal
├─ hooks/       # hooks de UI/cliente
└─ types/       # tipos TS y tipos de base de datos
```

Principio aplicado: rutas finas + lógica de negocio por módulo.

## 4. Infraestructura vs Dominio vs UI

Infraestructura:

- `src/services/supabase/*` (SSR/middleware/browser client)
- `supabase/migrations/*` (esquema, constraints, RLS)

Dominio:

- `src/modules/*/actions.ts` (casos de uso write)
- `src/modules/*/queries.ts` (lecturas por dominio)
- `src/modules/*/schemas.ts` (validación entrada)

UI:

- `src/modules/*/components/*` (formularios/tablas)
- `src/app/*` (routing y layout de alto nivel)

## 5. Multi-tenant y seguridad

Modelo:

- `organizations`
- `organization_members`

Aislamiento:

- políticas RLS por pertenencia/rol
- acceso de escritura condicionado por `owner/admin`

Notas de seguridad:

- no se usa service role key en frontend
- acciones mutantes pasan por server actions y RLS

## 6. Flujo de datos resumido

1. La ruta server-side compone la página.
2. `queries` leen datos de Supabase con contexto autenticado.
3. Formularios cliente llaman `server actions`.
4. `actions` validan input con Zod y escriben en DB.
5. Se invalida cache (`revalidatePath`) y se redirige.

## 7. Estándares base de calidad

- TypeScript `strict`
- ESLint sin warnings
- Prettier
- CI en GitHub Actions para `lint + typecheck + build`

## 8. Gobernanza de repositorio

Este repositorio es la **única fuente de verdad** del CRM Sprint 1.  
Se eliminaron repos anidados/duplicados para evitar ambigüedad operativa.
