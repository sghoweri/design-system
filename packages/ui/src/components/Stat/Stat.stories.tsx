import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stat } from './Stat';
import { Card } from '../Card/Card';
import { Inline } from '../Inline/Inline';
import { BriefcaseIcon, ClockIcon, MailIcon, StarIcon } from '../../icons/icons.gen';
import { Compact, DarkTheme } from '../../stories/helpers';

const meta: Meta<typeof Stat> = {
  title: 'Components/Stat',
  component: Stat,
  args: {
    label: 'Applications',
    value: '1,204',
    delta: '+12',
    deltaTone: 'positive',
    trend: 'up',
    hint: 'last 7 days',
    variant: 'outlined',
    size: 'md',
  },
  argTypes: {
    deltaTone: { control: 'radio', options: ['positive', 'negative', 'neutral'] },
    trend: { control: 'radio', options: [undefined, 'up', 'down', 'flat'] },
    variant: { control: 'radio', options: ['outlined', 'filled', 'plain'] },
    size: { control: 'radio', options: ['sm', 'md'] },
  },
  decorators: [(Story) => <div style={{ maxWidth: 800 }}>{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  decorators: [(Story) => <div style={{ maxWidth: 240 }}>{Story()}</div>],
};

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 'var(--sc-spacing-sm)',
  margin: 0,
  padding: 0,
  listStyle: 'none',
} as const;

/** A list of tiles: `as="li"` inside a `ul`. Say which direction is good with `deltaTone`; down can be positive. */
export const Row: Story = {
  name: 'KPI row',
  render: () => (
    <ul style={grid}>
      <Stat
        as="li"
        label="Applications"
        value="1,204"
        delta="+12"
        deltaTone="positive"
        trend="up"
        hint="last 7 days"
        icon={<BriefcaseIcon />}
      />
      <Stat
        as="li"
        label="Reply rate"
        value="37%"
        delta="−3.1 pts"
        deltaTone="negative"
        trend="down"
        hint="last 7 days"
        icon={<MailIcon />}
      />
      <Stat
        as="li"
        label="Median score"
        value="86"
        delta="same as last week"
        trend="flat"
        icon={<StarIcon />}
      />
      <Stat
        as="li"
        label="Stale"
        value="24"
        delta="−8"
        deltaTone="positive"
        trend="down"
        hint="older than 30 days"
        icon={<ClockIcon />}
      />
    </ul>
  ),
};

export const Variants: Story = {
  render: () => (
    <Inline gap="sm" align="stretch">
      <Stat label="Outlined" value="1,204" delta="+12" deltaTone="positive" trend="up" />
      <Stat label="Filled" value="1,204" delta="+12" deltaTone="positive" trend="up" variant="filled" />
      <Card padding="md">
        <Inline gap="lg">
          <Stat label="Plain, in a Card" value="37%" variant="plain" size="sm" />
          <Stat
            label="Plain"
            value="86"
            variant="plain"
            size="sm"
            delta="−2"
            deltaTone="negative"
            trend="down"
          />
        </Inline>
      </Card>
    </Inline>
  ),
};

export const CompactDensity: Story = {
  name: 'Compact density, small',
  render: () => (
    <Compact>
      <Stat label="Applications" value="1,204" delta="+12" deltaTone="positive" trend="up" size="sm" />
    </Compact>
  ),
};

export const Dark: Story = {
  name: 'Dark theme',
  render: () => (
    <DarkTheme>
      <ul style={grid}>
        <Stat
          as="li"
          label="Applications"
          value="1,204"
          delta="+12"
          deltaTone="positive"
          trend="up"
          hint="last 7 days"
        />
        <Stat
          as="li"
          label="Reply rate"
          value="37%"
          delta="−3.1 pts"
          deltaTone="negative"
          trend="down"
          variant="filled"
        />
        <Stat as="li" label="Median score" value="86" delta="unchanged" trend="flat" />
      </ul>
    </DarkTheme>
  ),
};
