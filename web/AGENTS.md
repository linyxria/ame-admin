# Web Conventions

## React

- React Compiler is enabled for this project.
- Do not add `memo`, `useMemo`, or `useCallback` only for render optimization.
- Use manual memoization only when it is required for semantic stability, such as a third-party API that depends on referential identity, or when profiling shows a real issue.

## Layout

- Prefer flex or grid for app shells, sidebars, split panes, and scroll regions.
- Avoid CSS `calc` for subtracting sibling heights when `flex-1`, `min-h-0`, `shrink-0`, or grid tracks can express the layout.
- Use CSS `calc` only for fixed-format canvases, third-party rendering surfaces, or constraints that flex/grid cannot express clearly.

## UI Components

- Use Mantine for application controls and assistant-ui primitives for conversation state and interactions. Consult their official documentation when adding or changing component behavior.
- Configure shared component defaults and theme tokens through MantineProvider. Use documented Styles API selectors and CSS layers for overrides.
- Use native Mantine form bindings and the shared table where applicable. Keep accessible names on icon buttons and labels on inputs.
- Keep the conversation transport on the shared Eden Treaty client. Pass the assistant-ui abort signal through to the streaming request.
