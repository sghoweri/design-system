import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';
import { PriorityNav, type PriorityNavItem } from './PriorityNav';
import { Popover } from '../Popover/Popover';
import { IconButton } from '../IconButton/IconButton';
import { Button } from '../Button/Button';
import { Kbd } from '../Kbd/Kbd';
import { BroomIcon } from '../BroomIcon/BroomIcon';
import { Text } from '../Text/Text';
import { PlusIcon } from '../../icons/icons.gen';
import { DarkTheme } from '../../stories/helpers';

const LABELS = ['Inbox', 'Applications', 'Sweeps', 'Files', 'Learning', 'Settings'];

/** Links that switch the current page in place instead of navigating, so the story can be clicked through. */
function Demo({ initial = 'Inbox', label = 'Main' }: { initial?: string; label?: string }) {
  const [current, setCurrent] = useState(initial);
  const items: PriorityNavItem[] = LABELS.map((label) => ({
    href: `#${label.toLowerCase()}`,
    label,
    current: label === current,
  }));
  return (
    <PriorityNav
      aria-label={label}
      items={items}
      renderLink={({ children, onClick, href, ...props }, item) => (
        <a
          {...props}
          href={href}
          onClick={(event) => {
            onClick?.(event);
            event.preventDefault();
            setCurrent(String(item.label));
          }}
        >
          {children}
        </a>
      )}
    />
  );
}

function Resizable({ children, initial = 560 }: { children: ReactNode; initial?: number }) {
  return (
    <div
      style={{
        resize: 'horizontal',
        overflow: 'hidden',
        inlineSize: initial,
        minInlineSize: 120,
        maxInlineSize: '100%',
        padding: 'var(--sc-spacing-xs)',
        paddingBlockEnd: 220,
        border: 'var(--sc-border-width-hairline) dashed var(--sc-color-border-strong)',
        borderRadius: 'var(--sc-radius-md)',
      }}
    >
      {children}
    </div>
  );
}

const meta: Meta<typeof PriorityNav> = {
  title: 'Components/PriorityNav',
  component: PriorityNav,
  parameters: {
    docs: {
      description: {
        component:
          'Priority+ navigation (docs/adr/0005-priority-nav.md). Links that fit stay inline; the rest collapse into a "More" disclosure (APG disclosure navigation, not a menu). The current page never collapses. ' +
          'Item widths are measured once (again after web fonts load and when the items change) and cached; one ResizeObserver on the row recomputes the cut and re-renders only when the number of inline links changes. ' +
          'Before hydration and without JavaScript every link is server-rendered inline on a single line: with JS the line clips for the frames before hydration measures it (no wrap, no layout shift), without JS it scrolls sideways so every link stays reachable. ' +
          'In a flex header it takes the free space (`flex: 1 1 0%`); in a grid give it a `minmax(0, 1fr)` track.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { render: () => <Demo /> };

export const ResizableContainer: Story = {
  name: 'Resizable container',
  render: () => (
    <>
      <Text size="sm" tone="muted">
        Drag the corner. Links collapse into More one at a time and come back as room returns.
      </Text>
      <Resizable>
        <Demo />
      </Resizable>
    </>
  ),
};

export const CurrentWouldOverflow: Story = {
  name: 'Current page would overflow',
  render: () => (
    <>
      <Text size="sm" tone="muted">
        Settings is current and last. At this width it would be in More, so it swaps with the last inline link
        instead.
      </Text>
      <Resizable initial={340}>
        <Demo initial="Settings" />
      </Resizable>
    </>
  ),
};

export const PhoneWidth: Story = {
  name: 'Phone width',
  render: () => (
    <Resizable initial={180}>
      <Demo initial="Sweeps" />
    </Resizable>
  ),
};

/** The global header these pieces were built for: brand, PriorityNav, the sweep status popover, the global action. */
function Header() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--sc-spacing-md)',
        padding: 'var(--sc-spacing-xs) var(--sc-spacing-sm)',
        background: 'var(--sc-color-surface-default)',
        borderBlockEnd: 'var(--sc-border-width-hairline) solid var(--sc-color-border-default)',
      }}
    >
      <Text weight="semibold">Example app</Text>
      <Demo />
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sc-spacing-xs)' }}>
        <Popover.Root>
          <Popover.Trigger render={<IconButton label="Sweeps: running" dot="success" />}>
            <BroomIcon sweeping />
          </Popover.Trigger>
          <Popover.Content arrow align="end">
            <Popover.Title>Sweeps</Popover.Title>
            <Popover.Description>A sweep is running.</Popover.Description>
          </Popover.Content>
        </Popover.Root>
        <Button size="sm" iconStart={<PlusIcon />} shortcut={<Kbd>N</Kbd>} aria-keyshortcuts="n">
          Add item
        </Button>
      </div>
    </div>
  );
}

export const InAHeader: Story = {
  name: 'In a header',
  render: () => (
    <Resizable initial={900}>
      <Header />
    </Resizable>
  ),
};

export const Dark: Story = {
  name: 'Dark theme',
  render: () => (
    <DarkTheme>
      <Resizable initial={900}>
        <Header />
      </Resizable>
      <Resizable initial={340}>
        <Demo initial="Settings" label="Sections" />
      </Resizable>
    </DarkTheme>
  ),
};
