import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack } from './Stack';
import { Card } from '../Card/Card';

const meta: Meta<typeof Stack> = {
  title: 'Layout/Stack',
  component: Stack,
  args: { gap: 'sm', align: 'stretch', justify: 'start' },
  argTypes: {
    gap: {
      control: 'select',
      options: ['none', '3xs', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'],
    },
    align: { control: 'radio', options: ['stretch', 'start', 'center', 'end'] },
    justify: { control: 'radio', options: ['start', 'center', 'end', 'between'] },
  },
  decorators: [(Story) => <div style={{ maxWidth: 360 }}>{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    children: (
      <>
        <Card padding="sm">First</Card>
        <Card padding="sm">Second</Card>
        <Card padding="sm">Third</Card>
      </>
    ),
  },
};

export const AsList: Story = {
  name: 'As a list',
  render: () => (
    <Stack as="ul" gap="xs">
      <Card as="li" padding="sm">
        Senior Design Systems Engineer
      </Card>
      <Card as="li" padding="sm">
        Staff Frontend Engineer
      </Card>
      <Card as="li" padding="sm">
        Design Engineer
      </Card>
    </Stack>
  ),
};
