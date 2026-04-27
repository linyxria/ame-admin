# Project Conventions

## Full-Stack Data Flow

- Use Eden Treaty as the frontend API client for Elysia endpoints.
- Export the API app type from the server with `export type App = typeof app`.
- Keep the shared typed client in `web/src/lib/api.ts`.
- Use `@tanstack/react-query` for server state: queries, mutations, loading, errors, and invalidation.
- Do not add ad hoc `fetch` wrappers or duplicate frontend API response types when Eden can infer them.
- Local React state is fine for form drafts, modal visibility, and purely local UI state.

## Refactoring

- Prefer explicit domain fields and structural refactors over brittle convention checks.
- Be willing to make broader coherent changes when they simplify the model or remove magic ids, duplicated logic, or special-case branches.
- Keep migrations, seed data, API types, and UI behavior aligned in the same change.

## React

- React Compiler is enabled for this project.
- Do not add `memo`, `useMemo`, or `useCallback` only for render optimization.
- Use manual memoization only when it is required for semantic stability, such as a third-party API that depends on referential identity, or when profiling shows a real issue.

## File Naming

- Use kebab-case for ordinary source file names.
- Keep framework-required naming syntax where it carries routing meaning, such as TanStack Router route files with `_` or `.` conventions.
- Keep the generated TanStack route tree configured as `web/src/route-tree.gen.ts`.
- Do not hand-edit generated route tree contents; change route files or router plugin config instead.
