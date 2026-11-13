import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { Progress } from './Progress';
import { Button } from '../Button/Button';
import { Stack } from '../Stack/Stack';
import { Inline } from '../Inline/Inline';
import { Toolbar } from '../Toolbar/Toolbar';
import { IconButton } from '../IconButton/IconButton';
import { PauseIcon } from '../../icons/icons.gen';
import { Compact, DarkTheme } from '../../stories/helpers';

const meta: Meta<typeof Progress> = {
  title: 'Components/Progress',
  component: Progress,
  args: {
    label: 'Verifying',
    value: 460,
    max: 859,
    valueText: '460 of 859 · 3 min elapsed',
    tone: 'accent',
    size: 'md',
    variant: 'bar',
  },
  argTypes: {
    tone: { control: 'radio', options: ['accent', 'success', 'warning', 'danger', 'neutral'] },
    size: { control: 'radio', options: ['sm', 'md'] },
    variant: { control: 'radio', options: ['bar', 'inline', 'ring'] },
  },
  decorators: [(Story) => <div style={{ maxWidth: 420 }}>{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

function Sweep() {
  const [done, setDone] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setDone((d) => (d >= 859 ? 0 : Math.min(859, d + 37))), 400);
    return () => clearInterval(id);
  }, []);
  const complete = done >= 859;
  return (
    <Progress
      label={complete ? 'Scored' : 'Verifying'}
      value={done}
      max={859}
      valueText={complete ? '859 of 859 · done' : `${done} of 859 · ${Math.round(done / 150)} min elapsed`}
      tone={complete ? 'success' : 'accent'}
    />
  );
}

/** Steps of a sweep: fetch is indeterminate, verify and score carry counts, the end turns green. */
export const SweepSteps: Story = {
  name: 'Sweep steps',
  render: () => (
    <Stack gap="lg">
      <Progress label="Fetching" valueText="85 pages" />
      <Sweep />
      <Progress label="Scored" value={859} max={859} valueText="859 of 859 · 5 min" tone="success" />
      <Progress label="Failed" value={460} max={859} valueText="Built In returned 429 twice" tone="danger" />
    </Stack>
  ),
};

export const States: Story = {
  render: () => (
    <Stack gap="lg">
      <Progress label="Indeterminate" />
      <Progress label="With percentage" value={37} showValue />
      <Progress label="Small, neutral" value={62} size="sm" tone="neutral" showValue />
      <Progress aria-label="Bare bar" value={80} size="sm" />
      <Progress label="Warning" value={95} tone="warning" valueText="$1.90 of $2.00 budget" />
    </Stack>
  ),
};

/** The inline variant for toolbars and buttons: a spinner beside a short status line. */
export const InlineVariant: Story = {
  name: 'Inline, in a toolbar and a button',
  decorators: [(Story) => <div style={{ maxWidth: 640 }}>{Story()}</div>],
  render: () => (
    <Stack gap="md">
      <Toolbar.Root aria-label="Sweep">
        <Toolbar.Button render={<IconButton label="Pause" />}>
          <PauseIcon />
        </Toolbar.Button>
        <Toolbar.Separator />
        <Progress variant="inline" label="Verifying" value={460} max={859} valueText="460 of 859" />
        <Toolbar.Spacer />
        <Progress variant="inline" label="Queued" tone="neutral" />
      </Toolbar.Root>
      <Inline gap="sm">
        <Button variant="secondary" disabled>
          <Progress variant="inline" label="Processing" valueText="run queued" tone="neutral" />
        </Button>
        <Button variant="secondary" disabled>
          <Progress variant="inline" label="Drafting" value={2} max={3} valueText="2 of 3" />
        </Button>
      </Inline>
    </Stack>
  ),
};

function BudgetMarks() {
  return (
    <Stack gap="lg">
      {[0.6, 1.7, 2].map((spent) => (
        <Progress
          key={spent}
          label="Today's budget"
          size="sm"
          value={spent}
          max={2}
          tone={spent >= 2 ? 'danger' : spent >= 1.6 ? 'warning' : 'accent'}
          valueText={`$${spent.toFixed(2)} of $2.00`}
          marks={[{ value: 1.6, label: 'Haiku only' }]}
        />
      ))}
      <Progress label="Medium bar" value={45} showValue marks={[{ value: 80, label: 'Limit' }]} />
    </Stack>
  );
}

/** Threshold marks: a tick past the track where something changes; its label is read in aria-valuetext. */
export const Marks: Story = {
  name: 'Marks (thresholds)',
  render: () => <BudgetMarks />,
};

function Rings() {
  return (
    <Stack gap="md">
      {(['sm', 'md'] as const).map((size) => (
        <Inline key={size} gap="md" align="center">
          <Progress variant="ring" size={size} aria-label="Setup, none done" value={0} max={5} />
          <Progress variant="ring" size={size} label="Setup" value={2} max={5} valueText="2 of 5 done">
            2/5
          </Progress>
          <Progress
            variant="ring"
            size={size}
            label="Setup"
            value={4}
            max={5}
            valueText="4 of 5 done"
            tone="warning"
          >
            4/5
          </Progress>
          <Progress
            variant="ring"
            size={size}
            label="Setup"
            value={5}
            max={5}
            valueText="All done"
            tone="success"
          >
            5/5
          </Progress>
          <Progress variant="ring" size={size} aria-label="Loading" />
        </Inline>
      ))}
    </Stack>
  );
}

/** A gauge beside a title, sizes sm (36) and md (48): no arc at 0, a quarter spinning while indeterminate. */
export const Ring: Story = {
  render: () => <Rings />,
};

export const CompactDensity: Story = {
  name: 'Compact density',
  render: () => (
    <Compact>
      <Stack gap="md">
        <Progress label="Verifying" value={460} max={859} valueText="460 of 859" size="sm" />
        <Progress variant="inline" label="Queued" />
      </Stack>
    </Compact>
  ),
};

export const Dark: Story = {
  name: 'Dark theme',
  render: () => (
    <DarkTheme>
      <Stack gap="lg">
        <Progress label="Verifying" value={460} max={859} valueText="460 of 859 · 3 min elapsed" />
        <Progress label="Fetching" />
        <Progress label="Scored" value={100} tone="success" showValue />
        <Progress variant="inline" label="Queued" tone="neutral" />
        <BudgetMarks />
        <Rings />
      </Stack>
    </DarkTheme>
  ),
};
