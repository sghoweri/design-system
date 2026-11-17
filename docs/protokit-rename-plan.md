# Protokit rename plan

Date: 2026-11-15
Status: planned; nothing has started. This plan carries out ADR 0008 (decisions 1 and 6) and ADR 0009 (decisions
1–9; the prefix is `proto`, decision 9). It keeps the GitHub repository and the site's domain (Salem, 2026-11-15: "Keep for now, we'll
figure out the repo and domain name later").

The rename and the class migration land before any portfolio or resume link to the site goes out, and before ADR
0008's docs-site work. The plan is four pull requests and one release merge, plus steps only Salem can take on npm,
listed separately at the end and referenced in the sequence as **S1–S4**. A repo or domain rename is left for later.

## What changes

| Thing                     | Today                                                              | After                                                                                 |
| ------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| npm packages              | `@salemcobalt/tokens`, `@salemcobalt/ui`                           | `@protokit/tokens`, `@protokit/ui` (subpath exports unchanged)                        |
| Component classes         | `.sc-button`, `.sc-dialog__close`                                  | `.c-proto-button`, `.c-proto-dialog__close`                                           |
| Object, utility and theme | `.sc-stack`, `.sc-inline`, `.sc-visually-hidden`, `.sc-on-accent`  | `.o-proto-stack`, `.o-proto-inline`, `.u-proto-visually-hidden`, `.t-proto-on-accent` |
| Custom properties         | `--sc-*`: tokens, knobs, anchor names                              | `--proto-*`, with no aliases                                                          |
| Token build               | `PREFIX = 'sc'` in `packages/tokens/build.mjs`; JS export `prefix` | `'proto'` (the `prefix` export's value changes, which is public API)                  |
| Cascade layer             | `@layer sc`; Job Sweep declares `@layer base, sc;`                 | `@layer proto`; `@layer base, proto;`                                                 |
| Product name              | "Salem Cobalt design system" (READMEs, descriptions, site title)   | "Protokit"                                                                            |
| Homepage copy             | stack list                                                         | ADR 0008 copy C, with type option A, in ADR 0008's homepage step (not this plan)      |
| GitHub repository         | `sghoweri/design-system`                                           | `sghoweri/protokit` (renamed 2026-11-16, after PR 2; "Later (Salem)" below)           |
| Site URL                  | `designsystem.salemcobalt.com`                                     | `protokit.design` (moved 2026-11-16, after PR 2; "Later (Salem)" below)               |
| Versions                  | `latest` 0.1.1, `next` 0.2.0-rc.52                                 | `@protokit/*` starts at the next 0.2.0 rc; its first stable is 0.2.0                  |

**Why the first `@protokit` version is a 0.2.0 rc.** While an rc line is open, the release label is ignored and only
the rc number moves (docs/releasing.md). The rename therefore lands as the next `0.2.0-rc.N` under the new names,
and the first stable is `@protokit/*` 0.2.0. No stable `@salemcobalt` 0.2.0 is cut (ADR 0008, decision 6). The git
tag line (`v0.2.0-rc.N`) carries on unchanged, so the release tooling needs no change.

**Left alone:** `CHANGELOG.md`, `docs/adr/**` and `docs/screenshots/**` are history and keep the old names. Job
Sweep's `docs/design/` mockups are migrated, in their own PR (PR 4, ADR 0009 decision 7).

## Gates before PR 1 merges

1. **This PR (77) is merged**, so the ADRs are accepted on `main`.
2. **The PriorityNav squeezed-frame fix (design-system PR 80, `patch`) is merged.** It cuts the next rc under the
   old names.
3. **Job Sweep has adopted that rc.** When checked on 2026-11-15, `apps/web` pinned `0.2.0-rc.51`,
   `apps/extension` pinned `@salemcobalt/tokens` `0.2.0-rc.27`, and no adoption PR was open. Job Sweep should be on
   the newest old-name rc, with its tests passing, so PR 3 changes names only.
4. **No other design-system PR is open,** or each open one is listed in PR 2 and rebased afterwards. The codemod is
   idempotent, so a branch that rebases onto PR 2 runs it once more and resolves the rest by hand.

## Sequence

### PR 1 (design-system): namespace map, codemod and lint rules

Label `skip-release`. Nothing published changes. About a day, tests included.

- `packages/ui/scripts/namespace-map.mjs` generates `namespace-map.json` from the built `styles.css`, the token
  JSON and a scan for every `--sc-*` dashed ident. That covers knobs (`--sc-toast-offset-block-end`) and anchor
  names (`--sc-bottom-bar`). Blocks get their namespace from one table in the script:
  - `o-`: `stack`, `inline`;
  - `u-`: `visually-hidden`, `focus-ring`;
  - `t-`: `on-accent`;
  - `c-`: every other block.

  The build fails if any class or dashed ident in the output has no map entry.

- `scripts/codemod-namespace.mjs` runs five passes driven by the map:
  - CSS, with `postcss-selector-parser` for selectors and a value walk for dashed idents;
  - string and template literals in TS, TSX, JS, MJS, MDX and Astro, matching map keys only on class-token
    boundaries;
  - `@layer` statements;
  - HTML, for Job Sweep's mockups (PR 4):
    - each inline `<style>` block goes through the CSS pass;
    - each `style` attribute goes through the value walk;
    - each `class` attribute's tokens are mapped;
    - each inline `<script>` goes through the string pass;
  - JSON whose string values hold captured markup, such as `sweeps-popover.before.json`: those values go through the
    HTML pass, and the file is written back with its original indentation.

  It has a `--dry-run` that prints counts per file and takes paths, so Job Sweep can run it as
  `node ../design-system/scripts/codemod-namespace.mjs apps/web apps/extension`.

- Fixture tests:
  - every pass;
  - idempotence (running twice changes nothing);
  - an HTML fixture with a `<style>` block, `style` and `class` attributes, and markup escaped inside JSON;
  - no false positives on `sc-` inside other words.
- The Stylelint config, ready but not yet enforced:
  - `selector-class-pattern` `^(c|o|u|t)-proto-[a-z0-9-]+(__[a-z0-9-]+)?$`;
  - `custom-property-pattern` `^(proto-|_)`;
  - a `var()` usage check against `tokens.json` and the documented knobs.

**As built** (2026-11-15). Where PR 1 differs from the outline above:

- **Location.** All the tools live in `scripts/`:
  - `namespace-map.mjs`, which writes `namespace-map.json`;
  - `codemod-namespace.mjs`;
  - `check-vars.mjs`;
  - `codemod-namespace.test.mjs`, which runs on `node --test` inside `pnpm test`.
- **One text engine instead of separate PostCSS and string passes.** Every rule matches whole names only, so one
  engine covers CSS, Sass, TS, MDX, Astro, HTML, JSON and Markdown alike, with no parser per file type.
- **Prefix rules for dashed idents.** `--sc-*` and `$sc-*` are renamed by prefix rather than per entry. This also
  covers names built at runtime, such as `` `--sc-priority-nav${id}` ``.
- **Token-key strings.** Keys of `tokens.json` written in tests, such as `` `sc-color-${name}` ``, are renamed through
  the token categories in the map.
- **Keyframes.** The map lists all 14, so `sc-spin` becomes `proto-spin`.
- **Package imports.** The codemod also renames them (`@salemcobalt/ui` → `@protokit/ui`, the same for tokens).
- **A leftover check replaces the build-time check.** Instead of failing the build on an unmapped name,
  `codemod-namespace.mjs --check` (`pnpm check:names`) lists every old name still present.
  - On a simulated run over this repo it leaves exactly one: the Logo's SVG mask id, `` `sc-logo-${id}` ``. That is
    PR 2's hand edit.
- **Base UI's custom properties.** The Stylelint config allows the ones the stylesheets read, such as
  `--anchor-width` and `--transform-origin`.
- **The docs site.** Its own classes (`.demo`) are a consumer's and are not linted for the brand.
- **The map** has 60 blocks, which includes Logo (added after the ADR counts), and 277 classes.
- **The `var()` check runs in CI from PR 1 on** (`pnpm check:vars`): it reads the prefix from `tokens.json`. It counts
  the inline-style keys a component sets (`'--sc-text-lines': clamp`) as declarations.
- **The other checks wait for PR 2.** `pnpm lint:css` and `pnpm check:names` fail on every old name until the rename,
  so they join `pnpm lint` there.

### S1 (Salem), when PR 2 is green

The npm names have to exist, with a Trusted Publisher, before PR 2's first publish. See "Salem's steps" below. The
Trusted Publisher setup expires if nothing publishes within two days, so do it when PR 2 is green.

### PR 2 (design-system): the rename

Label `minor`, which the open rc line ignores; it lands as `@protokit/*` `0.2.0-rc.N` on `next`. About half a day,
then review. Three commits, so review reads the hand-written diff apart from the mechanical one:

1. **Codemod output only**: the whole repo except the history listed above.
2. **Hand edits:**
   - package `name`s and `description`s;
   - `PREFIX = 'proto'`;
   - `repository.url` stays `https://github.com/sghoweri/design-system.git` in both packages;
   - READMEs, install lines and import examples;
   - `docs/releasing.md` (package names, the Trusted Publisher section for `@protokit/*`);
   - the Starlight `title` and Storybook branding;
   - the docs site keeps `site: designsystem.salemcobalt.com`; only its title and copy change.
3. **Lint on**: Stylelint and the usage check join `pnpm lint` and CI.

Verification:

- The checks and builds pass: `pnpm build`, `pnpm test`, `pnpm -s lint`, `pnpm -s -r typecheck`,
  `pnpm build-storybook` and `pnpm build-docs`.
- `git grep -E '(^|[^a-z0-9])-?-?sc-[a-z0-9]'` finds only the history files.
- A screenshot diff of every story before and after shows no pixel changes. The rename should change no pixels, so
  any difference is a missed reference.

Salem merges, after S1. The release run publishes `@protokit/tokens` and `@protokit/ui` to `next` with provenance.
That first OIDC publish also validates S1's Trusted Publisher setup.

### PR 3 (Job Sweep): adopt `@protokit`

About half a day.

- Run the codemod over `apps/web` and `apps/extension`. That is 2,159 custom-property references, 23 CSS overrides
  and 125 class strings, mostly in DOM tests, at `f7b5bc56`. Re-count at the time.
- Swap the dependencies to `@protokit/*` at PR 2's rc.
- Change `layers.css` to `@layer base, proto;` and update its test.
- Add the same Stylelint patterns and usage check (ADR 0009, decision 5). Both exclude `docs/design/` for good
  (see PR 4).
- Verify with Job Sweep's tests and builds, plus a look at the inbox, tracker, stepper and file flows in light and
  dark.

### PR 4 (Job Sweep): migrate the design mockups

Right after PR 3, as its own PR, so PR 3's app diff stays reviewable and this one is reviewed by its screenshots. It
can merge before or after the release merge; nothing depends on it. About two hours, most of it the visual check.

**What it covers.** All 29 files under `docs/design/` with an `sc-` occurrence (about 14,000 at `f7b5bc56`; re-count
at the time):

| Files                                                                  | How                                                                                                                 |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 9 HTML pages in `docs/design/concepts/`                                | Codemod HTML pass: inline `<style>` blocks, `style` and `class` attributes, inline scripts                          |
| 6 stylesheets (`*.concept.css`, `*.proposed.css`)                      | Codemod CSS pass                                                                                                    |
| 3 concept scripts (`*.concept.js`) and 3 build scripts (`*.build.mjs`) | Codemod string pass, plus hand edits to the build scripts' `@salemcobalt/*` package paths, which are not in the map |
| `sweeps-popover.before.json` (captured markup of the real panel)       | Codemod JSON pass                                                                                                   |
| 7 Markdown design docs (16 mentions of class or token names)           | The map's token-boundary replace, each of the 16 checked by hand                                                    |

**Cross-check against the build scripts.** Three pages (`sweeps-popover`, `applications-declutter`,
`admin-dashboard`) are generated by their `*.build.mjs` from the packages in `apps/web/node_modules` and a committed
capture. After PR 3, run each one, giving `sweeps-popover` the `--no-capture` flag so it builds from the committed
capture. The rebuilt page should match the codemodded page except where the packages changed since the page was
built; `applications-declutter`, for one, was built against 0.2.0-rc.37, so some drift is expected. Any other difference is a reference the codemod missed. Commit the
codemodded page, because the mockups are snapshots of their date, and note any package drift in the PR.

**Visual check of every page.** The pages are static HTML with no tests, so screenshots are the proof:

- Take full-page screenshots of all 9 pages on the base commit, before the codemod, with Playwright.
- Use 1280px and 390px widths, in light and dark where a page has a theme switch, and every scene where a page has a
  scene switcher.
- Wait for `document.fonts.ready`, because the pages load fonts from the network.
- Repeat on the PR branch and pixel-diff each pair.
- The expected diff is zero. The PR shows the diff summary and the before and after screenshots of any page that
  moved.

**Lint: deliberately excluded, with one check that covers it.**

- **Excluded from Stylelint and the `var()` usage check.** Each page declares its own copy of the tokens, and the
  proposal stylesheets declare tokens that do not exist in the package yet. A usage check against the published
  `tokens.json` would flag the proposals as errors. Nothing edits these files after this PR, so style rules would only
  add noise.
- **Covered by a leftover-prefix check.** One CI step runs the PR 2 grep
  (`git grep -E '(^|[^a-z0-9])-?-?sc-[a-z0-9]' -- docs/design apps`) and fails on any match. That guards the
  migration itself and any page copied from an old one later.

### Release merge (design-system): first stable `@protokit` 0.2.0

A `main` → `release` PR, merged with a merge commit (docs/releasing.md). Salem merges it (S2). The release run tags
`v0.2.0`, publishes both packages to `latest`, writes `CHANGELOG.md`, creates the GitHub release and merges back into
`main`. Job Sweep then pins `0.2.0`; that is a one-line change, folded into its next PR.

### S3–S4 (Salem): deprecate the old names, then link the site

Once `@protokit/*` 0.2.0 is on `latest`: deprecate both `@salemcobalt` packages (S3), then check the live site under
its new name before the first portfolio or resume link goes out (S4).

### Then: ADR 0008's site work

Homepage (copy C, type A), generated component pages after the spike, Decisions, foundations, workshop polish,
`llms.txt` and the Job Sweep case study, in ADR 0008's order.

## Salem's steps

Only Salem can do these: they need Salem's npm login with two-factor authentication, or Salem's merge.

**S1. Create `@protokit/tokens` and `@protokit/ui` on npm and give them a Trusted Publisher** (when PR 2 is green,
then merge PR 2 within two days).

npm cannot attach a Trusted Publisher to a name that has never been published ("must already exist on the npm
registry", docs.npmjs.com/cli/v12/commands/npm-trust). So each package needs one placeholder version, published by
hand:

1. In an empty folder outside the repo, publish one placeholder per package:

   ```sh
   printf '{ "name": "@protokit/ui", "version": "0.0.0-placeholder", "license": "MIT" }\n' > package.json
   npm publish --access public --tag placeholder --otp=<code>
   ```

   Then repeat with `"name": "@protokit/tokens"`.

2. Deprecate each placeholder, so anyone who installs one is told where to go. The same was done for the old
   `0.0.0-stage` versions.

   ```sh
   npm deprecate @protokit/ui@0.0.0-placeholder "Placeholder. Install @protokit/ui@next." --otp=<code>
   npm deprecate @protokit/tokens@0.0.0-placeholder "Placeholder. Install @protokit/tokens@next." --otp=<code>
   ```

3. Attach the Trusted Publisher to each package, as in docs/releasing.md. Either use the package page: **Settings →
   Trusted Publisher → GitHub Actions**, with user `sghoweri`, repository `design-system`, workflow `release.yml` and no
   environment. Or use the CLI (npm 11.15.0 or later):

   ```sh
   npm trust github @protokit/ui --file release.yml --repository sghoweri/design-system
   npm trust github @protokit/tokens --file release.yml --repository sghoweri/design-system
   ```

4. Optionally, set **Publishing access** to _Require two-factor authentication and disallow tokens_, as on the old
   packages.

A new Trusted Publisher configuration "must complete its first successful publish within 2 days", or it expires
(docs.npmjs.com/trusted-publishers). So merge PR 2 soon after.

The registry may point `latest` at the placeholder until 0.2.0 ships. The deprecation message covers that window.

**S2. Merge PR 2, then the `main` → `release` PR**, as for every design-system release.

**S3. Deprecate the old packages** (after `@protokit/*` 0.2.0 is on `latest`):

```sh
npm deprecate @salemcobalt/ui "Renamed to @protokit/ui. Install @protokit/ui instead." --otp=<code>
npm deprecate @salemcobalt/tokens "Renamed to @protokit/tokens. Install @protokit/tokens instead." --otp=<code>
```

This deprecates every version, including the 0.2.0 rcs on `next`. The website does the same under the package's
**Settings → Deprecate package**. The old packages' Trusted Publisher entries can be revoked afterwards
(`npm trust revoke`, or the package settings page), because nothing publishes to them again.

**S4. Check the live site before the first portfolio or resume link goes out**: the name at
`designsystem.salemcobalt.com`, the npm badge pointing at `@protokit/ui`, and the workshop at `/workshop/`.

## Later (Salem)

Salem kept the GitHub repository (`sghoweri/design-system`) and the domain (`designsystem.salemcobalt.com`) through
the rename.

- **Repository: done.** Salem renamed it to `sghoweri/protokit` on 2026-11-16, after PR 2 merged and published
  `0.2.0-rc.55`. A follow-up PR moved the `repository` fields and links; both Trusted Publishers point at `protokit`.
- **Domain: done.** Salem registered `protokit.design` on 2026-11-16 and the site moved there the same day: the
  apex is the production domain in Vercel (Namecheap DNS: `A @` to Vercel's IP, `CNAME www` to the project's
  Vercel DNS target), and `www.protokit.design` and `designsystem.salemcobalt.com` redirect to it with a 308,
  keeping the path. A follow-up PR moved the docs site's `site` and the README.

A rename touches:

- the Trusted Publisher configuration of both `@protokit` packages;
- each package's `repository` field (npm matches `repository.url` exactly: "must exactly match your GitHub
  repository", docs.npmjs.com/trusted-publishers);
- the README badges;
- the Vercel domain, plus a permanent redirect from the old host.

## Effort

About two to three days in all, as ADR 0008 estimated:

- PR 1: about a day.
- PR 2: about half a day, plus review.
- PR 3: about half a day.
- PR 4: about two hours, most of it the visual check.
- The release merge: minutes.
- Salem's steps: about an hour.
