# design-system

Salem Cobalt: a personal design system. Publishes `@salemcobalt/tokens` and `@salemcobalt/ui`, with a public docs site and Storybook. Read `DESIGN_SYSTEM_BRIEF.md` first.

```
packages/tokens   @salemcobalt/tokens   Style Dictionary source → CSS custom properties, Sass, TypeScript, JSON
packages/ui       @salemcobalt/ui       React 19 components on Base UI, CSS shipped as one stylesheet
apps/storybook    Storybook with the a11y addon on every story
apps/docs         Docs site on Astro + Starlight; the Storybook is copied in at /workshop/
docs/             project.json (portfolio contract), ADRs, releasing.md
```

## Develop

Node 24 and pnpm 10 (`corepack enable` or `npm i -g pnpm`).

```sh
pnpm install
pnpm build        # tokens, then ui
pnpm test
pnpm storybook    # http://localhost:6006
pnpm docs         # http://localhost:4321 (docs site, dev server; no /workshop/ until it is built)
```

## Consume

```sh
pnpm add @salemcobalt/tokens @salemcobalt/ui
```

```ts
import '@salemcobalt/tokens/css';
import '@salemcobalt/ui/fonts'; // optional: self-hosted IBM Plex and Unbounded
import '@salemcobalt/ui/styles.css';
import { Button } from '@salemcobalt/ui';
```

Set `data-theme="light"` or `"dark"` on `<html>`; with no attribute the system follows `prefers-color-scheme`.

## Docs site and Storybook

The site is hosted on Vercel at <https://designsystem.salemcobalt.com>: the docs (Astro + Starlight, `apps/docs`) at `/` and the Storybook at `/workshop/`, in one deploy. `vercel.json` at the repo root builds it with `pnpm build && pnpm build-storybook && pnpm build-docs` on Node 24 and serves `apps/docs/dist`; the docs build copies `apps/storybook/storybook-static` into `dist/workshop/` and validates internal links. Old Storybook links (`/?path=…`, `/iframe.html`) redirect to `/workshop/`. [ADR 0007](docs/adr/0007-docs-site.md) records the decision.

To preview the whole site locally: `pnpm build && pnpm build-storybook && pnpm build-docs`, then `pnpm --filter docs preview`.

- Every push to `main` deploys production.
- Every pull request gets its own preview URL, posted by the Vercel bot on the PR.
- A deploy is skipped when nothing under `packages/`, `apps/storybook/`, `apps/docs/`, `pnpm-lock.yaml` or `vercel.json` changed.

There is no deploy step in GitHub Actions. `ci.yml` lints the workflows themselves (actionlint, zizmor),
then installs, lints, builds, checks that the build left the tree clean, typechecks, tests and builds the
Storybook and the docs site, all in one job named `check`. The `main` ruleset in the repo settings requires that status
before a merge. Every action in the workflows is pinned to a commit SHA; Dependabot keeps the pins and
the npm dependencies current.

## Release

Every merge to `main` publishes a release candidate (`X.Y.Z-rc.N`, npm dist-tag `next`); merging `main` into `release` publishes the stable version to `latest`, writes `CHANGELOG.md` and tags it. Versions come from nx release and conventional commits, npm auth is Trusted Publishing with provenance, no token is stored. A PR labeled `canary` publishes `0.0.0-canary.<sha>`. Setup and details: [docs/releasing.md](docs/releasing.md). What is not built yet: [docs/backlog.md](docs/backlog.md).

The site keeps building on Vercel's Git integration for now; [ADR 0002](docs/adr/0002-storybook-builds-on-vercel.md) records why and when that ends.
