# @salemcobalt/ui

React 19 components for the Salem Cobalt design system: `Button`, `IconButton`, `Icon` and a shipped icon set, `BroomIcon`, `Badge`, `Card`, `Stack`, `Inline`, `Heading`, `Text`, `Kbd`, `Dialog`, `Tooltip`, `Menu`, `Popover`, `PriorityNav`, `Toolbar`, `Banner`, `Spinner`, `Progress`, `Tabs`, `Input`, `Textarea`, `Select`, `FileInput`, `Checkbox`, `Switch`, `Table`, `Stat`, `Chip`, `Disclosure`, `EmptyState`, `Skeleton`. Requires `@salemcobalt/tokens`.

```ts
import '@salemcobalt/tokens/css'; // custom properties, light + dark
import '@salemcobalt/ui/fonts'; // self-hosted IBM Plex Sans (variable) and Plex Mono, optional
import '@salemcobalt/ui/styles.css'; // the components, inside @layer sc
import {
  Button,
  IconButton,
  Badge,
  Card,
  Stack,
  Inline,
  Kbd,
  Dialog,
  Tooltip,
  Menu,
  PlusIcon,
} from '@salemcobalt/ui';
```

Styles ship as one stylesheet inside `@layer sc`, so an app's unlayered CSS always wins. Every value in it is a token custom property; theme with `data-theme="light|dark"` on `<html>` and density with `data-density="compact"` on any ancestor. Interactive behaviour (Dialog, Tooltip and Menu focus and keyboard handling, `render` composition) comes from Base UI; see `docs/adr/0001-headless-primitives.md`.

| Component            | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Button`             | `variant` primary · secondary · ghost · danger; `size` sm · md · lg; `iconStart`/`iconEnd`; `loading` (keeps width, `aria-busy`); `fullWidth`. `shortcut={<Kbd>N</Kbd>}` shows a key hint after the label, tinted to the variant and hidden from the name (add `aria-keyshortcuts="n"`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `IconButton`         | Square Button for one icon. Required `label` (the accessible name); `variant` ghost (default) · secondary · primary · danger; `size`; `tooltip` (`true` shows `label`, or a string); `tooltipSide`; `round`; `loading`; `render={<a href />}` or a Next.js `Link` makes it a link. `dot` neutral · accent · success · warning · danger · info puts a status dot top-left with a ring in `--sc-icon-button-dot-ring` (default `surface-default`; set it to the header background); decorative, so say the status in `label`.                                                                                                                                                                                                                                                                                              |
| `Icon`, `*Icon`      | 49 outline icons on a 16px grid in `currentColor`, one component each (`PlayIcon`, `ChevronDownIcon` …, listed in `iconNames`); `size` xs 12 · sm 14 · md 16 · lg 20 · xl 24 · em; decorative unless `title` is given. `Icon` wraps your own paths.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `Badge`              | `tone` neutral · accent · success · warning · danger · info; `variant` soft · solid · outline; `size` sm · md; `dot`. Text only.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `Card`               | `variant` outlined · elevated · filled; `padding` none · sm · md · lg; `interactive`; `selected`; `as` or `render` to make it an `a`/`button`/`li`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `Stack`, `Inline`    | `gap` from the spacing scale (`none` … `4xl`); `align`; `justify`; `as`. `Inline` wraps unless `wrap={false}`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `Kbd`                | One key per `Kbd`; `Kbd.Group label="Command K"` groups a shortcut with a `+` (or `separator="space"`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `Dialog`             | `Root` (`open`, `defaultOpen`, `onOpenChange`, `dismissible`), `Trigger`, `Content` (`size` sm · md · lg, every size clamps to the viewport minus a 16px gutter; `variant="sheet"` becomes a bottom sheet below 640px with a scrolling `Body`), `Title`, `Description`, `Body`, `Actions`, `Close`. Menus, selects and tooltips opened inside render above it.                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `Toolbar`            | `Root` (required `aria-label`, `wrap`, `gap`), `Group` (`aria-label`, `gap`), `Separator`, `Spacer`, `Button` (`render={<IconButton … />}` or `render={<Menu.Trigger render={…} />}` so the control joins the roving focus: Tab enters, arrows move, Tab leaves), `Link` (an anchor in the same navigation; `render={<IconButton label render={<a href />} />}` for an icon link).                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `Banner`             | `tone` info (default) · success · warning · danger · neutral; `icon` (or `false`); `action` slot; `dismissible` + `onDismiss` (`open` to control); warning and danger are `role="alert"`, the rest `role="status"`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `Tabs`               | `Root` (`value`, `defaultValue`, `onValueChange`), `List` (required `aria-label`, `fill`), `Tab` (`value`, `icon`, `count`, `disabled`), `Panel` (`value`, `keepMounted`). Arrow keys move, Enter/Space activates. `List variant="segmented"`: a quiet segmented control (sunken track, the active tab raised on `surface-default`, no accent, plain muted counts); `line` stays the default.                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `Input`, `Textarea`  | Labelled native controls on Base UI's Field: required `label` (`hideLabel` keeps it for assistive tech), `description`, `error` (sets invalid and announces), `invalid`, `required`, `disabled`, `name`, `size` sm · md · lg (Input), `iconStart`/`iconEnd` (Input), `rows`/`resize`/`variant="code"` (Textarea; monospace, tab-size 2, no spellcheck, add native `wrap="off"` for sideways scroll), `onValueChange(string)` beside native `onChange`. Every native attribute passes through: `type="date" \| "time" \| "number"` keep the same height, `list` + a `<datalist>` gives suggestions.                                                                                                                                                                                                                       |
| `Select`             | Same field props; `options` as `{ value, label, disabled? }` or `{ label, options }` groups; `value`/`defaultValue`/`onValueChange` (`null` for none, shows `placeholder`; no sentinel option needed); `clearable` adds an × and Backspace/Delete on the trigger that call `onValueChange(null)`; `clearLabel`; `fullWidth`. Submits through `name` like a native select.                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `FileInput`          | Same field props (`label`, `hideLabel`, `description`, `error`, `invalid`, `required`, `disabled`, `name`, `size`) on a drop zone built on FilePond (docs/adr/0004): `accept` (`".pdf,.docx"`, MIME types, `image/*`, as the native attribute), `acceptLabel`, `maxFileSize` (bytes or `"10MB"`), `multiple` + `maxFiles`, `files`/`defaultFiles`/`onFilesChange(File[])`, `idleLabel`, `browseLabel`. No upload server: plain `File`s go to the callback, and with `name` to the form's `FormData` (Server Actions included). Rejected files never join the list; the reason shows in the error slot and is announced. Without `multiple`, a new file replaces the current one only once it passes. FilePond loads on mount, in its own chunk.                                                                          |
| `Checkbox`, `Switch` | Required `label`, `description`, `checked`/`defaultChecked`/`onCheckedChange(boolean)`, `name`/`value`, `disabled`, `required`; Checkbox adds `indeterminate`; Switch adds `labelPosition` start · end.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `Tooltip`            | `content`; `children` is the trigger (an `IconButton`, `Button` or focusable `Badge`); `side` top · bottom · left · right; `align`; `delay` (300ms); `open`/`onOpenChange`; `disabled`. `Tooltip.Provider` around a row skips the delay between siblings.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `Chip`               | A pill: `tone` neutral · accent · success · warning · danger · info; `size` sm · md; `icon`; `onClick` + `selected` make it a toggle button (`aria-pressed`); `onRemove` adds a labelled × (Backspace/Delete on the chip removes too); `removeLabel`; `disabled`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `Disclosure`         | A native `<details>` collapse: required `summary`, `summaryOpen`, `open`/`defaultOpen`/`onOpenChange`, `previewLines` (fades the first N lines while closed, summary moves below), `summaryPosition`; share `name` for an exclusive group.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `EmptyState`         | Centred placeholder: required `title`, `description`, `icon` (24px in a muted circle), children are the actions, `size` sm · md, `as` div · section · li.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `Skeleton`           | Loading placeholder, `aria-hidden`: `variant` text (default, one line) · rect · circle, `width`, `height`, `lines` (text, last line shorter), `still`. Put `aria-busy` on the region or a labelled `Spinner` beside it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `Menu`               | `Root` (`open`, `onOpenChange`, `modal`), `Trigger` (secondary Button with a chevron, or `render={<IconButton label="More" />}`), `Content` (`side`, `align`), `Item` (`icon`, `trailing`, `tone="danger"`, `disabled`), `LinkItem` (`href`), `CheckboxItem` (`checked`, `onCheckedChange`), `RadioGroup` (`value`, `onValueChange`, `label`) + `RadioItem`, `Group` (`label`), `Separator`. Arrow keys, Home/End, type-ahead, Esc and focus return come from Base UI.                                                                                                                                                                                                                                                                                                                                                   |
| `PriorityNav`        | Priority+ primary navigation (docs/adr/0005): required `aria-label`; `items` as `{ href, label, id?, current? }` in priority order; links that fit stay inline and the rest go into a "More" disclosure (APG disclosure navigation: a `button` with `aria-expanded`, not a menu; Esc, click outside and focus leaving close it). The `current` link is never collapsed. `moreLabel`, `moreCountLabel(n)` (announced only: "More, 3 links"), `renderLink={(props) => <Link {...props} />}` for a router. Server-renders every link on one clipped line (scrolls sideways without JS), measures widths once (again after web fonts load or when keys/string labels change) and re-renders only when the inline count changes. Takes the free space in a flex row (`flex: 1 1 0%`); in a grid use a `minmax(0, 1fr)` track. |
| `Popover`            | Non-modal panel on Base UI Popover: `Root` (`open`, `defaultOpen`, `onOpenChange`, `modal` default false), `Trigger` (secondary Button, or `render={<IconButton label dot />}`), `Content` (`side`, `align`, `sideOffset`, `arrow`; Menu's surface, `--sc-z-dropdown`), `Title` (names the dialog), `Description`, `Close` (the × with no children, or wraps a Button). Esc and focus return come from Base UI.                                                                                                                                                                                                                                                                                                                                                                                                          |
| `BroomIcon`          | Animated 24px-grid icon for "a sweep is running": `sweeping`, `size` (Icon sizes, default `lg`, or `display` 72px with a 1.75px stroke), `title`. Inline SVG; strokes stay 1.25px at any size; holds still with the dust shown under `prefers-reduced-motion`. Inside an IconButton it takes the next icon size up.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

```tsx
<Dialog.Root>
  <Dialog.Trigger render={<Button variant="secondary" />}>Archive</Dialog.Trigger>
  <Dialog.Content size="sm">
    <Dialog.Close />
    <Dialog.Title>Archive 3 applications?</Dialog.Title>
    <Dialog.Description>They stay searchable.</Dialog.Description>
    <Dialog.Actions>
      <Dialog.Close render={<Button variant="secondary" />}>Cancel</Dialog.Close>
      <Dialog.Close render={<Button />}>Archive</Dialog.Close>
    </Dialog.Actions>
  </Dialog.Content>
</Dialog.Root>
```

```tsx
<Tooltip.Provider>
  <Inline gap="2xs">
    <IconButton label="Pause my sweeps" tooltip>
      <PauseIcon />
    </IconButton>
    <Menu.Root>
      <Menu.Trigger render={<IconButton label="More actions" tooltip />}>
        <MoreHorizontalIcon />
      </Menu.Trigger>
      <Menu.Content align="end">
        <Menu.Item icon={<ClockIcon />} onClick={snooze}>
          Snooze
        </Menu.Item>
        <Menu.CheckboxItem checked={stale} onCheckedChange={setStale}>
          Show stale
        </Menu.CheckboxItem>
        <Menu.Separator />
        <Menu.Item tone="danger" onClick={remove}>
          Delete
        </Menu.Item>
      </Menu.Content>
    </Menu.Root>
  </Inline>
</Tooltip.Provider>
```

```tsx
<Toolbar.Root aria-label="Inbox actions">
  <Toolbar.Group aria-label="Sweeps">
    <Toolbar.Button render={<IconButton label="Pause my sweeps" tooltip />}>
      <PauseIcon />
    </Toolbar.Button>
  </Toolbar.Group>
  <Toolbar.Separator />
  <Toolbar.Spacer />
  <Toolbar.Button render={<Button size="sm" />}>Add job</Toolbar.Button>
</Toolbar.Root>

<Banner tone="warning" action={<Button variant="ghost" size="sm">Resume</Button>}>Your sweeps are paused.</Banner>

<Progress label="Verifying" value={460} max={859} valueText="460 of 859 · 3 min elapsed" />
<Progress variant="inline" label="Queued" />

<Tabs.Root defaultValue="inbox">
  <Tabs.List aria-label="Inbox sections">
    <Tabs.Tab value="inbox" count={12}>Inbox</Tabs.Tab>
    <Tabs.Tab value="applied">Applied</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="inbox">…</Tabs.Panel>
  <Tabs.Panel value="applied">…</Tabs.Panel>
</Tabs.Root>

<form action={save}>
  <Stack gap="md">
    <Input label="Posting URL" name="url" type="url" required description="Paste the job page." />
    <Select label="Status" name="status" options={[{ value: 'new', label: 'New' }, { value: 'replied', label: 'Replied' }]} />
    <Textarea label="Notes" name="notes" />
    <Checkbox label="Remote only" name="remote" />
    <Switch label="Pause my sweeps" name="paused" labelPosition="start" />
  </Stack>
</form>
```

Icons are generated from `src/icons/svg/*.svg` by `scripts/build-icons.mjs` (run by `pnpm build`): the folder is the manifest, every fill and stroke must be `currentColor` or `none`, and the output is committed. The package has no side effects besides CSS, so a bundler keeps only the icons an app imports.

Accessibility baseline: native elements, one focus ring on `:focus-visible`, WCAG AA text on every fill in both themes, 44px touch targets on coarse pointers, `prefers-reduced-motion` honoured, logical properties throughout, Dialog traps focus, closes on Esc and returns focus to its trigger, Menu is fully keyboard operable, and every IconButton is named. Tooltips are hints only: they never open on touch and the trigger must already carry its own name.
