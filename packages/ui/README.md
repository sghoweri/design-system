# @salemcobalt/ui

React 19 components for the Salem Cobalt design system. Requires `@salemcobalt/tokens`.

```ts
import '@salemcobalt/tokens/css';
import '@salemcobalt/ui/styles.css';
import { Button, Badge, Card, Stack, Inline, Kbd, Dialog } from '@salemcobalt/ui';
```

Styles ship as one stylesheet inside `@layer sc`, so an app's unlayered CSS always wins. Interactive behaviour comes from Base UI (see `docs/adr/0001-headless-primitives.md`).
