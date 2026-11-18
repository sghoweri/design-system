# ADR 0010: One component manifest, in the Custom Elements Manifest format

Date: 2026-11-18
Status: proposed (Salem decided the format on 2026-11-18; the mapping, the compound rule and the calls at the end
are open until this PR merges)

## Context

ADR 0008 step 3 needs a props table on every component page, and the backlog has two open rows: "Docs: prop
tables" and "Docs: `docs-data` layer". Guideline 13 rules 2, 4 and 5 want one generated data source that the
storefront and the workshop both read. In Salem's Bolt and Pypestream work that source was a Custom Elements
Manifest (CEM).

Salem's decision (2026-11-18): "One manifest. Ideally something that's literally the custom elements manifest spec
so we can utilize the existing tooling from that ecosystem."

The catch is that the CEM describes custom elements, and Protokit ships React components (ADR 0001). The spec has
no kind for a React component. This ADR records how the components map onto the spec, what the mapping gives up,
and which of the ecosystem's tools still work. Tool claims below come from a spike run against the generated file
on 2026-11-18, not from READMEs.

Versions checked on npm on 2026-11-18:

- `custom-elements-manifest` 2.1.0 (the schema);
- `react-docgen-typescript` 2.4.0;
- `ajv` 8.20.0;
- `@pwrs/cem` 0.11.8;
- `@wc-toolkit/changelog` 1.0.2, `cem-validator` 1.3.0, `cem-utilities` 1.6.0, `jsx-types` 1.8.2 and
  `storybook-helpers` 10.7.7;
- `custom-element-vs-code-integration` 1.5.0;
- `api-viewer-element` 1.0.0-pre.10;
- `@custom-elements-manifest/to-markdown` 0.1.0;
- `@custom-elements-manifest/analyzer` 0.11.0.

## Decision

1. **`packages/ui/scripts/build-manifest.mjs` writes `packages/ui/custom-elements.json`.**
   - It runs `react-docgen-typescript` (through its `Parser`, on one TypeScript program over the package entries) and
     maps every exported component to CEM 2.1.0.
   - It runs at the end of `pnpm build`. The file is committed, so every API change shows in the PR diff, the way an
     API report does.
   - It ships in `@protokit/ui` through `"customElements": "custom-elements.json"`, the spec's discovery field. It is
     also exported as `@protokit/ui/custom-elements.json` and listed in `files`.
   - It is deterministic. A stale file fails `pnpm check:manifest` (run by `pnpm test`), the vitest suite, and CI's
     existing "build must leave the tree clean" step.
2. **One docgen configuration.** `packages/ui/scripts/docgen.mjs` holds the prop filter and parser options. The
   generator imports it, and so does Storybook, which now uses `react-docgen-typescript` (`typescript.reactDocgen`
   in `apps/storybook/.storybook/main.ts`) instead of the default `react-docgen`. The controls and the docs tables
   are the same set of props. The plugin's `include` glob is set explicitly: its default resolves from the Storybook
   app and never reaches `packages/ui/src`.
3. **The filter:**
   - Drop a prop that only `@types/react` declares. That covers the DOM, HTML, ARIA and event attributes every element
     has: Button goes from 297 props to its 8.
   - Keep a prop this repo declares, even when it shadows a DOM attribute (`Table.Cell`'s `align`, `Dialog.Content`'s
     `className`).
   - Keep the props of the wrapped primitive, `@base-ui/react` (`render`, `initialFocus`, `nativeButton`). They are
     marked with the spec's own `inheritedFrom`.
   - `children` gets a rule of its own (mapping table).
4. **The mapping below, the compound rule in section 2, and one extension, `x-protokit`, in section 3.**
5. **The docs site reads the manifest through one module**, `apps/docs/src/data/manifest.ts`: the docs-data layer
   (section 5). `<PropsTable of="Button" />` renders from it, on the Button page and on new Dialog and Table pages.

## 1. The mapping

| React                                                 | CEM 2.1.0                                                                                                                                                   | Notes                                                                                                                                                                                                                                                                                                                                                                  |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| An exported component (`Button`)                      | `CustomElementDeclaration`: `kind: "class"`, `customElement: true`, **no `tagName`**                                                                        | The spec allows a declaration with no tag name. A JavaScript `js` export points at it.                                                                                                                                                                                                                                                                                 |
| The entry it is imported from                         | `JavaScriptModule` with `path: "dist/index.js"`; `TextEditor` is in `"dist/editor.js"`                                                                      | The built paths. The docs map them back to `@protokit/ui` and `@protokit/ui/editor` through `package.json` `exports`, and a test checks that both paths are export targets.                                                                                                                                                                                            |
| A prop                                                | `members[]`, `kind: "field"`, with `type`, `default`, `description`, `deprecated`                                                                           | `default` is a JavaScript expression (`"primary"`, `false`). `deprecated` comes from a `@deprecated` JSDoc tag.                                                                                                                                                                                                                                                        |
| Its type                                              | `type.text`, literal unions spelled out in source order: `"sm" \| "md" \| "lg" \| undefined`                                                                | The alias name (`ButtonSize`) is dropped, so a reader needs no TypeScript to see the options. TypeScript orders union members by internal id (`start \| center \| end` printed as `center \| start \| end`), so the generator reads the literals from the source.                                                                                                      |
| Required or optional                                  | An optional prop's `type.text` ends in `\| undefined`, exactly as the source spells it (`exactOptionalPropertyTypes`)                                       | `ClassField` has no `required` flag. A reader treats a type with no `undefined` member as required.                                                                                                                                                                                                                                                                    |
| An `on*` callback prop                                | `events[]`, `name` = the prop (`onOpenChange`), `type.text` = the callback signature                                                                        | Challenged: CEM events are DOM events, named in kebab-case, whose `type` is the event object. Here `name` is the prop a React user passes, and `type` is what it is called with. Nothing is dispatched.                                                                                                                                                                |
| A `ReactNode` prop (`iconStart`, `panelEnd`, `title`) | `slots[]`; `children` is the default slot, `name: ""`                                                                                                       | A `Slot` has no type and no required flag. A required one starts its description with **Required.** (23 slots). A single `ReactElement` counts as a slot. `render` (element-or-function) does not.                                                                                                                                                                     |
| `children`                                            | Default slot when the component declares it, or takes it out of its props (`function Button({ children, … })`)                                              | `children` from `@types/react` alone would put a default slot on `Input` too. Components that pass it through `...rest` (`Card`, `Heading`, `Text`) show none until their props declare it (call 5).                                                                                                                                                                   |
| A Base UI prop on a wrapped part                      | `members[]` with `inheritedFrom: { name: "DialogTriggerProps", package: "@base-ui/react" }`                                                                 | 154 of the 506 members. The docs fold them under each part. Base UI's shared `className`/`render`/`style` come from an anonymous type, reported as `BaseUIComponentProps`.                                                                                                                                                                                             |
| The component's own `--proto-*` knobs                 | `cssProperties[]`, from `@cssprop [--name=default] - description` JSDoc tags                                                                                | The CEM analyzer's own tag syntax. Seven are public today. Custom properties a component sets inline for itself (`--proto-score-fill`, `--proto-selection-bar-height`) are not knobs and are not tagged.                                                                                                                                                               |
| Workshop stories                                      | `demos[]`: `url` = `https://protokit.design/workshop/iframe.html?id=<story-id>&viewMode=story`, `description` = "Title: Story", `source` = the stories file | 306 demos, one per story, read with Storybook's own CSF parser (`storybook/internal/csf-tools`), so the ids match `index.json`. They attach to the component the story title names (`Components/Table/Selection` → Table). The docs link the same story inside the workshop's UI (`/workshop/?path=/story/<id>`), relative so a preview deploy links its own workshop. |
| Source                                                | `source.href`: `https://github.com/sghoweri/protokit/blob/main/packages/ui/src/…`                                                                           | `main`, not a SHA (a committed file cannot name the commit it is in), and no line anchor (it would churn the file on every edit above it).                                                                                                                                                                                                                             |
| Status, "since"                                       | `"x-protokit": { "since": "0.1.0", "status": "…" }` on the component's declaration, from `@since` and `@status` JSDoc tags                                  | Section 3.                                                                                                                                                                                                                                                                                                                                                             |

**What is in it today:**

- 52 exported components: the 50 component folders, plus `AvatarButton` and `EditableChip`, which have their own
  exports. That is the audit's 47 plus Logo, ProtokitMark and ProtokitLogo, added since.
- 113 declarations in all, with 61 compound parts.
- 506 members (154 from Base UI), 32 events, 131 slots, 7 custom properties and 306 demos.
- 412 KB unminified.
- Coverage gaps the file exposes:
  - six parts have no description: `Stepper.Step`, and `Table.Head`, `Body`, `Foot`, `Row` and `Cell`;
  - 89 props, events and slots have no description.

  A status board (guideline 13 rule 13) can count these.

Icon glyphs (`PlayIcon` and the rest) are not declarations: `Icon` documents them, and `iconNames` lists them.
Hooks and helpers (`useRowSelection`, `useToast`, `avatarInitials`) are not in the file yet. Adding them as
`FunctionDeclaration`s is a small follow-up.

## 2. Compound components

`Dialog = { Root, Trigger, … }` (and `Menu`, `Popover`, `Table`, `Tabs`, `Toolbar`, `Toast`, `FullScreenFlow`) is
an object of components. `Kbd`, `Tooltip`, `ReasonList` and `Stepper` are callable components with parts attached
by `Object.assign`. The spec has no nesting, so a rule is needed.

| Option                                                                                                                                                 | Gets                                                                                                                               | Costs                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **(a) A declaration per part, named as JSX writes it (`Dialog.Root`); the family (`Dialog`) is a declaration of its own and the only export** (chosen) | Per-part props, events and slots; one place per component for its description, demos, status and source; names a reader recognises | A declaration name is not a JavaScript identifier (the spec types it as a string; both validators accept it); a tool must group parts by the `Dialog.` prefix |
| (b) One declaration per family, the parts' props merged and prefixed (`Root.open`)                                                                     | One entry per component                                                                                                            | No per-part tables; collisions (every part has `className`); events and slots lose their part                                                                 |
| (c) Parts as their own exports (`DialogRoot`)                                                                                                          | Identifier names                                                                                                                   | Names nobody can import: the manifest would invent API                                                                                                        |
| (d) The family as a `VariableDeclaration`, parts as classes                                                                                            | Spec-accurate for the object                                                                                                       | A variable carries no demos, slots or members, so `Kbd` (callable, with `Kbd.Group`) would need two shapes                                                    |

With (a), a namespace family such as `Dialog` has no members of its own. A callable family such as `Kbd` has its own
props, and `Kbd.Group` is a part. Parts come out in the order the source object lists them.

## 3. Status and "since": where Protokit-only data goes

The official schema (`custom-elements-manifest/schema.json`) sets no `additionalProperties`, so extra fields are
schema-valid. `@pwrs/cem validate` checks against its own "2.1.1-speculative" schema, which sets
`additionalProperties: false` on 25 of 30 definitions, so it rejects every extra field.

| Option                                                                                | Official schema | `cem validate`                  | Readable by tools                      |
| ------------------------------------------------------------------------------------- | --------------- | ------------------------------- | -------------------------------------- |
| Bare `status`/`since` on the declaration (Shoelace and Web Awesome's analyzer plugin) | valid           | fails                           | only by tools that know the convention |
| **`x-protokit: { since, status }` on the declaration** (chosen)                       | valid           | fails (52 errors, all this key) | by our code; clearly not spec          |
| A sentence in `description` or `summary`                                              | valid           | valid                           | by people only; pollutes the text      |
| A second generated file (`status.json`, guideline 13 rule 13's board)                 | n/a             | valid                           | by our code; a second file             |

`x-protokit` is the only extension. A test closes every schema object (`additionalProperties: false`, as `cem`
does) and fails if any other field appears.

An earlier draft also wrote wc-toolkit's `parsedType` convention: `type.text` as written (`ButtonSize`) and
`parsedType.text` expanded. `cem validate` rejected it (104 errors), and no tool in the spike needed it, so the
expanded union went into `type.text` instead. Without `x-protokit`, `cem validate` reports "Manifest is valid".

**"since"** is the first stable version that shipped the component, read from git history once and written as a
`@since` JSDoc tag on each of the 52:

- `0.1.0` for the seven in the first release (`a7d1aa0`): Button, Badge, Card, Stack, Inline, Kbd and Dialog;
- `0.2.0` for the rest, which have only shipped in 0.2.0 release candidates. 0.2.0 is the first stable they will
  ship in.

`0.1.0` was published as `@salemcobalt/ui`, and no `@protokit/ui@0.1.0` exists on npm (call 3). **Status** is read
from `@status` tags, and none are written yet (call 2).

## 4. What strict CEM gives up: the tool spike

Each tool ran against the generated file (`@pwrs/cem` as its CLI, the rest through their documented APIs). To test
whether a failure was the missing `tagName` or something else, the run was repeated on a copy with synthetic tag
names (`proto-button`, `proto-dialog-root`), only in the spike, never shipped. Six seeded changes were used:

- a removed prop (`Button.fullWidth`);
- a narrowed union (`Button.size`);
- a removed slot (`Button.shortcut`);
- a removed event (`Dialog.Root.onRequestClose`);
- a removed custom property (`Meter`'s `--proto-meter-value-width`);
- a removed part (`Table.Caption`).

| Tool                                      | Without `tagName` (what ships)                                                                                                                                                              | With synthetic tag names                                                    | Keep?                                                                               |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `custom-elements-manifest` schema + `ajv` | **Valid**                                                                                                                                                                                   | —                                                                           | **Yes**: the test                                                                   |
| `@pwrs/cem validate`                      | Valid except the 52 `x-protokit` keys                                                                                                                                                       | —                                                                           | No: a 62 MB Go binary (darwin-arm64) for what the closed-schema test already checks |
| `@pwrs/cem breaking`                      | **"No breaking changes detected"** for all six                                                                                                                                              | 5 breaking, 1 dangerous: all six, correctly classified                      | Not as is (call 4)                                                                  |
| `@pwrs/cem health`, `list`, `search`      | Work: `health` scores each declaration's docs (a web-component rubric: "use RFC 2119 keywords"); `list tags` prints `<>` for every tag                                                      | —                                                                           | No                                                                                  |
| `@wc-toolkit/changelog`                   | Empty diff                                                                                                                                                                                  | All six, as readable sentences                                              | Not as is (call 4)                                                                  |
| `@wc-toolkit/cem-validator`               | 228 errors: a missing tag name and `custom-element-definition` export per declaration, and "missing exported type" for every type named in a `type.text` (`CSSProperties`, the literal `2`) | —                                                                           | No                                                                                  |
| `@wc-toolkit/cem-utilities`               | `getAllComponents` → 0, `getComponentByClassName('Button')` → undefined                                                                                                                     | —                                                                           | No                                                                                  |
| `@wc-toolkit/jsx-types`                   | `CustomElements` is empty; `CustomCssProperties` is generated (a typed map of the seven `--proto-*` knobs, usable in `style`)                                                               | Would declare `<proto-button>` as an intrinsic JSX element: wrong for React | No (the CSS map is a nice-to-have)                                                  |
| `custom-element-vs-code-integration`      | "No components found"                                                                                                                                                                       | Would offer `<proto-button>` in HTML files: wrong                           | No                                                                                  |
| `@wc-toolkit/storybook-helpers`           | Looks components up by `tagName`, and targets the web-components Storybook framework                                                                                                        | —                                                                           | No: Storybook reads the same docgen directly (decision 2)                           |
| `api-viewer-element`                      | Loads the file (`hasCustomElements` accepts `customElement: true`) and lists nothing: its picker reads only `custom-element-definition` exports (`@api-viewer/common/lib/manifest.js`)      | —                                                                           | No                                                                                  |
| `@custom-elements-manifest/to-markdown`   | **Renders all 113 declarations** (fields, slots, events, CSS properties); escapes backticks, so inline code in descriptions prints literally; last published 2022                           | —                                                                           | No: `<PropsTable>` and a future `llms.txt` render the file themselves               |
| `@custom-elements-manifest/analyzer`      | Not run: it analyses classes and Lit elements, not function components. Its `@cssprop` tag syntax is reused (decision 1).                                                                   | —                                                                           | No                                                                                  |

**Summary.**

- What works without a tag name: schema validation, the validators' structure checks, and generic renderers.
- What needs a tag name: everything that enumerates "the elements", and that includes both breaking-change
  checkers. Both find every seeded change once tag names exist, so the data is right; they only key on the wrong
  field.
- A synthetic `tagName` is rejected. It would make the IDE, JSX and MCP tools advertise `<proto-button>`, an
  element that does not exist.
- The only dependencies added are `react-docgen-typescript`, `custom-elements-manifest` and `ajv`.

Strict CEM does not fight the goal. The data fits with two compromises, events-as-callbacks and required-in-text,
and one extension. The tooling payoff is smaller than "the ecosystem" suggests, because most of it is tag-keyed.
The format still earns its place: it is a documented, versioned schema with a validator; any CEM reader can parse
the file; and the two diff tools are a 20-line adapter away (call 4).

## 5. The docs-data layer

`apps/docs/src/data/manifest.ts` imports `@protokit/ui/custom-elements.json` and `@protokit/ui/package.json`
through the package's `exports`, the way an app would (ADR 0007 decision 3). It exposes:

- `components()`;
- `component(name)` → `{ declaration, parts, specifier, since, status }`;
- `declaration(name)`;
- `importStatement(name)`;
- `counts()`;
- the readers for the mapping (`typeInfo`, `membersOf`).

An unknown name throws, so a typo fails the build. Wired in this PR:

- `<PropsTable>` (`apps/docs/src/components/PropsTable.tsx`), built from the system's Table, Badge, Heading and
  Text and rendered on the server with no client JavaScript;
- the import line on the three pages;
- `WorkshopLinks.astro`, a list of the component's stories from `demos`.

How the next steps read the same file:

- **Generated component pages** (ADR 0008 step 3): `getStaticPaths()` from `components()`; one template renders the
  header, examples, `<PropsTable of={name} />` and an optional MDX partial.
- **Header card** (guideline 13 rule 5): `component(name)` gives `since`, `status`, `importStatement`,
  `declaration.source.href` and the first demo for the workshop link. The version and npm link come from
  `package.json`.
- **`llms.txt`** (step 7): an Astro endpoint (`src/pages/llms.txt.ts`) that loops over `components()` and writes the
  name, import line, the first sentence of the description, and each own prop with its options. The file is
  already plain data, so there is no second extraction.
- **Proof strip** (step 1): `counts().components` and `counts().stories`. Token and ADR counts come from
  `@protokit/tokens/json` and `docs/adr/`, which this file does not hold.

Guideline 13 rule 2 sketches an Nx `docs-data` target writing `*.ds.json` and a content-layer loader. With one data
file that the package build already writes, a module is enough. An Astro content loader can wrap it later without
changing a consumer.

## Consequences

- `@protokit/ui` grows by `custom-elements.json` (412 KB unminified; nothing imports it at runtime). The `minor`
  label applies (the repository has no changesets; the label is the release record, docs/releasing.md). While the
  0.2.0 rc line is open, it lands as the next rc.
- Every PR that changes a prop, a JSDoc comment or a story changes `custom-elements.json`. Run `pnpm build` (or
  `pnpm --filter @protokit/ui manifest`) and commit the file.
- 51 component files gained `@since` tags (52 components) and six gained `@cssprop` tags (seven properties). No runtime change.
- Storybook's controls change source: `react-docgen-typescript` resolves inherited and aliased types, and the shared
  filter hides DOM attributes. Button's controls drop from every `<button>` attribute to its 8 props.
  `storybook build` stays at about 3 seconds locally.
- New pages: `/components/dialog/` and `/components/table/`.

## Verification

- `pnpm lint`, `pnpm typecheck` and `pnpm test` pass locally on Node 24: 643 ui tests plus 14 manifest tests, and
  `check:manifest` is up to date.
- `pnpm build`, `pnpm build-storybook` and `pnpm build-docs` pass, and the links validate. Built Storybook bundles
  carry `__docgenInfo` for 110 components; Button's lists 8 props.
- In Chromium against `astro preview`, the Button, Dialog and Table pages were checked at 390 and 1024, light and
  dark (`docs/screenshots/props-table-*.png`):
  - the page never scrolls sideways;
  - at 390 every table scrolls inside its own region (2, 16 and 9 regions);
  - at 1024 none needs to;
  - Tab reaches a region, which shows the 2px focus ring, and ArrowRight scrolls it (`props-table-button-390-keyboard.png`);
  - the pages are static HTML, so nothing hydrates, flashes or shifts after load.

## Calls for Salem

1. **`x-protokit` or strictly clean?** Keep `since`/`status` in `x-protokit` (valid against the official schema;
   `cem validate` flags those keys), or move them to a generated `status.json` so the manifest passes every
   validator. _Recommend: keep `x-protokit`._ It is one file, and switching later is a one-line generator change.
2. **Statuses.** No component has a `@status` tag. Pick the vocabulary (`stable`, `beta`, `experimental`?) and which
   components are not `stable`, before the header cards show it. _Recommend: `stable` by default, `beta` for
   Logo, ProtokitMark and ProtokitLogo (added this week) and FullScreenFlow (one consumer)._
3. **"since" for the first seven.** They shipped in `@salemcobalt/ui@0.1.0`. Keep `0.1.0` (the lineage), or reset
   everything to `0.2.0`, the first `@protokit/ui` stable? _Recommend: keep `0.1.0` and have the header card say
   "since 0.1.0 (as @salemcobalt/ui)"._
4. **A breaking-change report.** Wrap `@wc-toolkit/changelog` in a script that adds synthetic tag names in memory
   (never written to the shipped file). Run it on PRs against `main`'s manifest, and print breaking changes in the
   job summary, to inform the release label. About 20 lines plus one dev dependency. _Recommend: yes, as its own
   PR._
5. **`children` via `...rest`.** Card, Heading, Text and other pass-through components show no default slot. Declare
   `children?: ReactNode` with a JSDoc line in their props, a source change per component? _Recommend: yes, in the
   generated-pages PR, where the missing rows show._
