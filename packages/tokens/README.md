# @salemcobalt/tokens

Design tokens for the Salem Cobalt design system. One Style Dictionary source (`src/`, DTCG format) builds:

| Entry                      | File                          | What                                                                                                                                                                                               |
| -------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@salemcobalt/tokens/css`  | `dist/css/tokens.css`         | Custom properties, `--sc-` prefixed. Light on `:root`, dark on `[data-theme="dark"]` and under `prefers-color-scheme: dark` when no theme is set. `[data-density="compact"]` remaps control sizes. |
| `@salemcobalt/tokens/scss` | `dist/scss/_tokens.scss`      | `$sc-*` variables (light values) and a `$sc-dark` map.                                                                                                                                             |
| `@salemcobalt/tokens`      | `dist/js/tokens.js` + `.d.ts` | Typed nested object; themed tokens are `{ light, dark }`. `cssVar('color-surface-canvas')` returns `var(--sc-color-surface-canvas)`.                                                               |
| `@salemcobalt/tokens/json` | `dist/json/tokens.json`       | `{ light, dark }` flat maps of resolved values.                                                                                                                                                    |

`src/` is the source of truth. `scripts/generate-color.mjs` regenerates the color primitives and the themed color and elevation tokens from OKLCH parameters; run it only when the palette itself changes, then review the diff. `pnpm test` checks every documented text/surface pair against WCAG AA in both themes.
