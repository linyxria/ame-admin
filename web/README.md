# AME Admin Web

The web workspace contains the React admin UI for AME Admin. It uses TanStack Router for file-based routing, TanStack Query for server state, Mantine for application components, assistant-ui for AI conversation, and Eden Treaty for type-safe calls to the Elysia API.

## Stack

- React and Vite
- TanStack Router
- TanStack Query
- Eden Treaty
- Better Auth React client
- Mantine
- assistant-ui
- Tailwind CSS
- React Compiler

## Setup

Install dependencies from the repository root:

```bash
pnpm install
```

Start the API first, including the local database setup described in `../server/README.md`.

Then start the web development server:

```bash
pnpm run dev
```

The default web URL is:

```text
http://localhost:5173
```

## Environment

By default, the web app talks to the local API at:

```text
http://localhost:3000
```

To point the web app at a different API, create `web/.env.local`:

```bash
VITE_API_URL=http://localhost:3000
```

The API must allow this origin through `CORS_ORIGIN`, and auth requests require credentials to be included for cookie-based sessions.

## Login

Start and seed the backend first:

```bash
cd ../server
pnpm run db:up
pnpm run db:setup
pnpm run dev
```

Start the frontend in a second terminal:

```bash
cd ../web
pnpm run dev
```

Default local administrator:

```text
Email: admin@example.com
Password: admin123456
```

## Routing

Routes are defined with TanStack Router in `src/routes`.

Important routes:

- `/login`
- `/dashboard`
- `/notifications`
- `/account/settings`
- `/system/users`
- `/system/roles`
- `/system/menus`
- `/system/settings`
- `/system/audit-logs`
- `/demos/charts`
- `/demos/form`
- `/demos/table`

The generated route tree is `src/route-tree.gen.ts`. Do not edit it manually; update route files or router plugin configuration instead.

## API Access

Business API calls should use the shared Eden Treaty client in `src/lib/api.ts`:

```ts
export const api = treaty<App>(API_URL, {
  fetch: {
    credentials: "include",
  },
})
```

Use TanStack Query for server state: queries, mutations, loading states, errors, and invalidation. Keep local React state for form drafts, modal visibility, and purely local UI state.

Authentication uses the Better Auth React client. Business API calls use Eden Treaty and inherit API types from the backend `App` export.

## Styling

Application controls use Mantine and layout utilities use Tailwind CSS. Mantine styles load in a named CSS layer between Tailwind's base and application styles. Light and dark appearance, brand color, and density are managed in the application theme provider.

The AI conversation uses assistant-ui with the shared Eden Treaty client for the application SSE endpoint.

## React Notes

React Compiler is enabled. Avoid adding `memo`, `useMemo`, or `useCallback` only for render optimization. Use manual memoization when referential identity is semantically required by an external API or when profiling proves a real performance issue.

## Commands

Start development:

```bash
pnpm run dev
```

Build for production:

```bash
pnpm run build
```

Run frontend tests:

```bash
pnpm run test
```

Preview the production build:

```bash
pnpm run preview
```

Run repository-wide Biome checks from this workspace:

```bash
pnpm run check
pnpm run lint
pnpm run format
```
