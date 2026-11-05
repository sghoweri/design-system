# ADR 0003: Interaction states — the cursor rule and washes on raised surfaces

Date: 2026-11-05
Status: accepted (Salem, 2026-11-05)

## Context

Two inconsistencies showed up in the consuming app. Menu and select items used `cursor: default` (the native OS menu convention) while every Button used `cursor: pointer`, so the trigger said "clickable" and its items did not. And in the dark theme `color.surface.hover` resolved to the same neutral as `color.surface.raised` (both 900), so a hovered menu item, select option, or a ghost button inside a dialog painted the panel's own colour: no visible hover.

## Decision

**The cursor rule.** Anything a pointer can activate shows `cursor: pointer`: buttons, menu and select items, tabs, chip actions, disclosure summaries, sortable headers, interactive rows and cards, checkbox and switch controls. A disabled activatable element shows `not-allowed`; a busy one shows `progress`; text entry keeps the browser's text cursor. `cursor: default` is reserved for elements that are not activatable (a field label). `packages/ui/src/styles/cursor.test.ts` enforces this against the stylesheets: a new activatable component goes in its list, and a stray `cursor: default` fails the build.

**Washes on raised surfaces.** Two tokens, `color.surface.raised-hover` and `color.surface.raised-active`, are the hover and pressed washes inside raised surfaces. Light keeps today's values (neutral 100 and 200). Dark uses a new primitive step, neutral 850, for hover and neutral 800 for pressed. Each raised container (Menu, Select popup, Dialog, elevated Card) remaps `--sc-color-surface-hover` and `--sc-color-surface-active` to them, so every descendant (items, ghost and secondary buttons, the dialog close button) gets a visible hover without a per-component rule, and a neutral Badge inside keeps the fill it had (dark neutral 800). `color.surface.active` itself is unchanged because it is also the neutral Badge, progress track and skeleton fill, and a lighter value would drop muted text below AA.

## Consequences

- `packages/tokens/test/contrast.test.ts` checks text on the two new surfaces and that every wash is distinguishable (≥ 1.08:1) from the surface under it, in both themes.
- The dark hover inside raised surfaces is deliberately subtle, about the same step as the light theme's white to neutral 100.
- Patch release: no API change.
