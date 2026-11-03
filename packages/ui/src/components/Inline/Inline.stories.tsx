import type { Meta, StoryObj } from '@storybook/react-vite';
import { Inline } from './Inline';
import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';

const meta = {
  title: 'Layout/Inline',
  component: Inline,
  args: { gap: 'xs', align: 'center', justify: 'start', wrap: true },
  argTypes: {
    gap: {
      control: 'select',
      options: ['none', '3xs', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'],
    },
    align: { control: 'radio', options: ['center', 'start', 'end', 'baseline', 'stretch'] },
    justify: { control: 'radio', options: ['start', 'center', 'end', 'between'] },
  },
} satisfies Meta<typeof Inline>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    children: (
      <>
        <Badge tone="accent">New</Badge>
        <Badge tone="success">Interview</Badge>
        <Badge tone="warning">Follow up</Badge>
        <Badge>Draft</Badge>
      </>
    ),
  },
};

export const Actions: Story = {
  render: () => (
    <Inline justify="end" gap="xs">
      <Button variant="secondary">Cancel</Button>
      <Button>Archive</Button>
    </Inline>
  ),
};

export const Baseline: Story = {
  render: () => (
    <Inline align="baseline" gap="xs">
      <span style={{ fontSize: 'var(--sc-font-size-xl)', fontWeight: 600 }}>12</span>
      <span style={{ color: 'var(--sc-color-text-muted)' }}>applications</span>
    </Inline>
  ),
};
