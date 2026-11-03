import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';
import { Inline } from '../Inline/Inline';
import { Stack } from '../Stack/Stack';

const tones = ['neutral', 'accent', 'success', 'warning', 'danger'] as const;
const labels = {
  neutral: 'Draft',
  accent: 'New',
  success: 'Interview',
  warning: 'Follow up',
  danger: 'Rejected',
};

const meta = {
  title: 'Components/Badge',
  component: Badge,
  args: { children: 'Interview', tone: 'success', variant: 'soft', size: 'md', dot: false },
  argTypes: {
    tone: { control: 'radio', options: tones },
    variant: { control: 'radio', options: ['soft', 'solid', 'outline'] },
    size: { control: 'radio', options: ['sm', 'md'] },
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
