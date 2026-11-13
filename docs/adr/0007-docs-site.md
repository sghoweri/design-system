# ADR 0007: A docs site on Astro + Starlight, with the Storybook as its workshop

Date: 2026-11-12
Status: accepted (Salem, 2026-11-12: scope, plugin and URL move confirmed before the build)

## Context

Until now <https://designsystem.salemcobalt.com> was the Storybook and nothing else. That is the "workshop" half
of a design-system site: every component and state in isolation. The "storefront" half (a homepage, setup
guidance, long-form pages, token reference, search) had nowhere to live except the package READMEs.

Salem's documentation guideline (frontend-architecture, guideline 13, decision B12 of 2026-11-03) already picks
the stack: Astro + Starlight as the storefront at `/`, Storybook as the workshop at `/workshop/`, one deploy.
This ADR records how that lands in this repo and where v0 diverges from the guideline.

Three readings of "add Astro to the Storybook" were on the table:

| Option                                                                                | Gets                                                                                                | Costs                                                                                                                                |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| (a) Astro + Starlight docs site, Storybook copied in at `/workshop/`                  | Homepage, guides, token pages, Pagefind search, link validation; proves the package in an Astro app | A second app to build and theme; the Storybook's URLs move                                                                           |
| (b) Astro components as stories (`@storybook-astro/framework`, a community framework) | `.astro` files rendered in the existing Storybook                                                   | The system ships React components and no `.astro` files, so there is nothing to render; adds Vitest and Astro peers to the Storybook |
| (c) An example Astro app only                                                         | Proves SSR and islands                                                                              | No docs; a demo nobody reads                                                                                                         |

Versions checked on npm on 2026-11-12: `astro` 7.4.11, `@astrojs/starlight` 0.42.11, `@astrojs/react` 7.1.8,
`starlight-links-validator` 0.27.0 (peers: `astro >=7.2.10`, `@astrojs/starlight >=0.42.0`),
`@storybook-astro/framework` 1.16.0 (supports Storybook 10 and Astro 7, so (b) stays open for later).

## Decision

**(a).** A new workspace app, `apps/docs`, on Astro + Starlight with `@astrojs/react` and
`starlight-links-validator`. Option (c) comes for free: the docs site is itself an Astro app consuming the
packages, and its "Using the system in Astro" guide documents what it does.

1. **One deploy, two halves.** `vercel.json` builds `pnpm build && pnpm build-storybook && pnpm build-docs` and
   serves `apps/docs/dist`. A small Astro integration (`apps/docs/src/integrations/workshop.mjs`) copies
   `apps/storybook/storybook-static/` to `dist/workshop/` in `astro:build:done`, and fails the build with the
   command to run if the Storybook build is missing. The Storybook needs no base-path setting: its static build
   uses relative URLs.
2. **The Storybook's URLs move to `/workshop/`.** Three permanent redirects in `vercel.json` keep old links
   working: `/` with a `path` query (story links such as `/?path=/story/components-button--variants`),
   `/iframe.html` (isolated stories, used in tickets and visual tests) and `/index.json`.
3. **The site consumes the published build, not source.** `apps/docs` imports `@salemcobalt/tokens/css`,
   `@salemcobalt/ui/styles.css`, `@salemcobalt/ui/fonts` and the components from the workspace packages' `dist`,
   through their `exports`, exactly as an app would. The Storybook keeps aliasing `@salemcobalt/ui` to source for
   fast refresh. So the docs build is also a smoke test of what npm users get, and `pnpm build` must run first.
4. **Starlight is themed by mapping its custom properties onto the system's semantic tokens**
   (`apps/docs/src/styles/theme.css`), declared once: Starlight sets `data-theme="light|dark"` on `<html>`, the
   same attribute `@salemcobalt/tokens` reads, so one switcher themes the chrome and the components. The mapping is
   unlayered and Starlight's own rules are in `@layer starlight.*`, so it wins without specificity. Component CSS
   stays in `@layer sc`.
5. **Static by default, islands where behaviour needs them.** Components without behaviour (Button, Badge) are
   rendered to HTML by Astro with no client JavaScript. Base UI compositions (Tabs, Dialog, Menu) are wrapped in a
   React component and hydrated with `client:visible`; compound parts must live inside that wrapper because Astro
   hydrates only the outermost component.
6. **Token pages render from data.** `Swatches.astro` reads `@salemcobalt/tokens/json` and paints each chip with
   the custom property itself (guideline 13 rule 3). No hand-typed colour tables.
7. **Internal links are validated in the build** (`starlight-links-validator`, guideline 13 rule 6). `/workshop/`
   links are excluded because that folder is copied in after Astro's pages exist.
8. **CI builds it.** `ci.yml` runs `pnpm build-docs` after `pnpm build-storybook`; `pnpm -r typecheck` now includes
   `astro check`.

## Where this diverges from guideline 13 (on purpose, for v0)

- **React, not web components.** The guideline assumes Lit and a custom-elements manifest feeding prop tables.
  This system is React on Base UI (ADR 0001), so there is no CEM, and prop tables stay in the package README and
  Storybook controls for now.
- **No `docs-data` layer yet.** The guideline's Nx target that writes every fact to `*.ds.json` is not built; the
  one data-driven page reads the tokens package's JSON directly. With one data source, a bus would be designed
  from one use.
- **No shared site header, version switcher or status board.** The two halves link to each other (Starlight's
  header and sidebar link to `/workshop/`) but do not share a header component. There is one version, so there is
  nothing to switch between.
- **Search covers the docs half only.** Pagefind indexes Astro's pages; Storybook keeps its own story search.

Each is in `docs/backlog.md`.

## Consequences

- The site's first page is now the docs homepage; the Storybook is one click away at `/workshop/`.
- The Vercel build grows by the Astro build: about two seconds locally for six pages, on top of the package and
  Storybook builds.
  ADR 0002 still holds: this is one deployable, built by Vercel's Git integration.
- `vercel.json`'s `ignoreCommand` now also watches `apps/docs/`.
- New dependencies live only in `apps/docs` (private, never published). Nothing changes in the published packages.
- `astro check` needs a complete install: after pulling this change, run `pnpm install` once, or `astro check`
  can fail loading its WebAssembly binding from a stale `node_modules`.

## Verification

Vercel's commands (`pnpm install --frozen-lockfile && pnpm build && pnpm build-storybook && pnpm build-docs`),
`pnpm -s lint`, `pnpm -s -r typecheck` and `pnpm test` pass locally on Node 24. In Chromium against
`astro preview`: every page in light and dark at 1024 and 390 (screenshots in `docs/screenshots/docs-*.png` and
`workshop-button-*.png`); the Tabs island hydrates, changes panel on click and moves focus with the arrow keys;
the Storybook loads and renders stories under `/workshop/`; no console errors.

**Not verified locally:** the three `vercel.json` redirects. `has` conditions do not run under `vercel dev`, and
Vercel's `vercel.json` reference does not state whether a redirect keeps the incoming query string. Check on the
pull request's preview deployment that `/?path=/story/components-button--variants` lands on the same story under
`/workshop/`; if the query is dropped, capture it in the `has` value and write it into the destination.
