# Design System Brief

Extracted from the job-radar project brief (§4), 2026-10-15. This repo publishes `@salemcobalt/tokens` and `@salemcobalt/ui`; job-radar is the first consumer.


Every side project — this one first — pulls UI from one published system. This is its own repo and its own portfolio artifact.

### Repo: `salemcobalt/design-system` (public)
```
packages/tokens      @salemcobalt/tokens   Style Dictionary source → CSS custom properties, Sass, TS typings, JSON
packages/ui          @salemcobalt/ui       React components on headless primitives (Base UI or React Aria)
packages/eslint-config, packages/tsconfig  shared config, if useful
apps/storybook       public Storybook on Vercel (storybook.salemcobalt.com)
```

### Release pipeline (what you asked for)
- **Lerna + Intuit Auto**: conventional commits → semver → changelog → GitHub release → npm publish, on merge to `main`. Plugins: `npm`, `released`, `conventional-commits`, `first-time-contributor` off. `canary` publishes on PRs so job-radar can test unreleased components.
- Storybook deploys on every merge; Chromatic or Lost Pixel for visual regression (you have Lost Pixel on the resume).
- Published packages are ESM, typed, tree-shakeable, with `exports` maps and CSS delivered as a stylesheet plus the token custom properties.

### v0 scope — the "UI fundamentals" (deliberately small)
Tokens: color (primitive + semantic, light/dark), type scale (fluid), spacing scale, radius, elevation, motion durations/easings, z-index, density.
Baseline: focus rings, contrast ≥ WCAG AA, `prefers-reduced-motion`, RTL-safe logical properties, 44px touch targets.
Components (12, no more for v0): Button, IconButton, Input, Textarea, Select, Checkbox/Switch, Badge/Tag, Card, Table, Dialog, Toast, Tabs. Plus layout primitives: Stack, Inline, Grid, Container. Plus `Kbd` because the inbox is keyboard-driven.

### Sequencing so the design system doesn't eat the job search
- **DS Phase 0 (2–3 days, first):** tokens, the 12 components, Storybook, Auto pipeline, first npm publish. Done when job-radar can `pnpm add @salemcobalt/ui` and render an inbox row.
- **Rule for everything after v0:** *app first, extract second.* New components are built inside job-radar, used once, then promoted to the DS when a second use appears. The DS never blocks a job-radar feature.
- The DS repo also gets `docs/project.json` and a CHANGELOG, so it shows up on the portfolio the same way job-radar does (§5).


---

## Decisions (2026-10-15)

- **Thin v0.** Tokens plus Button, Badge, Card, Stack, Inline, Kbd, Dialog. Published by hand as 0.1.0 so the consuming app can start. The remaining v0 components (IconButton, Input, Textarea, Select, Checkbox/Switch, Table, Toast, Tabs, Grid, Container) are built app-first and promoted here on second use.
- **Spec first.** The visual language is settled in a Claude "Design System" artifact before code. After the first publish, this repo's token source is the source of truth and the artifact is regenerated from it.
- **Release pipeline** (Lerna + Intuit Auto, canary on PRs, Storybook deploy, visual regression) lands in week two, after 0.1.0.
- **npm.** The `@salemcobalt` scope is owned by npm user `sghoweri`. Publishing uses an automation token held in GitHub Actions secrets.
- **Runners.** This repo is public: hosted GitHub runners only, never self-hosted.
- **Storybook host.** `storybook.salemcobalt.com` has no DNS record yet; created when Storybook first deploys.
