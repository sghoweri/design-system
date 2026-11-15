# ADR 0009: CSS namespace: bare BEMIT or brand plus BEMIT

Date: 2026-11-15
Status: accepted (Salem, 2026-11-15). Nothing is renamed by this ADR; the
migration follows [the Protokit rename plan](../protokit-rename-plan.md).

## Decisions (Salem, 2026-11-15)

ADR 0008 decided the name: Protokit. The prefix is `proto` (decision 9, which supersedes `pk`). Against that name, Salem answered this ADR's calls as follows.
Where an answer differs from the recommendation, it says so.

1. **Brand + BEMIT** (option 2).
2. **Order: BEMIT first, then brand**: `.c-proto-button`, following Bolt's `c-bolt-button`. This goes against the
   recommendation (brand first, `.proto-c-button`). What it changes:
   - Class names start with their ITCSS role (`c-`, `o-`, `u-`, `t-`), so source and devtools group them by role.
   - Custom properties, the layer and any future tag still start with the brand (`--proto-*`, `@layer proto`,
     `<proto-button>`), so classes no longer share one leading prefix with everything else. A devtools or grep filter
     uses the substring `proto-`, which matches both.
   - One Stylelint pattern still covers every class: `^(c|o|u|t)-proto-[a-z0-9-]+(__[a-z0-9-]+)?$`.
3. **Layout namespace: `o-` (objects)**, as ITCSS and the brief write it: `.o-proto-stack`, `.o-proto-inline`. This goes
   against the recommendation and **deviates from guideline 01 decision B13** (`l-` in `@layer layout`, 2026-11-03).
   The deviation is this system's. Whether guideline 01 follows it is a separate change in the guidelines repo.
4. **Every `--sc-*` becomes `--proto-*`, and `@layer sc` becomes `@layer proto`, with no aliases.** That covers tokens,
   component knobs and anchor names. No `legacy.css` ships. It is one breaking release, and the codemod migrates Job
   Sweep in the same window. While the 0.2.0 rc line is open, the release label is ignored (docs/releasing.md). So the
   rename lands as the next `0.2.0-rc.N`, `@protokit/*` starts there, and its first stable is 0.2.0 (ADR 0008,
   decision 6).
5. **Stylelint in both repos: accepted.** That means the class pattern, the custom-property pattern (`^proto-`, private
   `--_*` allowed) and the `var()` usage check.
6. **When: soon, before portfolio links.** The rename and the class migration land before any portfolio or resume
   link to the site goes out, ahead of ADR 0008's docs-site work. This goes against the recommendation (after the
   site work, likely after 2026-12-31).

7. **Job Sweep's design mockups are migrated** (call 6; Salem, 2026-11-15: "Yes they should get migrated"). This
   goes against the recommendation (leave them as frozen snapshots). It covers everything under `docs/design/`:
   about 14,000 `sc-` occurrences in 29 files, 7,362 of them custom-property references.
   - The 9 HTML pages, their inline `<style>` blocks, `class` and `style` attributes.
   - The 6 concept and proposal stylesheets.
   - The 3 build scripts and 3 concept scripts.
   - The 1 captured-markup JSON.
   - 16 mentions in 7 Markdown design docs.

   It runs as its own Job Sweep PR right after the app migration, checked page by page with before-and-after
   screenshots, because the pages are static HTML with no tests. The `var()` usage check and Stylelint deliberately
   exclude `docs/design/`; a leftover-`sc-` check covers it instead. The rename plan has the detail.

8. **No hybrid: classes and custom properties are both branded** (call 8; Salem, 2026-11-15: "Let's run with branded
   for now"). Classes are `.c-proto-button`, custom properties `--proto-*`, the layer `@layer proto`. This matches the
   recommendation.
   - "For now" leaves room to revisit after the rename. Moving to bare classes (`.c-button`) later would be a second
     class-only breaking change: about 2,100 class references in this repo and 150 in Job Sweep, about half a day
     with the same codemod and a new map. The custom properties and the layer would not change.
   - Inside shadow roots, if the system ever moves to web components, bare classes remain the guideline's default
     (section 2).

9. **Prefix: `proto`, superseding `pk`** (Salem, 2026-11-15: "Instead of c-pk-button, can we go with
   c-proto-button?"). One prefix still covers everything, so the custom properties follow the classes:
   - classes: `.c-proto-button`, `.o-proto-stack`, `.u-proto-visually-hidden`, `.t-proto-on-accent`;
   - custom properties: `--proto-*`;
   - the layer: `@layer proto`;
   - the token build's `PREFIX`: `'proto'`;
   - any future tag: `<proto-button>`.

   The migration cost is unchanged, because every name is rewritten anyway. Names grow by three characters
   (`--proto-color-text-default`).

   **Collision check** (2026-11-15): Tailwind v4, Bootstrap (`--bs-*`), Open Props and Starlight (`--sl-*`) declare
   no `proto-` names. GitHub code search finds `--proto-` in about 390 CSS files and `.proto-` in about 4,000, all
   one-off projects (prototype pages, protobuf and gRPC viewers), none in a shared library. For comparison, `--pk-`
   appears in about 3,000.

   Every example in this ADR now shows `proto`. Where the proposal compared prefixes, the text keeps `pk` as it was
   proposed.

Every call is now answered.

## Context

Every class and custom property today carries a brand-only prefix: `.sc-button`, `.sc-dialog__close`,
`--sc-color-text-default`. The component sheet ships inside `@layer sc`. Modifiers and states are `data-*` attributes
(`[data-variant]`, `[data-size]`, Base UI's `[data-open]`), not `--modifier` classes. That stays in both options, so
only block and element names are in play.

Brand-only (`.bds-button`) was rejected before this ADR and is not reconsidered here. That leaves two options, each
weighed against ADR 0008's three name outcomes (keep `@salemcobalt` → `sc`, Protokit → `pk`, Bit → `bds`; Protokit's prefix later became `proto`, decision 9). The table
shows the decided form of option 2 (Protokit, BEMIT first, `o-` for layout). The proposal compared the other
prefixes and the brand-first order, which the sections below still discuss:

| Thing                      | Today                                              | Option 1: bare BEMIT       | Option 2, as decided: BEMIT + brand |
| -------------------------- | -------------------------------------------------- | -------------------------- | ----------------------------------- |
| Component                  | `.sc-button`                                       | `.c-button`                | `.c-proto-button`                   |
| Element                    | `.sc-dialog__close`                                | `.c-dialog__close`         | `.c-proto-dialog__close`            |
| Layout primitive (object)  | `.sc-stack`                                        | `.o-stack`                 | `.o-proto-stack`                    |
| Utility                    | `.sc-visually-hidden`                              | `.u-visually-hidden`       | `.u-proto-visually-hidden`          |
| Theme scope                | `.sc-on-accent`                                    | `.t-on-accent`             | `.t-proto-on-accent`                |
| Token                      | `--sc-color-text-default`                          | `--color-text-default`     | `--proto-color-text-default`        |
| Component knob             | `--sc-toast-offset-block-end`, `--sc-broom-stroke` | `--toast-offset-block-end` | `--proto-toast-offset-block-end`    |
| Anchor name (dashed ident) | `--sc-bottom-bar` (consumer API, in the README)    | `--bottom-bar`             | `--proto-bottom-bar`                |
| Private value              | `--_bg`                                            | `--_bg`                    | `--_bg`                             |
| Cascade layer              | `@layer sc`                                        | (see below)                | `@layer proto`                      |

**Layout prefix.** The brief's example `.o-wrapper` uses ITCSS's `o-`. Salem's guideline 01 settled on `l-` in
`@layer layout` (decision B13, 2026-11-03), so the proposal wrote `l-`. Salem chose `o-` (decision 3), and the
examples now show it.

The current 59 blocks sort into namespaces the same way under either option:

- `o-` (2): `stack`, `inline`.
- `u-` (2): `visually-hidden`, `focus-ring`.
- `t-` (1): `on-accent`.
- `c-` (54): everything else, including the wrapper blocks `table-wrap`, `input-wrap`, `kbd-group`,
  `skeleton-lines`, `toast-viewport` and `chip-editor`.

## 1. Custom-property collision risk for consumers

Custom properties have no scoping. A name declared anywhere up the tree is the value every reader below sees.
A collision is therefore silent: no error, just a different colour.

**Option 1 collides with Tailwind v4 by name, today.** Tailwind v4's default theme is a set of custom properties.
65 of this system's tokens would have exactly the same bare names:

- **Colour ramps**: `--color-{red,amber,green,teal,neutral}-{50…950}` (55 names).
- **Black and white**: `--color-white` and `--color-black`.
- **Radii**: `--radius-{xs,sm,md,lg,xl,2xl}`.
- **Weights**: `--font-weight-medium` and `--font-weight-semibold`.

The two definitions would fight like this:

- `tokens.css` is unlayered on `:root`, and Tailwind declares its theme in `@layer theme`. Unlayered beats layered, so
  in any consumer that also uses Tailwind, `bg-red-500` and `rounded-md` silently take this system's values.
- If this system's tokens were ever layered, the reverse happens, and its components paint in Tailwind's palette.

Neither Job Sweep nor the docs site uses Tailwind, so this is a risk for outside adopters, not for today's
consumers. For an outside React app, though, Tailwind is the most likely co-tenant.

**Bare names also collide with the consumer's own vocabulary.** Job Sweep's marketing page already declares bare
`--surface`, `--text`, `--shadow`, `--tone` and `--primary` (`apps/web/src/components/marketing/home.module.css`).
None is an exact match for a token today, but apps write bare names by default.

**Collision is not only on `:root`.** Any ancestor that declares `--color-text-default` re-themes every component
inside it. Third-party widgets, a CMS theme or a Starlight plugin could all do that by accident. With a brand prefix,
re-theming is something a consumer opts into.

**Option 2 is collision-free in practice.** `--proto-*` and `--bds-*` are clear of every common framework vocabulary
(Tailwind, Open Props, Starlight's `--sl-*`, Bootstrap's `--bs-*`). `--sc-*` is as well, though `sc-` as a _class_
prefix shares a namespace with styled-components' generated `sc-<hash>` classes and Stencil's scoped-CSS classes.
That is noisy in devtools, but no exact match is plausible.

**Cascade layer names collide too.** Option 1 has no brand to name the layer after. A neutral name like
`@layer components` would merge with a consumer's own `components` layer, because same-name layers merge, which
makes the order unpredictable. Option 2 keeps one brand layer with sublayers (`@layer proto.components, proto.utilities`).
That fits Job Sweep's `@layer base, sc;` contract with a one-word change.

## 2. Shadow DOM and web components

The system is React in light DOM today: every class is global, and Base UI portals put popovers, menus and dialogs at
the top of `<body>`, outside any app wrapper. Salem's Gold Standard targets Lit web components (guidelines 04 and 05),
so the choice should survive that move.

| Concern                             | Option 1                                                                                                                                                                                                                  | Option 2                                                                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Classes now (light DOM)             | Global and unbranded; `.c-card` meets any consumer or third-party `.c-card`. Job Sweep's own ~430 block classes are bare BEM (`.banner`, `.alert`), so they would not clash today, but nothing stops an app adopting `c-` | Branded and global; safe beside any CSS                                                                                       |
| Classes later (inside shadow roots) | Ideal: encapsulated, so short is right (guideline 01 rule 5: "Classes inside shadow roots don't need it")                                                                                                                 | The brand becomes noise inside shadow roots; a WC rewrite can drop it there and keep it only in light-DOM and pre-upgrade CSS |
| Custom properties now and later     | A hazard in both worlds: custom properties are the one thing that crosses the shadow boundary (guideline 01 rule 9; Gold Standard index belief 6)                                                                         | Correct in both worlds; the public theming API of a future `<proto-button>` is exactly `--proto-*`                            |
| Tag names (future)                  | Need a prefix anyway (`<?-button>`); the brand appears in tags but not in tokens, which is inconsistent                                                                                                                   | `<proto-button>`, `--proto-button-bg`, `.c-proto-button` (pre-upgrade): one brand everywhere                                  |
| `::part()` names                    | Unaffected                                                                                                                                                                                                                | Unaffected                                                                                                                    |

The two halves of the choice point different ways once there are shadow roots. Classes want to be bare inside shadow
DOM, and custom properties want to be branded everywhere. Of the two options as briefed, only option 2 gets the
custom properties right, and it is the custom properties that a web-component future makes public API.

## 3. Migration cost

Counted with `git grep` on tracked files, excluding lockfiles, changelogs and `dist`:

| Where                                     | `--sc-*` refs                              | `.sc-*` selectors (CSS)                  | `sc-*` class strings (TS/TSX/MDX/Astro)          | Files |
| ----------------------------------------- | ------------------------------------------ | ---------------------------------------- | ------------------------------------------------ | ----: |
| design-system (`f2efcdf`)                 | 1,798 (158 names in source; 221 generated) | 1,328 (271 classes, 59 blocks, 42 files) | 783 (components, stories, tests)                 |   183 |
| Job Sweep app code (`apps/`, `f7b5bc56`)  | 2,159                                      | 23 (overrides of DS classes)             | 125 (mostly DOM tests querying `.sc-score` etc.) |    59 |
| Job Sweep design mockups (`docs/design/`) | 7,362                                      | 1,082 (inline `<style>` blocks)          | 72                                               |    29 |

Plus a handful of one-liners in each repo:

- The token build's `PREFIX = 'sc'` and the `prefix` export in `@salemcobalt/tokens`'s JS API, which is public API.
- `@layer sc` in the CSS build, the READMEs and the docs site.
- The docs site's Starlight mapping and swatches (51 lines in `apps/docs`).
- Job Sweep's `layers.css` and its test.

**Leave the mockups alone** (proposed; Salem decided to migrate them, decision 7). Each mockup embeds its own copy of the token CSS, so it renders correctly forever as a
snapshot. Rewriting 14,000 lines of archived design artifacts buys nothing.

What changes, per option and name:

| Option × name                       | Custom properties                               | Classes                                     | Layer                        | Rough effort with a codemod                           |
| ----------------------------------- | ----------------------------------------------- | ------------------------------------------- | ---------------------------- | ----------------------------------------------------- |
| **2 × keep `sc`**                   | **none** (`--sc-*` is already brand + category) | `.sc-x` → `.sc-c-x` / `-l-` / `-u-` / `-t-` | unchanged                    | ~half a day; Job Sweep: 148 class refs, 0 var refs    |
| **2 × Protokit (`proto`), decided** | all 1,798 + 2,159 rewritten                     | all, as above, with the new prefix          | renamed                      | ~1 day, mostly review                                 |
| 1 × any name                        | all 1,798 + 2,159 rewritten (prefix dropped)    | all, as above, prefix dropped               | renamed to something neutral | ~1 day, plus the Tailwind exposure above, permanently |

Classifying blocks into `c-`, `o-` (proposed: `l-`), `u-` and `t-` is the same work in every row. The real cost driver is whether the
custom properties change, and only "option 2, keep `sc`" leaves them alone.

## 4. Codemod and deprecation

**One rename map, generated, not hand-written.** A script in `packages/ui/scripts/` reads the built `styles.css` and
the token JSON and writes `namespace-map.json`, an old → new map with an entry for every class and every `--sc-*`
dashed ident. That includes component knobs (`--sc-toast-offset-block-end`) and anchor names
(`anchor-name: --sc-bottom-bar`), which are not tokens and are not inside `var()`, so a map built from the token
JSON alone would miss them. The same build then compares the map against the new output, so a missing entry fails the build.

**One codemod, three passes, driven by the map.**

- **CSS**: `postcss-selector-parser` renames class selectors, and a declaration and value walk renames every mapped
  dashed ident: custom-property definitions, `var()` references, and `anchor-name` / `position-anchor` values.
- **TS/TSX/MDX/Astro**: replaces exact class tokens inside string literals and template literals. It matches only
  map keys, on class-token boundaries, so `sc-` inside other words is never touched.
- **Layer statements**: `@layer sc` → `@layer <p>`.

The codemod ships in the DS repo, so Job Sweep runs it with `node ../design-system/…/codemod.mjs apps/web` or
`pnpm dlx` against a published bin. A codemod with a generated map and a check is itself portfolio material.

**Prove it with lints that stay afterwards** (guideline 01 lint rules; guideline 02 rule 13):

- Stylelint `selector-class-pattern` built from the namespace table. As proposed (brand first, `l-`):
  `^<p>-(c|l|u|t)-[a-z0-9-]+(__[a-z0-9-]+)?$`. As decided: `^(c|o|u|t)-proto-[a-z0-9-]+(__[a-z0-9-]+)?$`.
- `custom-property-pattern` for `^<p>-` (private `--_*` allowed).
- A usage check: every `var(--<p>-*)` must exist in `tokens.json` or be a documented knob. Job Sweep shipped an
  undefined `--sc-color-text-on-solid` this autumn (its backlog F2), which is exactly what this check catches.

**Deprecation.** The packages are 0.x with one consumer that Salem owns, so this is **one breaking release**, with no
long dual-name period. (Proposed as a `minor` → `0.3.0-rc.*`. As decided, it lands on the open 0.2.0 rc line under
the new names, and `legacy.css` is not shipped: decision 4.)

- **Classes**: no compat layer. The codemod updates Job Sweep in the same afternoon, pinned to the rc.
- **Custom properties, only if they change** (rename or option 1): for one minor, ship an opt-in
  `@<scope>/tokens/legacy.css`, generated, with `--sc-x: var(--<p>-x)` aliases for code that _reads_ old names.
  - Overrides that _write_ old names are not covered: aliases resolve at `:root` (guideline 02 rule 5), so a
    consumer setting `--sc-color-accent-default` on a subtree would not reach components.
  - The codemod and the usage lint cover writers.
  - Remove `legacy.css` in the next minor.
- **If renamed**: publish the new scope from the same commit, then run `npm deprecate @salemcobalt/ui "Renamed to
@protokit/ui"` (and the same for tokens) once the new stable exists.

## 5. Fit with the Gold Standard

- **Guideline 01 rule 5, "Every class carries a BEMIT namespace"**: today's `.sc-button` breaks it. **Both options
  fix it.**
- **Guideline 01 rule 5, "Tag names and custom properties carry the brand prefix"**: **option 1 breaks it** (bare
  `--color-*`). Option 2 complies.
- **Guideline 01 decision "Brand prefix on classes"**: the default is "prefix tags and custom properties only".
  It adds: "Add a class prefix only for a DS that styles light DOM on pages you don't control." Both of today's
  consumers are Salem's, so that exception is weak on its own. The stronger case is the Gold Standard itself:
  - Every app Salem builds to it uses `c-`, `l-` and `u-` classes of its own.
  - In light DOM, an app's unlayered `.c-card` beats the system's `.c-card` inside `@layer sc`, silently.
  - Bare BEMIT classes therefore collide with Salem's own house style, not just with strangers' CSS.

  For a React light-DOM system, option 2 is the conformant reading. If the system becomes Lit, the guideline's default (bare classes inside shadow roots,
  branded tokens and tags) is a subtraction from option 2, not a second migration.

- **Note**: the guideline's literal default, bare classes with branded properties, is neither briefed option. It is
  recorded here because it is where a web-component rewrite would land, not proposed for the light-DOM system.
- **Guideline 01 decision B13, `l-` for layout**: the proposal used `l-`. **Salem chose `o-` (decision 3), a
  deliberate deviation from B13** recorded here: `.o-proto-stack` and `.o-proto-inline`.
- **Guideline 02 rules 4 and 13**: components read `var(--<p>-*)`, and usage is linted against declarations. Option 2
  keeps the token build's `prefix` setting, and option 1 removes it.
- **Bolt precedent** (guideline 01 rule 5 origin): `c-bolt-button`, which is BEMIT first, then brand. Option 2 as
  briefed is brand first (`proto-c-button`). Brand first wins here because one prefix starts every class, custom
  property, layer and future tag. That makes one lint pattern and one devtools filter (`proto-`), and the namespace
  letter still reads immediately after it. **Salem chose BEMIT first, following Bolt (decision 2): `.c-proto-button`.**
  The lint pattern stays single (`^(c|o|u|t)-proto-…`), and the substring filter `proto-` still finds classes, custom
  properties and the layer.

## Recommendation (as proposed)

Salem accepted option 2 and decided the prefix, order, layout namespace and timing differently: see Decisions at the
top. The recommendation is kept as written.

**Option 2, brand plus BEMIT, with the prefix following ADR 0008's name.** With ADR 0008's recommendation (keep
`@salemcobalt`), that is:

- `.sc-c-button`, `.sc-l-stack`, `.sc-u-visually-hidden` and `.sc-t-on-accent`.
- `--sc-*` unchanged.
- `@layer sc` unchanged.

This is the cheapest correct path: 2,111 class references in the DS, 148 in Job Sweep, and zero custom-property
churn. It ships as one minor with a generated codemod and two Stylelint rules that keep it true.

**When:** after ADR 0008's 0.2.0 stable and its docs work. The namespace has no visitor-facing portfolio value and
breaks every class, so it should land as 0.3.0 once the site work is done, likely after 2026-12-31. It should not
land between 0.2.0's rc and stable.

The cost is that `sc-c-` stutters. If that bothers Salem more than half a day of extra migration, it is a reason to
take the Protokit name (`proto-c-button`), not a reason to drop the brand.

## Second opinion (Fable 5.2)

`claude-fable-5-2` reviewed this draft against both repos. It confirmed the counts, `PREFIX = 'sc'`, Job Sweep's
`@layer base, sc;`, its backlog F2, the guideline quotes, and the Tailwind mechanism (unlayered `:root` beats
`@layer theme`).

Its corrections are applied above:

- **Knobs and anchor names.** Component knobs and an anchor name already exist, and the codemod now covers dashed
  idents.
- **Collision count.** It is 65 with the two font weights, not 63.
- **Token count.** 221 generated tokens, from a fresh build.
- **Job Sweep figures.** The SHA and the mockup counts were refreshed.
- **Tailwind risk.** It is now labelled a risk for outside adopters.
- **Class-prefix argument.** It is rewritten with its stronger reasoning: Salem's own apps use `c-`.
- **Timing.** The namespace lands after 0.2.0 stable and the site work.

One flag was not an error: "belief 6" refers to the Gold Standard index's twelve beliefs, where it is belief 6. The
text now says so.

These disagreements are left for Salem:

> **Fable, the hybrid is buried:** bare BEMIT classes with branded `--sc-*` and `@layer sc` is the Gold Standard's
> literal default. It costs the same as the recommendation (zero custom-property churn), has no `sc-c-` stutter, and
> every argument in section 1 is about custom properties and layer names, not classes. Put it to Salem as a real
> choice, including whether the brief meant bare tokens at all.
>
> _Response:_ the brief asked for exactly these two options, so the hybrid is not analysed as a third. It is raised
> as call 8. This ADR's view is that the class argument in section 5 (an app's own unlayered `.c-card` beats the
> system's) is the reason the hybrid loses for a light-DOM system. The hybrid is the right answer inside shadow
> roots.

> **Fable, the Lit future is overweighted:** v0 chose React on Base UI deliberately (ADR 0001). A hypothetical
> rewrite should be a tiebreaker, not a section.
>
> _Response:_ agreed that it is a tiebreaker. The brief asked for the Shadow DOM implications, so the section stays,
> and the recommendation does not depend on it.

## Calls for Salem

Answered 2026-11-15. The answers are recorded under Decisions at the top.

1. **Option 1 (bare BEMIT) or option 2 (brand + BEMIT)?** _Recommend: option 2._ **Salem: brand + BEMIT.**
2. **Prefix**: follows ADR 0008 (`sc` / `pk` / `bds`). _Recommend: `sc`, which leaves custom properties untouched._
   **Salem: `pk` (ADR 0008 renamed to Protokit), then `proto` (decision 9).**
3. **Order**: brand first (`sc-c-button`, as briefed) or BEMIT first like Bolt (`c-sc-button`)? _Recommend: brand
   first._ **Salem: BEMIT first, `c-proto-button`.**
4. **Layout namespace**: `l-` per guideline 01 (B13) or the brief's `o-`? _Recommend: `l-`._ **Salem: `o-`.**
5. **Release shape**: one breaking minor with a codemod, with no dual class names? _Recommend: yes. Add
   `legacy.css` aliases only if custom properties change._ **Salem: one breaking release, `--sc-*` → `--proto-*`, no
   aliases; the codemod covers Job Sweep.**
6. **Job Sweep design mockups** (`docs/design/`, about 14,000 occurrences): leave as frozen snapshots?
   _Recommend: yes._ **Salem: migrate them** (decision 7).
7. **Lint**: add the Stylelint class and custom-property patterns plus the `var()` usage check in both repos as part
   of the migration? _Recommend: yes, as the migration's proof._ **Salem: yes.**
8. **Hybrid** (Fable's call): was bare `--color-*` really intended, or should bare BEMIT classes with branded `--sc-*`
   tokens (the guideline's default) be analysed too? _Recommend: no. Option 2, because in light DOM an app's own
   `c-` classes beat the system's._ **Salem: no hybrid, branded classes and custom properties "for now"** (decision 8, which
   gives the cost of revisiting it).
9. **When**: land as 0.3.0 after 0.2.0 stable and ADR 0008's site work? _Recommend: yes, after 2026-12-31 unless the
   site work finishes early._ **Salem: soon, before portfolio links, ahead of the site work.**
