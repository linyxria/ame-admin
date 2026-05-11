# Web Conventions

## React

- React Compiler is enabled for this project.
- Do not add `memo`, `useMemo`, or `useCallback` only for render optimization.
- Use manual memoization only when it is required for semantic stability, such as a third-party API that depends on referential identity, or when profiling shows a real issue.

## Layout

- Prefer flex or grid for app shells, sidebars, split panes, and scroll regions.
- Avoid CSS `calc` for subtracting sibling heights when `flex-1`, `min-h-0`, `shrink-0`, or grid tracks can express the layout.
- Use CSS `calc` only for fixed-format canvases, third-party rendering surfaces, or constraints that flex/grid cannot express clearly.

## Ant Design

- Before writing or changing Ant Design code, consult the official component documentation at `https://ant.design/llms-full.txt` or the relevant component page.
- Use documented Ant Design APIs, semantic DOM hooks, and design tokens instead of internal DOM structure or private `.ant-*` selector overrides.
- Prefer project-level wrappers or component props for shared behavior, such as tables, forms, layout, and feedback components.
- Keep Ant Design usage aligned with React Compiler guidance: avoid memoization that is only for render optimization.
