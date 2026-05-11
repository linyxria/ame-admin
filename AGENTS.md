# Project Conventions

## Directory-Specific Instructions

- For any task that touches `web/`, read `web/AGENTS.md` before planning or editing.
- For any task that touches `server/`, read `server/AGENTS.md` before planning or editing when that file exists.
- For tasks involving frontend UI, Ant Design, React, accessibility, or frontend performance under `web/`, read the relevant skill files under `web/.agents/skills/` before planning or editing.
- For tasks involving backend architecture, API design, database work, authentication, authorization, or server performance under `server/`, read the relevant skill files under `server/.agents/skills/` before planning or editing when that directory exists.
- Treat directory-local `AGENTS.md` and `.agents/skills/*/SKILL.md` files as canonical for that directory. Do not duplicate their full contents in this root file.

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

## Functions

- Use `function` declarations for top-level functions.
- Do not define module-level functions as `const foo = () => ...`.
- This does not apply to local functions inside React components or callbacks passed inline to APIs.

## File Naming

- Use kebab-case for ordinary source file names.
- Keep framework-required naming syntax where it carries routing meaning, such as TanStack Router route files with `_` or `.` conventions.
- Keep the generated TanStack route tree configured as `web/src/route-tree.gen.ts`.
- Do not hand-edit generated route tree contents; change route files or router plugin config instead.
