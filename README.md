# design-system

Salem Cobalt: a personal design system. Publishes `@salemcobalt/tokens` and `@salemcobalt/ui`, with a public Storybook. Read `DESIGN_SYSTEM_BRIEF.md` first.

```
packages/tokens   @salemcobalt/tokens   Style Dictionary source → CSS custom properties, Sass, TypeScript, JSON
packages/ui       @salemcobalt/ui       React 19 components on Base UI, CSS shipped as one stylesheet
apps/storybook    Storybook with the a11y addon on every story
docs/             project.json (portfolio contract), ADRs
```

## Develop

Node 24 and pnpm 10 (`corepack enable` or `npm i -g pnpm`).

```sh
pnpm install
pnpm build        # tokens, then ui
pnpm test
pnpm storybook    # http://localhost:6006
```

## Consume

```sh
pnpm add @salemcobalt/tokens @salemcobalt/ui
```

```ts
import '@salemcobalt/tokens/css';
import '@salemcobalt/ui/styles.css';
import { Button } from '@salemcobalt/ui';
```

Set `data-theme="light"` or `"dark"` on `<html>`; with no attribute the system follows `prefers-color-scheme`.
