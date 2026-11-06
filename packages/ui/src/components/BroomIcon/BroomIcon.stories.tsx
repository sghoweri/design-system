import type { Meta, StoryObj } from '@storybook/react-vite';
import { BroomIcon } from './BroomIcon';
import { IconButton } from '../IconButton/IconButton';
import { Inline } from '../Inline/Inline';
import { Stack } from '../Stack/Stack';
import { Text } from '../Text/Text';
import { DarkTheme } from '../../stories/helpers';

const meta = {
  title: 'Components/BroomIcon',
  component: BroomIcon,
  args: { sweeping: true, size: 'display' },
  argTypes: {
    size: { control: 'radio', options: ['xs', 'sm', 'md', 'lg', 'xl', 'display'] },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Animated inline SVG on a 24px grid. The body pivots on the handle top while the dust drifts; with `prefers-reduced-motion` it holds the still pose with the dust shown. Stroke is 1.25px at nav sizes and 1.75px at `display`, at any zoom (`vector-effect: non-scaling-stroke`). Decorative by default: the control around it carries the status ("Sweeps: running").',
      },
    },
  },
} satisfies Meta<typeof BroomIcon>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

function Gallery() {
  return (
    <Stack gap="lg">
      <Inline gap="lg" align="end">
        <BroomIcon size="display" sweeping />
        <BroomIcon size="display" />
        <BroomIcon size="xl" sweeping />
        <BroomIcon size="lg" sweeping />
        <BroomIcon size="md" sweeping />
      </Inline>
      <Inline gap="md">
        <Inline gap="xs">
          <IconButton label="Sweeps: running" dot="success">
            <BroomIcon sweeping />
          </IconButton>
          <Text size="sm" tone="muted">
            Running
          </Text>
        </Inline>
        <Inline gap="xs">
          <IconButton label="Sweeps: paused" dot="warning">
            <BroomIcon />
          </IconButton>
          <Text size="sm" tone="muted">
            Paused
          </Text>
        </Inline>
        <Inline gap="xs">
          <IconButton label="Sweeps: idle" size="sm" dot="neutral">
            <BroomIcon />
          </IconButton>
          <IconButton label="Sweeps: running" size="lg" variant="secondary" dot="success">
            <BroomIcon sweeping />
          </IconButton>
        </Inline>
      </Inline>
    </Stack>
  );
}

export const Sizes: Story = { name: 'Sizes and status dots', render: () => <Gallery /> };

export const Dark: Story = {
  name: 'Dark theme',
  render: () => (
    <DarkTheme>
      <Gallery />
    </DarkTheme>
  ),
};
