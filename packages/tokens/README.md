# @protokit/tokens

Design tokens for the Salem Cobalt design system. One Style Dictionary source (`src/`, DTCG format) builds:

| Entry                      | File                          | What                                                                                                                                                                                               |
| -------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@protokit/tokens/css`  | `dist/css/tokens.css`         | Custom properties, `--sc-` prefixed. Light on `:root`, dark on `[data-theme="dark"]` and under `prefers-color-scheme: dark` when no theme is set. `[data-density="compact"]` remaps control sizes. |
| `@protokit/tokens/scss` | `dist/scss/_tokens.scss`      | `$sc-*` variables (light values) and a `$proto-dark` map.                                                                                                                                             |
| `@protokit/tokens`      | `dist/js/tokens.js` + `.d.ts` | Typed nested object; themed tokens are `{ light, dark }`. `cssVar('color-surface-canvas')` returns `var(--proto-color-surface-canvas)`.                                                               |
| `@protokit/tokens/json` | `dist/json/tokens.json`       | `{ light, dark }` flat maps of resolved values.                                                                                                                                                    |

`src/` is the source of truth. `scripts/generate-color.mjs` regenerates the color primitives and the themed color and elevation tokens from OKLCH parameters; run it only when the palette itself changes, then review the diff. `pnpm test` checks every documented text/surface pair against WCAG AA in both themes.

## Layering

`--proto-z-*` is one ordered ladder; every fixed or portaled surface in `@protokit/ui` takes its `z-index` from it and
nothing else sets one. Popups sit above dialogs on purpose: a Menu, Select or Popover opened from inside a Dialog
renders over it, and a Tooltip over that.

| Token             | Value | Used by                                                            |
| ----------------- | ----- | ------------------------------------------------------------------ |
| `--proto-z-base`     | 0     | Normal flow.                                                       |
| `--proto-z-raised`   | 1     | Hover and focus rings over siblings.                               |
| `--proto-z-sticky`   | 100   | Pinned chrome inside the page: sticky Toolbar, Banner, Table head. |
| `--proto-z-backdrop` | 1100  | Dialog scrim.                                                      |
| `--proto-z-dialog`   | 1200  | Dialog popup and sheet.                                            |
| `--proto-z-dropdown` | 1300  | Menu, Select and Popover positioners, so they open over a Dialog.  |
| `--proto-z-toast`    | 1400  | Toasts.                                                            |
| `--proto-z-tooltip`  | 1500  | Tooltips, above everything.                                        |

An app that pins its own chrome (a header, a bottom bar) should use `--proto-z-sticky` or a value below
`--proto-z-backdrop` so dialogs still cover it. `pnpm test` asserts the order.
