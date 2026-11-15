# ADR 0008: Docs-site parity, branding and the system's name

Date: 2026-11-15
Status: accepted (Salem, 2026-11-15). Nothing is renamed by this ADR; the rename follows
[the Protokit rename plan](../protokit-rename-plan.md).

## Decisions (Salem, 2026-11-15)

Salem answered the calls at the end of this ADR. Where an answer differs from the recommendation, it says so.

1. **Name: rename to Protokit.** Scope `@protokit` (`@protokit/ui`, `@protokit/tokens`), prefix `proto`
   (first decided as `pk`; ADR 0009, decision 9). This goes
   against the recommendation in section 5 (keep `@salemcobalt`). The rename lands before any portfolio or resume
   link to the site goes out, and before the docs-site work in section 3 (ADR 0009, decision 6).
2. **Homepage copy: C, name-led.** "Protokit. Production parts for side projects." followed by copy A's subcopy.
   The recommendation was A; C keeps A's subcopy, so the proof and the voice are unchanged.
3. **Display type: A.** IBM Plex Sans, tuned, with Unbounded for the wordmark and the proof strip's numerals.
4. **Component pages: generate all 47**, after the half-day spike (section 3, step 3).
5. **Decisions section and `llms.txt`: accepted** (section 3, steps 4 and 7).
6. **First stable release is `@protokit`.** No stable `@salemcobalt` 0.2.0 is cut. Section 3's step 2 is replaced:
   the rename lands on the open 0.2.0 rc line, the first stable is `@protokit/*` 0.2.0, and then `@salemcobalt/ui` and
   `@salemcobalt/tokens` are deprecated with `npm deprecate`, pointing at the new packages. The rename plan sequences
   it.

Consequences for the rest of this ADR:

- Package names written below (`@salemcobalt/tokens/json`, `@salemcobalt/ui`) become `@protokit/*` when the rename
  lands. The text is left as written, as the record of what was proposed.
- Section 3's order becomes: the rename (ADR 0009 and the rename plan), then the first stable, then steps 1 and 3–8.
- The display token keeps its documented rule (wordmark and big numerals only), because type option A was chosen.

## Context

<https://designsystem.salemcobalt.com> has two halves since ADR 0007: the Astro + Starlight storefront at `/` and
the Storybook workshop at `/workshop/`. The workshop is nearly complete. The storefront is a stock Starlight splash
page, one component page and one foundations page. The site's job now is portfolio and resume value: a hiring
manager should leave it knowing what Salem builds, how Salem decides, and that the system ships in a real product.

This proposal measures the gap, compares the site with two reference systems and current docs thinking, proposes a
voice and type treatment for the homepage, and weighs renaming the system. ADR 0009 (CSS namespace) depends on the
name, so the name is decided here first.

All counts are from `main` at `f2efcdf` (2026-11-15), with a fresh tokens build, and Job Sweep `origin/main` at
`f7b5bc56`. Job Sweep imports 45 of the 47 components from the package's main entry.

## 1. The gap, measured

|                              | Workshop (Storybook)                                 | Storefront (Starlight)                                                                         |
| ---------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Components covered           | 47 of 47 with stories (`Field` is internal)          | **1 of 47** (Button)                                                                           |
| Examples                     | 290 stories                                          | 9 static Buttons, 1 Tabs island (Astro guide)                                                  |
| Long-form docs pages         | 4 MDX pages (Avatar, Meter, StatusStrip, TextEditor) | 1 component page                                                                               |
| Props reference              | Controls on every story (Storybook's default docgen) | none                                                                                           |
| Foundations                  | none                                                 | Colour only (rendered from token JSON)                                                         |
| Tokens with a reference page | n/a                                                  | colour only, of 221 custom properties; not spacing, type, radius, size, elevation, motion or z |
| Search                       | story search                                         | Pagefind, storefront only                                                                      |
| Decisions (7 ADRs)           | none                                                 | none: they live only in the repo                                                               |
| Proof it ships               | none                                                 | none: Job Sweep is never mentioned                                                             |

Component by component (workshop group, story count, whether the workshop has an MDX page, whether the storefront has
a page):

| Component         | Group      | Stories | Workshop MDX | Storefront page                |
| ----------------- | ---------- | ------: | ------------ | ------------------------------ |
| Avatar            | Components |       8 | yes          | no                             |
| Badge             | Components |       6 | no           | no                             |
| Banner            | Components |      10 | no           | no                             |
| BroomIcon         | Components |       3 | no           | no                             |
| Button            | Components |       7 | no           | **yes**                        |
| Callout           | Components |       3 | no           | no                             |
| Card              | Components |       6 | no           | no                             |
| Checkbox          | Forms      |       3 | no           | no                             |
| Chip              | Components |       8 | no           | no                             |
| Dialog            | Components |      15 | no           | no                             |
| Disclosure        | Components |       7 | no           | no                             |
| EmptyState        | Components |       5 | no           | no                             |
| FileInput         | Forms      |      17 | no           | no                             |
| FilePreviewDialog | Components |       6 | no           | no                             |
| FullScreenFlow    | Components |       4 | no           | no                             |
| Heading           | Typography |       6 | no           | no                             |
| Icon              | Components |       5 | no           | no                             |
| IconButton        | Components |       8 | no           | no                             |
| Inline            | Layout     |       3 | no           | no                             |
| Input             | Forms      |       9 | no           | no                             |
| Kbd               | Components |       2 | no           | no                             |
| Menu              | Components |       8 | no           | no                             |
| Meter             | Components |       7 | yes          | no                             |
| Popover           | Components |       7 | no           | no                             |
| PriorityNav       | Components |      11 | no           | no                             |
| Progress          | Components |       8 | no           | no                             |
| Quote             | Components |       2 | no           | no                             |
| ReasonList        | Components |       7 | no           | no                             |
| Score             | Components |       7 | no           | no                             |
| Select            | Forms      |       8 | no           | no                             |
| SelectionBar      | Components |       2 | no           | no                             |
| Skeleton          | Components |       5 | no           | no                             |
| Spinner           | Components |       4 | no           | no                             |
| Stack             | Layout     |       2 | no           | no                             |
| Stat              | Components |       5 | no           | no                             |
| StatusStrip       | Components |       5 | yes          | no                             |
| Stepper           | Components |       6 | no           | no                             |
| Switch            | Forms      |       4 | no           | no                             |
| Table             | Components |       8 | no           | no                             |
| Tabs              | Components |       6 | no           | no (island in the Astro guide) |
| Text              | Typography |       6 | no           | no                             |
| TextEditor        | Forms      |       6 | yes          | no                             |
| Textarea          | Forms      |       5 | no           | no                             |
| Toast             | Components |       3 | no           | no                             |
| Toolbar           | Components |       6 | no           | no                             |
| Tooltip           | Components |       7 | no           | no                             |
| WordDiff          | Components |       4 | no           | no                             |

Two gaps outside the site matter as much as the pages:

- **npm shows the v0 system.** `@salemcobalt/ui@latest` is 0.1.1, whose description lists seven components; the 47
  live on `next` (0.2.0-rc.51). Anyone who follows the npm badge sees a fraction of the work. Cutting 0.2.0 stable
  (merge `main` into `release`, docs/releasing.md) fixes it with no code.
- **The homepage says what, not why.** The H1 is the name; the tagline is a stack list. Nothing says it runs Job
  Sweep, that it was built app-first, or that every decision is written down.

## 2. What the references do

**Bolt** (<https://boltdesignsystem.netlify.app/>, which Salem led). Strongest model for the storefront:

- A fixed component-page template: Overview, Description, Dos, Don'ts, Usage, Schema, then ~20 headed variation
  sections, each live, shown inside every theme
  ([Button](https://boltdesignsystem.netlify.app/pattern-lab/?p=viewall-components-button)).
- A header card per component: status badge, version, changes link, install line, source link, dependencies.
- A props table generated from each component's JSON schema (name, description, type, default, options, required).
- Prose guidance kept apart from the generated reference: `/docs/ui-patterns/buttons` links to the Pattern Lab page
  for "schema and API".
- A version dropdown, a latest-release banner and per-version deploys.
- Dated now: Open Sans at 14px, a Pattern Lab iframe-in-iframe workshop, and an "explorer is being upgraded" stub.

**Pypestream** (<https://designsystem.pypestream.com/>). The root is a stock Storybook: no homepage, foundations, release
notes or prose. It is the stronger model for the **workshop**:

- Every component has an `autodocs` page with a props table generated from component metadata.
- One story per variant, each with "Show code".
- A composition ladder above components: Patterns, Recipes, Smart components, Templates.
- `index.json` and the chrome-free `iframe.html?id=…&viewMode=docs` view make the docs embeddable and queryable.
- Weak: the generated props table is unfiltered (inherited input props on a button), and there is no usage guidance.

**Nathan Curtis** (2026, now publishing as Directed Edges; read from feed summaries, as Medium blocked full text):

- [Component Examples as Data](https://medium.com/@nathanacurtis/component-examples-as-data-11f56b1b9130) (May 2026):
  examples are structured data that feed doc pages, stories and AI prompts alike.
- [Component Contracts and Schemas](https://medium.com/@nathanacurtis/component-contracts-and-schemas-f7c7a6651273)
  and [Spec-Driven UI Component Development](https://medium.com/@nathanacurtis/spec-driven-ui-component-development-6e3f43f52450)
  (Jul–Aug 2026): the spec (anatomy, props, slots) is a schema that can be generated; how-to-use guidance is separate
  and written by people.
- [What Component Specs Leave Behind](https://medium.com/@nathanacurtis/what-component-specs-leave-behind-4f1ab881b7a9)
  (Aug 2026): round-trip checks that generated specs still match what renders.

**Brad Frost**:

- [AI and Design Systems](https://bradfrost.com/blog/post/ai-and-design-systems/) (Feb 2024): docs drift from code and
  lose trust; draft them from the code and keep a human in the loop.
- [Storybook MCP with Dominic Nguyen](https://bradfrost.com/blog/post/storybook-mcp-with-dominic-nguyen/) (Apr 2026):
  the Storybook is now an agent-facing surface. Stories, typed props and tests are what an agent reads, so they
  deserve the same care as human docs.

Taken together: **generate the reference, hand-write the judgement, and make both readable by people and agents.**
That is guideline 13's storefront-plus-workshop model with Curtis's "examples as data" applied to stories that
already exist.

## 3. Action plan

Ordered by portfolio value per hour, with the 2026-12-31 deadline in mind. Each step is one PR.

1. **Homepage rewrite** (half a day). New copy and type (section 4), plus a proof strip with live counts
   (components, stories, tokens, tests, ADRs, latest version). The counts are generated at build time from the
   packages, never typed in, and the page is built from the system's own components (guideline 13 rule 12: Bolt's
   homepage proved its components could build a marketing page). Add a "Built with it" band pointing at Job Sweep.
2. **Cut 0.2.0 stable** (Salem, minutes) so npm's `latest` matches the site. Update both packages' `description`.
3. **Generated component pages** (half-day spike, then 2–3 days). One Starlight route renders all 47 from data.
   Spike Button, Dialog and Table first: portable stories (`composeStories`) were built for test runners, Astro cannot
   pass story functions across an island boundary, and portal and play-function stories need hydration. If the spike
   fails, embed the workshop's chrome-free `iframe.html?id=…` view instead (Pypestream's pattern), which is the same
   deploy.
   - **Header card** (from Bolt): status, "since" version, import line, source link, workshop link.
   - **Examples**: the existing CSF stories rendered as Astro islands, so every example is written once (Curtis's
     examples as data). Only stories tagged `docs`, three to six per component, appear: the 290 stories are
     fixtures, and rendering all of them recreates Bolt's wall of variations. Static stories render with no client
     JS. Hydration (`client:visible`) is only for stories that need behaviour, as ADR 0007 does for Tabs.
   - **Props table**: switch Storybook to `react-docgen-typescript` (a config change: no docgen is configured, so
     Storybook uses `react-docgen`) and share its output with the page (closes the backlog row "Docs: prop
     tables"). Filter inherited DOM props, which is Pypestream's mistake.
   - **Usage, Do / Don't, Accessibility**: optional hand-written MDX partial per component. Pages without one still
     ship complete reference. The four existing workshop MDX pages are the first partials.

   This moves parity from 1 of 47 to 47 of 47 for the cost of one template, and prose then grows one component at a
   time.

4. **Decisions on the site** (half a day). Render `docs/adr/*.md` as a "Decisions" section through an Astro content
   loader. For architect roles, the reasoning is the portfolio: seven ADRs with context, options and consequences are
   rarer than components.
5. **Foundations from tokens** (1 day): spacing, type, radius, size, elevation, motion and z pages, built like
   Colour from `@salemcobalt/tokens/json`.
6. **Workshop polish** (half a day): `tags: ['autodocs']` in the Storybook preview so every component gets a workshop
   docs page, a branded manager theme from the tokens linking back to the storefront (backlog "shared header"), and
   Pagefind over the workshop's docs pages too (guideline 13 rule 14).
7. **Machine-readable surface** (half a day, optional): a generated `llms.txt` (component list, import lines, props
   summaries) and a note on Storybook's MCP. This is a cheap, current talking point. Storybook's MCP support came up
   in research only through search results, so verify it against Storybook's docs before relying on it.
8. **A Job Sweep case study page**: screenshots of the inbox, stepper and file flows with links to the matching
   components, and the "app first, extract second" rule told as a story.

Out of scope until after the deadline: a version switcher (one version line), a `docs-data` bus (one data source;
ADR 0007), and Pypestream's pattern/template ladder.

## 4. Personality and branding

### Today

- **Hero**: "Salem Cobalt design system" in IBM Plex Sans 600 at 55px with 1.2 leading, then a 20px tagline at 1.75
  leading, which reads loose and grey.
- **Layout**: Starlight's default splash with no visual and four equal cards.
- **Voice**: the copy is a specification ("Tokens and accessible React components on Base UI, light and dark,
  comfortable and compact"). It is accurate, but it has no point of view and no proof.

### Voice

Plain, specific, a little dry. Every claim is checkable on the site. Short declaratives. No "beautiful", "delightful"
or "scalable"; numbers instead. The voice already exists in the ADRs and commit messages. The homepage should sound
like them.

### Copy options

**A. "A design system with a day job."** (recommended)

> **A design system with a day job.**
> 47 React components and 221 tokens, nearly all of them running Job Sweep today. Built app-first: a component starts in the
> product and graduates here when a second screen needs it. Every decision is written down.
>
> [Browse components] [Read the decisions] [Open the workshop]

**B. "Small system. Real product. Every decision on the record."**

> **Small system. Real product.**
> Accessible React on Base UI, themed light and dark, documented from the code, and shipped in Job Sweep. Seven
> architecture decisions, each with the options that lost.

**C. Name-led, if renamed** (section 5):

> **Protokit. Production parts for side projects.** _or_ **Bit. The smallest useful design system.**
> Then subcopy A.

Under the hero, the **proof strip**, generated at build: `47 components · 290 stories · 221 tokens · 7 decisions ·
v0.2.0`, plus "token contrast tested AA in both themes" only as a link to `packages/tokens/test/contrast.test.ts`,
so the claim stays checkable. Then a short "Built with it" band showing a Job Sweep screenshot, linked to the case
study page.

### Type options

The system already has a brand display face: `--sc-font-family-display` is Unbounded, scoped by its token comment to
"a wordmark and big numerals only" (Score uses it). The options differ in how far the homepage leans on it. All are
self-hosted through Fontsource, and display sizes use `clamp()` with a rem term (guideline 03).

|                   | A. Plex, tuned, Unbounded where the token allows (recommended)                                 | B. Unbounded headline                                                                              | C. Editorial serif                                                        |
| ----------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Headline          | IBM Plex Sans Variable 700, `clamp(2.75rem, 2rem + 4vw, 5rem)`, leading 1.0, tracking −0.025em | Unbounded 600, `clamp(2.25rem, 1.5rem + 3.5vw, 4.25rem)`, leading 1.05                             | A variable serif (Fraunces or Newsreader) 500, Plex's clamp, leading 1.05 |
| Wordmark, numbers | Unbounded: the site-title wordmark and the proof strip's numerals                              | Unbounded                                                                                          | Unbounded                                                                 |
| Eyebrows, labels  | Plex Mono 500, 0.8125rem, uppercase, +0.08em                                                   | Plex Mono                                                                                          | Plex Mono                                                                 |
| Body and tagline  | Plex Sans; tagline 1.25rem, leading 1.45, `text-wrap: balance`, max 38ch                       | same                                                                                               | same                                                                      |
| Says              | "The system's own type, each face in its documented role"                                      | Loudest personality; the brand face carries the page                                               | Taste and editorial range beyond engineering                              |
| Costs             | Quietest headline of the three                                                                 | Widens the token's documented rule from wordmark to headline; wide letterforms wrap early at 390px | A third family to load and justify; diverges from the product             |

Recommendation: **A**. The storefront should look like the system it documents and use each face the way its token
says. Plex at 700 with tight tracking and 1.0 leading is a different voice from Plex at 600 with Starlight's defaults,
and Unbounded numerals make the proof strip the visual signature. Choose B only if Salem is happy to widen the
display token's rule.

A small brand mark helps everywhere (favicon, Storybook manager, npm README, social card). Use a wordmark in
Unbounded next to a brand-500 (`#8250fe`) square or keycap, which echoes `Kbd` and the keyboard-driven inbox. Also add
a 1200×630 Open Graph card built from the same tokens, because links to the site get shared in applications.

## 5. The name

| Option                                                 | For                                                                                                                       | Against                                                                                                                                                                                                                                                                   | Migration                                                                         |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Keep `@salemcobalt`** ("Salem Cobalt design system") | Searching Salem's name finds it; the resume line and the site share a name; npm history, domain and repo stay; zero churn | Eponymous, so it reads like a personal theme more than a product; the `sc-` prefix overlaps styled-components' generated class names (`sc-<hash>`) and Stencil's scoped-CSS classes, which is harmless to the cascade but noisy in devtools                               | None                                                                              |
| **`@bitdesignsystem`** ("Bit")                         | Short, friendly; `bds` mirrors Bolt's own initials (Bolt Design System)                                                   | **Collides with Bit (bit.dev)**, a component platform marketed to design-system teams: "Bit design system" searches land there, and an interviewer may assume Bit is the tool used; the scope is long (`@bitdesignsystem/ui`); `bds` is generic and taken unscoped on npm | New packages, repo, docs domain or path, both prefixes (ADR 0009), Job Sweep deps |
| **`@protokit`** ("Protokit")                           | Short scope (`@protokit/ui`), `pk-` prefix, memorable as a product name                                                   | "Proto" connotes prototypes, which undersells a system that runs a product; namespace neighbours: unscoped `protokit` (a 2017 placeholder), `@proto-kit/*` (a zk app-chain SDK), and `@websideproject/nuxt-protokit` (schema-driven prototyping, Oct 2026)                | Same as Bit                                                                       |

Salem owns both orgs. No packages exist under them yet: `@protokit/ui`, `@protokit/tokens`, `@bitdesignsystem/ui` and
`@bitdesignsystem/tokens` all 404 on npm today. A rename costs two to three days in all. About a day of that is the
code: ADR 0009 counts about 4,000 occurrences in this repo and 2,300 in Job Sweep's app code, all rewritten by
codemod. The rest is the release plumbing: a Trusted Publisher per new package, the repo name, a domain decision,
READMEs and badges, and an `npm deprecate` on the old packages.

**Recommendation: keep `@salemcobalt` through the job search.** A resume or portfolio
reader searches Salem's name, and the system wins that search today. Both alternatives carry naming collisions that
an interviewer could raise. The personality gap is in the copy and type, not the name, and section 4 closes it in
half a day. A rename spends two to three days that would otherwise build 47 component pages. If Salem wants a product
name anyway, Protokit is the less bad of the two, and ADR 0009's codemod makes it a mechanical change later.

**Decided otherwise (Salem, 2026-11-15): rename to Protokit.** The objections above (the "prototype" reading and the
npm neighbours) were weighed and accepted. The rename's cost is planned in
[the Protokit rename plan](../protokit-rename-plan.md).

## Second opinion (Fable 5.2)

`claude-fable-5-2` reviewed this draft against both repos. It confirmed the counts, the npm state and the guideline
citations. Its factual corrections are already applied above:

- The token count is 221 from a fresh build, not the stale 179.
- The Job Sweep SHA was updated.
- The homepage rule is guideline 13 rule 12, not rule 3.
- The docgen is a config change, not reuse.

The disagreements it raised that this ADR took up:

- **Step 3 estimate.** A spike, with an iframe fallback, comes first.
- **Curated examples.** Pages show three to six stories tagged `docs`, not all 290.
- **Pagefind over the workshop.** Added to step 6.
- **The proof strip's WCAG claim.** It is now scoped to token contrast and links to the test.

These disagreements are left for Salem:

> **Fable, on order:** for a hiring manager, the Job Sweep case study (step 8) and Decisions (step 4) beat 47
> generated pages. Run 1, 2, 8, 4, then 3 with a handful of hand-finished flagship pages.
>
> _Response:_ fair. Generated pages are what make the site read as a complete system rather than a demo, and they
> cost about the same as five flagship pages. Steps 4 and 8 are a day together. If Salem has less than a week for
> the site, take Fable's order.

> **Fable, missing option: a product name without a scope rename.** The site's brand and the npm scope are
> separable. A named site on `@salemcobalt/*` gets personality with zero migration.
>
> _Response:_ agreed that it is cheap. It does split the name a reader sees from the one they install, and ADR 0009's
> prefix would follow the scope, not the site name. Added as call 1's third answer.

> **Fable, on "revisit Protokit in 2027":** the "proto = prototype" objection is close to disqualifying, so
> deferring it is weak.
>
> _Response:_ partly agreed. The recommendation is to keep `@salemcobalt`. Protokit stays only as the less bad
> rename if Salem wants one.

## Calls for Salem

Answered 2026-11-15. The answers are recorded under Decisions at the top.

1. **Name**: keep `@salemcobalt`; keep the scope but give the site a product name (Fable's option); rename to
   Protokit; or rename to Bit? _Recommend: keep `@salemcobalt`, name and scope, through 2026-12-31._
   **Salem: rename to Protokit (`@protokit`, prefix `pk`, then `proto`).**
2. **Homepage copy**: A ("A design system with a day job"), B or C? _Recommend: A._ **Salem: C, name-led, with A's
   subcopy.**
3. **Display type**: A (Plex, tuned, Unbounded for wordmark and numerals), B (Unbounded headline) or C (editorial
   serif)? _Recommend: A._ **Salem: A.**
4. **Component pages**: generate all 47 from curated stories and docgen (plan step 3), or hand-finish a few flagship
   pages after the case study and Decisions (Fable's order)? _Recommend: generate, after a half-day spike; take Fable's
   order if the site gets less than a week._ **Salem: generate all 47, after the spike.**
5. **ADRs on the site** as a "Decisions" section? _Recommend: yes._ **Salem: yes.**
6. **Cut 0.2.0 stable** now, so npm `latest` shows the current system? _Recommend: yes, before any portfolio link
   goes out._ **Salem: no stable `@salemcobalt`; the first stable is `@protokit` 0.2.0, then deprecate the old
   packages.**
7. **`llms.txt` / MCP note** (plan step 7)? _Recommend: yes, after steps 1–5, verifying Storybook's MCP first._
   **Salem: yes.**
