# @salemcobalt/ui

React 19 components for the Salem Cobalt design system: `Button`, `Badge`, `Card`, `Stack`, `Inline`, `Kbd`, `Dialog`. Requires `@salemcobalt/tokens`.

```ts
import '@salemcobalt/tokens/css'; // custom properties, light + dark
import '@salemcobalt/ui/fonts'; // self-hosted IBM Plex Sans (variable) and Plex Mono, optional
import '@salemcobalt/ui/styles.css'; // the components, inside @layer sc
import { Button, Badge, Card, Stack, Inline, Kbd, Dialog } from '@salemcobalt/ui';
```

Styles ship as one stylesheet inside `@layer sc`, so an app's unlayered CSS always wins. Every value in it is a token custom property; theme with `data-theme="light|dark"` on `<html>` and density with `data-density="compact"` on any ancestor. Interactive behaviour (Dialog focus management, `render` composition) comes from Base UI; see `docs/adr/0001-headless-primitives.md`.

| Component         | Notes                                                                                                                                                          |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`          | `variant` primary · secondary · ghost · danger; `size` sm · md · lg; `iconStart`/`iconEnd`; `loading` (keeps width, `aria-busy`); `fullWidth`.                 |
| `Badge`           | `tone` neutral · accent · success · warning · danger · info; `variant` soft · solid · outline; `size` sm · md; `dot`. Text only.                               |
| `Card`            | `variant` outlined · elevated · filled; `padding` none · sm · md · lg; `interactive`; `selected`; `as` or `render` to make it an `a`/`button`/`li`.            |
| `Stack`, `Inline` | `gap` from the spacing scale (`none` … `4xl`); `align`; `justify`; `as`. `Inline` wraps unless `wrap={false}`.                                                 |
| `Kbd`             | One key per `Kbd`; `Kbd.Group label="Command K"` groups a shortcut with a `+` (or `separator="space"`).                                                        |
| `Dialog`          | `Root` (`open`, `defaultOpen`, `onOpenChange`, `dismissible`), `Trigger`, `Content` (`size` sm · md · lg), `Title`, `Description`, `Body`, `Actions`, `Close`. |

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

Accessibility baseline: native elements, one focus ring on `:focus-visible`, WCAG AA text on every fill in both themes, 44px touch targets on coarse pointers, `prefers-reduced-motion` honoured, logical properties throughout, and Dialog traps focus, closes on Esc and returns focus to its trigger.
