import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';
import { Inline } from '../Inline/Inline';
import { Stack } from '../Stack/Stack';
import { DarkTheme } from '../../stories/helpers';

const tones = ['neutral', 'accent', 'success', 'warning', 'danger', 'info'] as const;
const labels = {
  neutral: 'Draft',
  accent: 'New',
  success: 'Interview',
  warning: 'Follow up',
  danger: 'Rejected',
  info: 'Screening',
};

const meta = {
  title: 'Components/Badge',
  component: Badge,
  args: { children: 'Interview', tone: 'success', variant: 'soft', size: 'md', dot: false },
  argTypes: {
    tone: { control: 'radio', options: tones },
    variant: { control: 'radio', options: ['soft', 'solid', 'outline'] },
    size: { control: 'radio', options: ['sm', 'md'] },
    rounded: { control: 'boolean' },
  },
} satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const AllVariants: Story = {
  name: 'All variants',
  render: () => (
    <Stack gap="md">
      {(['soft', 'solid', 'outline'] as const).map((variant) => (
        <Inline key={variant} gap="xs">
          {tones.map((tone) => (
            <Badge key={tone} tone={tone} variant={variant}>
              {labels[tone]}
            </Badge>
          ))}
        </Inline>
      ))}
    </Stack>
  ),
};

export const SmallWithDot: Story = {
  name: 'Small with dot',
  render: () => (
    <Inline gap="xs">
      <Badge size="sm" tone="success" dot>
        Replied
      </Badge>
      <Badge size="sm" tone="warning" dot>
        Due today
      </Badge>
      <Badge size="sm">Draft</Badge>
    </Inline>
  ),
};

/** Rounded (the default): full radius in the mono face, for status and evidence (the homepage's pills). */
export const Rounded: Story = {
  render: () => (
    <Stack gap="md">
      {(['soft', 'solid', 'outline'] as const).map((variant) => (
        <Inline key={variant} gap="xs">
          {tones.map((tone) => (
            <Badge key={tone} tone={tone} variant={variant}>
              {labels[tone]}
            </Badge>
          ))}
        </Inline>
      ))}
      <Inline gap="xs">
        <Badge size="sm" tone="success" dot>
          Applied
        </Badge>
        <Badge size="sm" tone="warning">
          CORS · named as a gap
        </Badge>
        <Badge size="sm">2 sources</Badge>
      </Inline>
    </Stack>
  ),
};

export const RoundedDark: Story = {
  name: 'Rounded, dark theme',
  render: () => (
    <DarkTheme>
      <Inline gap="xs">
        {tones.map((tone) => (
          <Badge key={tone} tone={tone} dot>
            {labels[tone]}
          </Badge>
        ))}
      </Inline>
    </DarkTheme>
  ),
};

/** `rounded={false}`: the 4px corner in the sans face, for dense tables or beside square controls. */
export const SquareCorners: Story = {
  name: 'Square corners (rounded={false})',
  render: () => (
    <Inline gap="xs">
      {tones.map((tone) => (
        <Badge key={tone} tone={tone} rounded={false}>
          {labels[tone]}
        </Badge>
      ))}
    </Inline>
  ),
};
