import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Menu } from './Menu';
import { Dialog } from '../Dialog/Dialog';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { Inline } from '../Inline/Inline';
import { Kbd } from '../Kbd/Kbd';
import {
  ArchiveIcon,
  ClockIcon,
  ExternalLinkIcon,
  FlagIcon,
  MoreHorizontalIcon,
  PauseIcon,
  PlayIcon,
  TrashIcon,
} from '../../icons/icons.gen';
import { Compact, DarkTheme } from '../../stories/helpers';

const meta = {
  title: 'Components/Menu',
  component: Menu.Root,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Menu.Root>;
export default meta;
type Story = StoryObj<typeof meta>;

function PauseMenu() {
  const [paused, setPaused] = useState<'none' | 'mine' | 'all'>('none');
  return (
    <Menu.Root>
      <Menu.Trigger>
        {paused === 'none' ? 'Pause' : paused === 'mine' ? 'Paused: mine' : 'Paused: all'}
      </Menu.Trigger>
      <Menu.Content>
        <Menu.Item icon={<PauseIcon />} onClick={() => setPaused('mine')}>
          Pause mine
        </Menu.Item>
        <Menu.Item icon={<PauseIcon />} onClick={() => setPaused('all')}>
          Pause all
        </Menu.Item>
        <Menu.Separator />
        <Menu.Item icon={<PlayIcon />} onClick={() => setPaused('none')} disabled={paused === 'none'}>
          Resume
        </Menu.Item>
      </Menu.Content>
    </Menu.Root>
  );
}

/** The trigger is a secondary Button with a chevron unless you pass `render`. */
export const Actions: Story = {
  name: 'Pause mine / Pause all',
  render: () => <PauseMenu />,
};

function OverflowMenu() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Menu.Root>
        <Menu.Trigger render={<IconButton label="More actions" tooltip />}>
          <MoreHorizontalIcon />
        </Menu.Trigger>
        <Menu.Content align="end">
          <Menu.Item
            icon={<ClockIcon />}
            trailing={
              <Kbd.Group label="Z">
                <Kbd>Z</Kbd>
              </Kbd.Group>
            }
          >
            Snooze
          </Menu.Item>
          <Menu.Item icon={<FlagIcon />}>Flag</Menu.Item>
          <Menu.LinkItem
            icon={<ExternalLinkIcon />}
            href="https://example.com"
            target="_blank"
            rel="noreferrer"
          >
            Open posting
          </Menu.LinkItem>
          <Menu.Separator />
          <Menu.Item icon={<ArchiveIcon />}>Archive</Menu.Item>
          <Menu.Item icon={<TrashIcon />} tone="danger" onClick={() => setOpen(true)}>
            Delete
          </Menu.Item>
        </Menu.Content>
      </Menu.Root>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Content size="sm">
          <Dialog.Close />
          <Dialog.Title>Delete this application?</Dialog.Title>
          <Dialog.Description>This cannot be undone.</Dialog.Description>
          <Dialog.Actions>
            <Dialog.Close render={<Button variant="secondary" />}>Cancel</Dialog.Close>
            <Dialog.Close render={<Button variant="danger" />}>Delete</Dialog.Close>
          </Dialog.Actions>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}

/** Overflow menu on an IconButton; the danger item opens a controlled Dialog. */
export const Overflow: Story = {
  name: 'Overflow with icons, shortcut, link and danger',
  render: () => <OverflowMenu />,
};

function ViewMenu() {
  const [stale, setStale] = useState(false);
  const [applied, setApplied] = useState(true);
  const [sort, setSort] = useState('score');
  return (
    <Menu.Root>
      <Menu.Trigger>View</Menu.Trigger>
      <Menu.Content>
        <Menu.Group label="Show">
          <Menu.CheckboxItem checked={stale} onCheckedChange={setStale} trailing="24">
            Stale postings
          </Menu.CheckboxItem>
          <Menu.CheckboxItem checked={applied} onCheckedChange={setApplied} trailing="7">
            Applied
          </Menu.CheckboxItem>
        </Menu.Group>
        <Menu.Separator />
        <Menu.RadioGroup label="Sort by" value={sort} onValueChange={setSort}>
          <Menu.RadioItem value="score">Score</Menu.RadioItem>
          <Menu.RadioItem value="date">Date posted</Menu.RadioItem>
          <Menu.RadioItem value="company">Company</Menu.RadioItem>
        </Menu.RadioGroup>
      </Menu.Content>
    </Menu.Root>
  );
}

/** Checkbox and radio items stay open when toggled so several can change at once. */
export const Selection: Story = {
  name: 'Checkbox and radio items',
  render: () => <ViewMenu />,
};

export const Placement: Story = {
  render: () => (
    <Inline gap="md">
      {(['bottom', 'top', 'right', 'left'] as const).map((side) => (
        <Menu.Root key={side}>
          <Menu.Trigger>{side}</Menu.Trigger>
          <Menu.Content side={side} align="start">
            <Menu.Item>First</Menu.Item>
            <Menu.Item>Second</Menu.Item>
          </Menu.Content>
        </Menu.Root>
      ))}
    </Inline>
  ),
};

export const CompactDensity: Story = {
  name: 'Compact density',
  render: () => (
    <Compact>
      <PauseMenu />
    </Compact>
  ),
};

export const Dark: Story = {
  name: 'Dark theme',
  render: () => (
    <DarkTheme>
      <Inline gap="md">
        <PauseMenu />
        <OverflowMenu />
        <ViewMenu />
      </Inline>
    </DarkTheme>
  ),
};
