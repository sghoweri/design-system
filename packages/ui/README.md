# @salemcobalt/ui

React 19 components for the Salem Cobalt design system: `Button`, `IconButton`, `Icon` and a shipped icon set, `Badge`, `Card`, `Stack`, `Inline`, `Heading`, `Text`, `Kbd`, `Dialog`, `Tooltip`, `Menu`, `Toolbar`, `Banner`, `Spinner`, `Progress`, `Tabs`, `Input`, `Textarea`, `Select`, `Checkbox`, `Switch`, `Table`, `Stat`. Requires `@salemcobalt/tokens`.

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

| Component            | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`             | `variant` primary · secondary · ghost · danger; `size` sm · md · lg; `iconStart`/`iconEnd`; `loading` (keeps width, `aria-busy`); `fullWidth`.                                                                                                                                                                                                                                                                                                                         |
| `IconButton`         | Square Button for one icon. Required `label` (the accessible name); `variant` ghost (default) · secondary · primary · danger; `size`; `tooltip` (`true` shows `label`, or a string); `tooltipSide`; `round`; `loading`.                                                                                                                                                                                                                                                |
| `Icon`, `*Icon`      | 49 outline icons on a 16px grid in `currentColor`, one component each (`PlayIcon`, `ChevronDownIcon` …, listed in `iconNames`); `size` xs 12 · sm 14 · md 16 · lg 20 · xl 24 · em; decorative unless `title` is given. `Icon` wraps your own paths.                                                                                                                                                                                                                    |
| `Badge`              | `tone` neutral · accent · success · warning · danger · info; `variant` soft · solid · outline; `size` sm · md; `dot`. Text only.                                                                                                                                                                                                                                                                                                                                       |
| `Card`               | `variant` outlined · elevated · filled; `padding` none · sm · md · lg; `interactive`; `selected`; `as` or `render` to make it an `a`/`button`/`li`.                                                                                                                                                                                                                                                                                                                    |
| `Stack`, `Inline`    | `gap` from the spacing scale (`none` … `4xl`); `align`; `justify`; `as`. `Inline` wraps unless `wrap={false}`.                                                                                                                                                                                                                                                                                                                                                         |
| `Kbd`                | One key per `Kbd`; `Kbd.Group label="Command K"` groups a shortcut with a `+` (or `separator="space"`).                                                                                                                                                                                                                                                                                                                                                                |
| `Dialog`             | `Root` (`open`, `defaultOpen`, `onOpenChange`, `dismissible`), `Trigger`, `Content` (`size` sm · md · lg), `Title`, `Description`, `Body`, `Actions`, `Close`.                                                                                                                                                                                                                                                                                                         |
| `Toolbar`            | `Root` (required `aria-label`, `wrap`, `gap`), `Group` (`aria-label`, `gap`), `Separator`, `Spacer`, `Button` (`render={<IconButton … />}` or `render={<Menu.Trigger render={…} />}` so the control joins the roving focus: Tab enters, arrows move, Tab leaves).                                                                                                                                                                                                      |
| `Banner`             | `tone` info (default) · success · warning · danger · neutral; `icon` (or `false`); `action` slot; `dismissible` + `onDismiss` (`open` to control); warning and danger are `role="alert"`, the rest `role="status"`.                                                                                                                                                                                                                                                    |
| `Tabs`               | `Root` (`value`, `defaultValue`, `onValueChange`), `List` (required `aria-label`, `fill`), `Tab` (`value`, `icon`, `count`, `disabled`), `Panel` (`value`, `keepMounted`). Arrow keys move, Enter/Space activates.                                                                                                                                                                                                                                                     |
| `Input`, `Textarea`  | Labelled native controls on Base UI's Field: required `label` (`hideLabel` keeps it for assistive tech), `description`, `error` (sets invalid and announces), `invalid`, `required`, `disabled`, `name`, `size` sm · md · lg (Input), `iconStart`/`iconEnd` (Input), `rows`/`resize` (Textarea), `onValueChange(string)` beside native `onChange`.                                                                                                                     |
| `Select`             | Same field props; `options` as `{ value, label, disabled? }` or `{ label, options }` groups; `value`/`defaultValue`/`onValueChange` (`null` for none); `placeholder`; `fullWidth`. Submits through `name` like a native select.                                                                                                                                                                                                                                        |
| `Checkbox`, `Switch` | Required `label`, `description`, `checked`/`defaultChecked`/`onCheckedChange(boolean)`, `name`/`value`, `disabled`, `required`; Checkbox adds `indeterminate`; Switch adds `labelPosition` start · end.                                                                                                                                                                                                                                                                |
| `Tooltip`            | `content`; `children` is the trigger (an `IconButton`, `Button` or focusable `Badge`); `side` top · bottom · left · right; `align`; `delay` (300ms); `open`/`onOpenChange`; `disabled`. `Tooltip.Provider` around a row skips the delay between siblings.                                                                                                                                                                                                              |
| `Menu`               | `Root` (`open`, `onOpenChange`, `modal`), `Trigger` (secondary Button with a chevron, or `render={<IconButton label="More" />}`), `Content` (`side`, `align`), `Item` (`icon`, `trailing`, `tone="danger"`, `disabled`), `LinkItem` (`href`), `CheckboxItem` (`checked`, `onCheckedChange`), `RadioGroup` (`value`, `onValueChange`, `label`) + `RadioItem`, `Group` (`label`), `Separator`. Arrow keys, Home/End, type-ahead, Esc and focus return come from Base UI. |

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
