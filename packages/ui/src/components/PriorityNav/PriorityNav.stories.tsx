import type { Meta, StoryObj } from '@storybook/react-vite';
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { PriorityNav, type PriorityNavItem, type PriorityNavProps } from './PriorityNav';
import { Popover } from '../Popover/Popover';
import { IconButton } from '../IconButton/IconButton';
import { Button } from '../Button/Button';
import { Kbd } from '../Kbd/Kbd';
import { BroomIcon } from '../BroomIcon/BroomIcon';
import { Text } from '../Text/Text';
import { Tooltip } from '../Tooltip/Tooltip';
import { PlusIcon } from '../../icons/icons.gen';
import { DarkTheme } from '../../stories/helpers';

const LABELS = ['Inbox', 'Applications', 'Sweeps', 'Files', 'Learning', 'Settings'];
const MORE_LABELS = [...LABELS, 'Reports', 'Billing', 'Team', 'Help center'];
type Badges = Record<string, Pick<PriorityNavItem, 'badge' | 'badgeLabel'>>;
/** Fictional counts: two suggestions waiting in Files, something new in Learning. */
const BADGES: Badges = {
  Files: { badge: 2, badgeLabel: '2 suggestions to review' },
  Learning: { badge: 'dot', badgeLabel: 'new lessons' },
};

/** Links that switch the current page in place instead of navigating, so the story can be clicked through. */
function Demo({
  initial = 'Inbox',
  label = 'Main',
  labels = LABELS,
  badges,
  ...rest
}: { initial?: string; label?: string; labels?: string[]; badges?: Badges | undefined } & Pick<
  PriorityNavProps,
  'onOverflowChange' | 'overflowHysteresis'
>) {
  const [current, setCurrent] = useState(initial);
  const items: PriorityNavItem[] = labels.map((label) => ({
    href: `#${label.toLowerCase()}`,
    label,
    current: label === current,
    ...badges?.[label],
  }));
  return (
    <PriorityNav
      {...rest}
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

export const LeftEdgePhone: Story = {
  name: 'More at the left edge, phone width',
  globals: { viewport: { value: 'phone390', isRotated: false } },
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ padding: 'var(--sc-spacing-2xs)', blockSize: 400 }}>
      <Text size="sm" tone="muted">
        The toggle sits near the left edge, so the panel flips to the toggle’s start edge instead of running
        off screen. It stays in the viewport even inside a clipping box.
      </Text>
      <div style={{ inlineSize: 150, overflow: 'hidden', resize: 'horizontal' }}>
        <Demo initial="Inbox" />
      </div>
    </div>
  ),
};

/**
 * The global header these pieces were built for: brand, PriorityNav, the sweep status popover, the global
 * action. When links start collapsing, "Add item" goes icon-only (tooltip and shortcut kept); the nav's
 * `overflowHysteresis` is the room the label takes, so the label only returns when it fits beside every link.
 */
function Header({ labels = LABELS, badges }: { labels?: string[]; badges?: Badges | undefined }) {
  const [compact, setCompact] = useState(false);
  const [labelRoom, setLabelRoom] = useState(0);
  const addRef = useRef<HTMLButtonElement>(null);
  // Measure what the label costs while it is shown: full width minus the square icon-only width.
  useLayoutEffect(() => {
    const button = addRef.current;
    if (!button || compact) return;
    const { width, height } = button.getBoundingClientRect();
    setLabelRoom(Math.ceil(width - height));
  }, [compact]);
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
      <Text weight="semibold" style={{ whiteSpace: 'nowrap' }}>
        Example app
      </Text>
      <Demo labels={labels} badges={badges} onOverflowChange={setCompact} overflowHysteresis={labelRoom} />
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
        <Tooltip content="Add item (N)" side="bottom" disabled={!compact}>
          <Button
            ref={addRef}
            size="sm"
            iconStart={<PlusIcon />}
            shortcut={<Kbd>N</Kbd>}
            aria-keyshortcuts="n"
            iconOnly={compact}
          >
            Add item
          </Button>
        </Tooltip>
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

export const HeaderOverflowing: Story = {
  name: 'Header at 900px, overflowing',
  render: () => (
    <>
      <Text size="sm" tone="muted">
        Ten links do not fit: they collapse into More and Add item goes icon-only. Widen the box and the label
        returns only once it fits beside every link.
      </Text>
      <Resizable initial={900}>
        <Header labels={MORE_LABELS} />
      </Resizable>
    </>
  ),
};

export const HeaderPhone: Story = {
  name: 'Header at 375px, icon-only More',
  render: () => (
    <>
      <Text size="sm" tone="muted">
        The nav is under 400px wide (a container query on the nav), so More shows only an ellipsis; its name
        is still “More, N links”.
      </Text>
      <div style={{ inlineSize: 375, paddingBlockEnd: 260 }}>
        <Header />
      </div>
    </>
  ),
};

export const ItemBadges: Story = {
  name: 'Item badges',
  render: () => (
    <>
      <Text size="sm" tone="muted">
        Files has a count, Learning a dot. Narrow the box: once they collapse, More shows the summed count (or
        a dot when only dots are collapsed) and its name adds their labels, e.g. “More, 3 links, 2 suggestions
        to review, new lessons”. Each link keeps its badge in the panel.
      </Text>
      <Resizable>
        <Demo badges={BADGES} />
      </Resizable>
    </>
  ),
};

export const ItemBadgesPhone: Story = {
  name: 'Item badges, header at 375px',
  render: () => (
    <>
      <Text size="sm" tone="muted">
        At phone width Files is collapsed, so the icon-only More carries its count in the corner.
      </Text>
      <div style={{ inlineSize: 375, paddingBlockEnd: 260 }}>
        <Header badges={BADGES} />
      </div>
    </>
  ),
};

export const Dark: Story = {
  name: 'Dark theme',
  render: () => (
    <DarkTheme>
      <Resizable initial={900}>
        <Header badges={BADGES} />
      </Resizable>
      <div style={{ inlineSize: 375, paddingBlockEnd: 260 }}>
        <Header badges={BADGES} />
      </div>
      <Resizable initial={340}>
        <Demo initial="Settings" label="Sections" />
      </Resizable>
    </DarkTheme>
  ),
};
