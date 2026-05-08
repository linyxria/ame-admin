# AME Admin Web

The web workspace contains the React admin UI for AME Admin. It uses TanStack Router for file-based routing, TanStack Query for server state, Ant Design for application components, and Eden Treaty for type-safe calls to the Elysia API.

## Stack

- React and Vite
- TanStack Router
- TanStack Query
- Eden Treaty
- Better Auth React client
- Ant Design
- Tailwind CSS
- React Compiler

## Setup

Install dependencies from the repository root:

```bash
bun install
```

Start the API first, including the local database setup described in `../server/README.md`.

Then start the web development server:

```bash
bun run dev
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
bun run db:up
bun run db:setup
bun run dev
```

Start the frontend in a second terminal:

```bash
cd ../web
bun run dev
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

The UI combines Ant Design components with Tailwind CSS utility classes.

Ant Design component styles are injected by the library runtime. The app does not currently import `antd/dist/reset.css`; if a global reset becomes necessary later, handle CSS layer ordering deliberately.

## React Notes

React Compiler is enabled. Avoid adding `memo`, `useMemo`, or `useCallback` only for render optimization. Use manual memoization when referential identity is semantically required by an external API or when profiling proves a real performance issue.

## Commands

Start development:

```bash
bun run dev
```

Build for production:

```bash
bun run build
```

Preview the production build:

```bash
bun run preview
```

Run repository-wide Biome checks from this workspace:

```bash
bun run check
bun run lint
bun run format
```
