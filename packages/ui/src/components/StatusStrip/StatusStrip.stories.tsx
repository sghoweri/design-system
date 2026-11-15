import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusStrip, type StatusStripItem, type StatusStripTone } from './StatusStrip';
import { Card } from '../Card/Card';
import { Heading } from '../Heading/Heading';
import { Inline } from '../Inline/Inline';
import { Stack } from '../Stack/Stack';
import { Text } from '../Text/Text';
import { DarkTheme } from '../../stories/helpers';

const outcome: Record<StatusStripTone, string> = {
  success: 'Finished',
  warning: 'Finished with warnings',
  danger: 'Failed',
  neutral: 'Skipped',
  running: 'Running',
};
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const times = ['7:00 AM', '12:00 PM', '5:00 PM'];

/** 30 made-up runs, oldest first: three a day for ten days, the last one still running. */
function runs(withLinks = true): StatusStripItem[] {
  return Array.from({ length: 30 }, (_, i) => {
    const tone: StatusStripTone =
      i === 29
        ? 'running'
        : i === 11 || i === 23
          ? 'danger'
          : i === 17
            ? 'warning'
            : i === 6
              ? 'neutral'
              : 'success';
    const when = `${days[Math.floor(i / 3) % 7]} ${times[i % 3]}`;
    const detail =
      tone === 'danger'
        ? "Greenhouse didn't answer"
        : tone === 'neutral'
          ? 'paused'
          : tone === 'running'
            ? 'reading 42 of 118'
            : `${(i * 7) % 23} new roles, ${i % 4} scored`;
    return {
      id: `run-${i + 1}`,
      tone,
      label: `${outcome[tone]} · ${when} · ${detail}`,
      href: withLinks ? `#run-${i + 1}` : undefined,
      tooltip: `${when} · ${detail}`,
    };
  });
}

const meta: Meta<typeof StatusStrip> = {
  title: 'Components/StatusStrip',
  component: StatusStrip,
  args: { items: runs(), 'aria-label': 'Last 30 sweeps, oldest first' },
};
export default meta;
type Story = StoryObj<typeof meta>;

/** The last 30 sweeps, newest at the end. Each cell links to its run; hover or focus shows the Tooltip. */
export const Playground: Story = {};

/** Without `href` each cell is a plain list item; the label is still read, and there is nothing to tab to. */
export const WithoutLinks: Story = {
  name: 'Without links',
  args: { items: runs(false).map(({ tooltip: _t, ...item }) => item) },
};

const legend: StatusStripTone[] = ['success', 'warning', 'danger', 'neutral', 'running'];

/** Every tone has its own shape, so none is told by colour alone (WCAG 1.4.1). */
export const Tones: Story = {
  render: () => (
    <Stack gap="xs">
      {legend.map((tone) => (
        <Inline key={tone} gap="xs" align="center">
          <StatusStrip aria-label={outcome[tone]} items={[{ tone, label: outcome[tone] }]} />
          <Text as="span" size="sm">
            {tone} · {outcome[tone]}
          </Text>
        </Inline>
      ))}
    </Stack>
  ),
};

function RunsCard() {
  return (
    <Card>
      <Stack gap="sm">
        <Heading level={3} size="sm">
          Recent runs
        </Heading>
        <StatusStrip aria-label="Last 30 sweeps, oldest first" items={runs()} />
        <Text as="p" size="sm" tone="muted">
          Last run 9:35 PM · 2 failed in 10 days
        </Text>
      </Stack>
    </Card>
  );
}

/** In a card on the Sweeps page; at 390px the 30 cells wrap to rows of 13. */
export const InACard: Story = {
  name: 'In a card',
  decorators: [(Story) => <div style={{ maxWidth: 760 }}>{Story()}</div>],
  render: () => <RunsCard />,
};

export const Dark: Story = {
  name: 'Dark theme',
  decorators: [(Story) => <div style={{ maxWidth: 760 }}>{Story()}</div>],
  render: () => (
    <DarkTheme>
      <Stack gap="lg">
        <StatusStrip aria-label="Last 30 sweeps, oldest first" items={runs()} />
        <RunsCard />
        <Card variant="elevated">
          <StatusStrip aria-label="Last 30 sweeps on a raised card, oldest first" items={runs(false)} />
        </Card>
      </Stack>
    </DarkTheme>
  ),
};
