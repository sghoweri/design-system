# ADR 0001: Headless primitives for interactive components

Date: 2026-10-15
Status: proposed (confirm with Salem before 0.1.0)

## Context

`@salemcobalt/ui` needs accessible behaviour (focus management, keyboard handling, ARIA wiring) for interactive components without owning that logic. The two credible unstyled libraries are Base UI (`@base-ui/react`, from the MUI team, stable since 1.0) and React Aria Components (Adobe). In v0 only `Dialog` needs a primitive; Button, Badge, Card, Stack, Inline and Kbd are styled native elements.

## Decision

Use Base UI.

- Its parts are plain unstyled elements with state exposed as `data-*` attributes, which fits a stylesheet-driven system where every look comes from CSS and tokens.
- The `render` prop composes a part onto any element or component (a `Dialog.Trigger` rendering our `Button`) without `asChild` hacks.
- It is small and tree-shakeable; v0 imports only the Dialog parts.
- Styling conventions stay ours. React Aria Components lean on render-prop `className` functions and a broader component model that would shape the system's API more than a thin v0 wants.

React Aria remains the fallback if a later component (combobox, date picker) needs behaviour Base UI lacks; the ADR gets superseded then, not amended.

## Consequences

- `@base-ui/react` is a dependency of `@salemcobalt/ui`; React 19 is a peer.
- Components wrap Base UI parts and never re-export them, so the primitive can change without an API break.
- Keyboard and focus behaviour for Dialog is tested at our layer (open, Esc, focus return) so a primitive upgrade is caught by our tests.
