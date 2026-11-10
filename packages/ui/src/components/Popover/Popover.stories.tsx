import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { Popover } from './Popover';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { BroomIcon } from '../BroomIcon/BroomIcon';
import { Badge } from '../Badge/Badge';
import { Progress } from '../Progress/Progress';
import { Stack } from '../Stack/Stack';
import { Inline } from '../Inline/Inline';
import { Text } from '../Text/Text';
import { PauseIcon, PlayIcon, RefreshIcon } from '../../icons/icons.gen';
import { DarkTheme } from '../../stories/helpers';

const meta: Meta<typeof Popover.Root> = {
  title: 'Components/Popover',
  component: Popover.Root,
  decorators: [(Story) => <div style={{ minBlockSize: 320, paddingInlineStart: 240 }}>{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <Popover.Root>
      <Popover.Trigger>Score legend</Popover.Trigger>
      <Popover.Content>
        <Popover.Title>Score</Popover.Title>
        <Popover.Description>How well a posting matches your profile, 0 to 100.</Popover.Description>
      </Popover.Content>
    </Popover.Root>
  ),
};

export const WithArrow: Story = {
  name: 'With arrow',
  render: () => (
    <Popover.Root defaultOpen>
      <Popover.Trigger>Score legend</Popover.Trigger>
      <Popover.Content arrow>
        <Popover.Close />
        <Popover.Title>Score</Popover.Title>
        <Popover.Description>How well a posting matches your profile, 0 to 100.</Popover.Description>
      </Popover.Content>
    </Popover.Root>
  ),
};

/** A status panel opened from a nav IconButton: the broom sweeps while a sweep runs, the dot says on or paused. */
function SweepStatus({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [running, setRunning] = useState(true);
  return (
    <Popover.Root defaultOpen={defaultOpen}>
      <Popover.Trigger
        render={
          <IconButton
            label={running ? 'Sweeps: running' : 'Sweeps: paused'}
            dot={running ? 'success' : 'warning'}
          />
        }
      >
        <BroomIcon sweeping={running} />
      </Popover.Trigger>
      <Popover.Content arrow align="end" style={{ inlineSize: 300 }}>
        <Stack gap="sm">
          <Inline justify="between" align="center">
            <Popover.Title>Sweeps</Popover.Title>
            <Badge tone={running ? 'success' : 'warning'} dot>
              {running ? 'Running' : 'Paused'}
            </Badge>
          </Inline>
          <Progress label="Verifying" value={56} />
          <Text size="sm" tone="muted">
            Last sweep 5:48 PM. Next in 2 h 10 m.
          </Text>
          <Inline gap="xs">
            <Button size="sm" variant="secondary" iconStart={<RefreshIcon />}>
              Sweep now
            </Button>
            <Button
              size="sm"
              variant="ghost"
              iconStart={running ? <PauseIcon /> : <PlayIcon />}
              onClick={() => setRunning((r) => !r)}
            >
              {running ? 'Pause' : 'Resume'}
            </Button>
          </Inline>
        </Stack>
      </Popover.Content>
    </Popover.Root>
  );
}

export const SweepStatusPanel: Story = {
  name: 'Sweep status from an IconButton',
  render: () => <SweepStatus defaultOpen />,
};

export const Dark: Story = {
  name: 'Dark theme',
  render: () => (
    <DarkTheme>
      <div style={{ minBlockSize: 280 }}>
        <SweepStatus defaultOpen />
      </div>
    </DarkTheme>
  ),
};

/**
 * Opened from a row's action button rather than a `Popover.Trigger`: a controlled Root with `anchor` on the Content.
 * The panel is portaled to the body, so opening it never moves the list.
 */
function AnchoredToRow() {
  const [open, setOpen] = useState(true);
  const anchor = useRef<HTMLButtonElement>(null);
  return (
    <Stack gap="xs" style={{ inlineSize: 320 }}>
      <Inline justify="between" align="center">
        <Text size="sm">Led a design system across 4 product teams</Text>
        <IconButton ref={anchor} label="Correct this reason" size="sm" onClick={() => setOpen(true)}>
          <RefreshIcon />
        </IconButton>
      </Inline>
      <Text size="sm" tone="muted">
        The row below stays where it is while the panel is open.
      </Text>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Content anchor={anchor} align="end">
          <Popover.Close />
          <Popover.Title>Correct this reason</Popover.Title>
          <Popover.Description>Anchored to the row's button, not a Popover.Trigger.</Popover.Description>
        </Popover.Content>
      </Popover.Root>
    </Stack>
  );
}

export const Anchored: Story = {
  name: 'Anchored to another element',
  render: () => <AnchoredToRow />,
};
