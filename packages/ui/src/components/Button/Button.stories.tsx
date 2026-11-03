import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
import { Inline } from '../Inline/Inline';
import { Stack } from '../Stack/Stack';

const PlusIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75">
    <path d="M8 3v10M3 8h10" />
  </svg>
);

const meta = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'Add job', variant: 'primary', size: 'md' },
  argTypes: {
    variant: { control: 'radio', options: ['primary', 'secondary', 'ghost', 'danger'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <Inline gap="sm">
      <Button variant="primary">Add job</Button>
      <Button variant="secondary">Cancel</Button>
      <Button variant="ghost">Snooze</Button>
      <Button variant="danger">Delete application</Button>
    </Inline>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Inline gap="sm">
      <Button size="sm">Small 32</Button>
      <Button>Medium 40</Button>
      <Button size="lg">Large 48</Button>
    </Inline>
  ),
};

export const States: Story = {
  render: () => (
    <Stack gap="md">
      <Inline gap="sm">
        <Button disabled>Disabled</Button>
        <Button loading>Sending</Button>
        <Button variant="secondary" iconStart={PlusIcon}>
          With icon
        </Button>
        <Button variant="ghost" iconEnd={PlusIcon}>
          Icon after
        </Button>
      </Inline>
      <Button fullWidth variant="secondary">
        Full width
      </Button>
    </Stack>
  ),
};

export const CompactDensity: Story = {
  name: 'Compact density',
  render: () => (
    <div data-density="compact">
      <Inline gap="sm">
        <Button size="sm">Small 28</Button>
        <Button>Medium 32</Button>
        <Button size="lg">Large 40</Button>
      </Inline>
    </div>
  ),
};
