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
    shape: { control: 'radio', options: ['rounded', 'pill'] },
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

/** `shape="pill"`: full radius in the mono face, for status and evidence (the homepage's pills). */
export const Pill: Story = {
  render: () => (
    <Stack gap="md">
      {(['soft', 'solid', 'outline'] as const).map((variant) => (
        <Inline key={variant} gap="xs">
          {tones.map((tone) => (
            <Badge key={tone} tone={tone} variant={variant} shape="pill">
              {labels[tone]}
            </Badge>
          ))}
        </Inline>
      ))}
      <Inline gap="xs">
        <Badge shape="pill" size="sm" tone="success" dot>
          Applied
        </Badge>
        <Badge shape="pill" size="sm" tone="warning">
          CORS · named as a gap
        </Badge>
        <Badge shape="pill" size="sm">
          2 sources
        </Badge>
      </Inline>
    </Stack>
  ),
};

export const PillDark: Story = {
  name: 'Pill, dark theme',
  render: () => (
    <DarkTheme>
      <Inline gap="xs">
        {tones.map((tone) => (
          <Badge key={tone} tone={tone} shape="pill" dot>
            {labels[tone]}
          </Badge>
        ))}
      </Inline>
    </DarkTheme>
  ),
};
