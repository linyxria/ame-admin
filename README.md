# AME Admin

AME Admin is a full-stack admin dashboard starter built with pnpm workspaces. It pairs an Elysia API with a React/Vite web app, using PostgreSQL for persistence and end-to-end typed API calls through Eden Treaty.

## Stack

- Package manager: pnpm
- Runtime: Bun for the API, Node.js for frontend tooling
- API: Elysia, Better Auth, Drizzle ORM, PostgreSQL
- Web: React, Vite, TanStack Router, TanStack Query, Ant Design, Tailwind CSS
- API client: Eden Treaty, typed from the server `App` export
- Code quality: Biome for linting and formatting

## Workspace

```text
server - Elysia backend, database schema, migrations, and seed scripts
web    - React admin UI
```

The repository uses a single root `pnpm-lock.yaml`. Dependency installation and common commands should be run from the repository root unless you are working on a workspace-specific task.

## Quick Start

Install pnpm 12, Node.js 24.11 or newer, Bun, and Docker with Compose. Then install dependencies:

```bash
pnpm install
```

Create the server environment file:

```bash
cp server/.env.example server/.env
```

Start PostgreSQL and initialize the database:

```bash
pnpm run db:up
pnpm run db:setup
```

Start the API and web app in separate terminals:

```bash
pnpm run dev:server
```

```bash
pnpm run dev:web
```

Default local services:

- API: `http://localhost:3000`
- Web: `http://localhost:5173`
- PostgreSQL: `localhost:5432`

Default local administrator:

```text
Email: admin@example.com
Password: admin123456
```

Change these values in `server/.env` before seeding if you want different local credentials.

## Environment

The server environment is defined in `server/.env.example`.

Key variables:

- `PORT`: API server port
- `DATABASE_URL`: PostgreSQL connection string
- `BETTER_AUTH_URL`: public API origin used by Better Auth
- `BETTER_AUTH_SECRET`: secret used by Better Auth
- `CORS_ORIGIN`: allowed web app origin
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`: seed administrator account

The web app uses `http://localhost:3000` as the default API URL. To override it, create `web/.env.local`:

```bash
VITE_API_URL=http://localhost:3000
```

## Common Commands

Run backend and frontend development servers:

```bash
pnpm run dev:server
pnpm run dev:web
```

Build and type-check:

```bash
pnpm run build:web
pnpm run typecheck:server
```

Manage the local database:

```bash
pnpm run db:up
pnpm run db:setup
pnpm run db:down
```

Run Biome checks:

```bash
pnpm run check
pnpm run lint
pnpm run format
```

Apply safe formatting and lint fixes:

```bash
pnpm run check:write
```

You can also run workspace scripts directly:

```bash
pnpm --filter @ame-admin/server run dev
pnpm --filter @ame-admin/web run build
```

## Database

Local development uses Docker Compose from the server workspace. The compose project is named `ame-admin`, the database container is `ame-admin-db`, and the persistent volume is `ame-admin-data`.

Useful server workspace commands:

```bash
pnpm --filter @ame-admin/server run db:logs
pnpm --filter @ame-admin/server run db:generate
pnpm --filter @ame-admin/server run db:migrate
pnpm --filter @ame-admin/server run db:seed
pnpm --filter @ame-admin/server run db:studio
```

The default `DATABASE_URL` already matches the Docker database:

```text
postgres://postgres:postgres@localhost:5432/ame_admin
```

## Application Areas

The current admin UI includes:

- Authentication and protected admin routes
- Dashboard overview
- User, role, menu, settings, and audit log management
- Notifications
- Account settings
- Localization and theme support
- Demo chart, form, and table pages

## API Typing

The backend exports the Elysia app type:

```ts
export type App = typeof app
```

The frontend keeps the shared typed client in `web/src/lib/api.ts`:

```ts
export const api = treaty<App>(API_URL, {
  fetch: {
    credentials: "include",
  },
})
```

Use this client with TanStack Query for server state. Avoid adding duplicate response types or ad hoc fetch wrappers when Eden can infer the API shape.

## Code Quality

Biome is configured at the repository root in `biome.json` and covers both workspaces. The generated TanStack Router route tree lives at `web/src/route-tree.gen.ts` and should not be edited by hand.

React Compiler is enabled in the web app. Avoid adding `memo`, `useMemo`, or `useCallback` solely for render optimization; only use manual memoization when a semantic identity requirement or measured performance issue calls for it.
