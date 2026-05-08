# AME Admin Server

The server workspace contains the Elysia backend, Better Auth integration, Drizzle schema, database migrations, and seed scripts for AME Admin.

## Stack

- Elysia for the HTTP API
- Better Auth for email/password authentication and session handling
- PostgreSQL for persistence
- Drizzle ORM and Drizzle Kit for schema and migrations
- Bun for development, scripts, and runtime

## Setup

Install dependencies from the repository root:

```bash
bun install
```

Create the local server environment file:

```bash
cp server/.env.example server/.env
```

The default database URL in `server/.env.example` matches the local Docker database:

```text
DATABASE_URL=postgres://postgres:postgres@localhost:5432/ame_admin
```

## Database

Local development uses Docker Compose so PostgreSQL stays isolated and easy to reproduce across machines.

Start PostgreSQL:

```bash
bun run db:up
```

Run migrations and seed the default administrator:

```bash
bun run db:setup
```

Or run the steps separately:

```bash
bun run db:migrate
bun run db:seed
```

Default local administrator:

```text
Email: admin@example.com
Password: admin123456
```

Update `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` in `server/.env` before seeding if you want different credentials.

Useful database commands:

```bash
bun run db:generate
bun run db:migrate
bun run db:seed
bun run db:studio
bun run db:logs
bun run db:down
```

Docker Compose uses `ame-admin` as the project name, `db` as the container name, and `ame-admin_db` as the persistent volume. The PostgreSQL 18 image stores data under `/var/lib/postgresql`, which is the layout used by this project.

## Development

Start the API server:

```bash
bun run dev
```

The default server URL is:

```text
http://localhost:3000
```

Health check:

```bash
curl http://localhost:3000/health
```

Protected routes should reject unauthenticated requests:

```bash
curl -i http://localhost:3000/me
```

Without a valid Better Auth session cookie, the response should be `401 Unauthorized`.

## Authentication

Better Auth is mounted on the Elysia app and currently uses email/password login. Common auth endpoints include:

- `POST /sign-in/email`
- `POST /sign-out`
- `GET /get-session`

Public registration is disabled by default. Use the seed script to create the initial administrator account.

## API Modules

System administration functionality is split into modules under `src/modules/system`:

- Users
- Roles and RBAC
- Menus
- Settings
- Notifications
- Audit logs
- Profile
- Overview

Keep route handlers, models, services, migrations, and seed data aligned when changing a domain model.

## Type Export

The Elysia app is assembled in `src/app.ts` and exported for Eden Treaty typing:

```ts
export type App = typeof app
```

The web workspace imports this type to build its typed API client. Keep this export stable when refactoring the API entrypoint.

## Quality Checks

Run API type checking:

```bash
bun run typecheck
```

Run repository-wide Biome checks from this workspace:

```bash
bun run check
bun run lint
bun run format
```
