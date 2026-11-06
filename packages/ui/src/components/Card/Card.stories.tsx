import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './Card';
import { Badge } from '../Badge/Badge';
import { Inline } from '../Inline/Inline';
import { Stack } from '../Stack/Stack';

const Job = ({ title, badge }: { title: string; badge?: React.ReactNode }) => (
  <Stack gap="xs">
    <Inline justify="between">
      <strong>{title}</strong>
      {badge}
    </Inline>
    <span style={{ color: 'var(--sc-color-text-muted)' }}>Linear · Remote · applied 3 days ago</span>
  </Stack>
);

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  args: { variant: 'outlined', padding: 'md', interactive: false, selected: false },
  argTypes: {
    variant: { control: 'radio', options: ['outlined', 'elevated', 'filled'] },
    padding: { control: 'radio', options: ['none', 'sm', 'md', 'lg'] },
  },
  decorators: [(Story) => <div style={{ maxWidth: 360 }}>{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    children: (
      <Job
        title="Senior DS Engineer"
        badge={
          <Badge tone="success" size="sm">
            Interview
          </Badge>
        }
      />
    ),
  },
};

export const Variants: Story = {
  render: () => (
    <Stack gap="md">
      <Card>
        <Job title="Outlined" />
      </Card>
      <Card variant="elevated">
        <Job
          title="Elevated"
          badge={
            <Badge tone="accent" size="sm">
              New
            </Badge>
          }
        />
      </Card>
      <Card variant="filled">
        <Job title="Filled" />
      </Card>
      <Card selected>
        <Job title="Selected" />
      </Card>
    </Stack>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Stack gap="md">
      {/* content comes from Card through the render prop */}
      {/* eslint-disable-next-line jsx-a11y/anchor-has-content */}
      <Card interactive render={<a href="#job-1" />}>
        <Job title="Whole card is a link" />
      </Card>
      <Card interactive as="button" variant="filled" onClick={() => {}}>
        <Job title="Whole card is a button" />
      </Card>
    </Stack>
  ),
};

export const Padding: Story = {
  render: () => (
    <Stack gap="md">
      <Card padding="none">
        <div style={{ padding: 'var(--sc-spacing-xs)' }}>padding="none" (content supplies its own edges)</div>
      </Card>
      <Card padding="sm">padding="sm", radius-lg</Card>
      <Card padding="lg">padding="lg"</Card>
    </Stack>
  ),
};

export const AsNavigation: Story = {
  name: 'As a navigation landmark',
  render: () => (
    <Card as="nav" aria-label="Your files" padding="sm" style={{ maxInlineSize: '16rem' }}>
      <Stack gap="2xs" as="ul" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        <li>
          <a href="#profile">profile.md</a>
        </li>
        <li>
          <a href="#rubric">rubric.md</a>
        </li>
        <li>
          <a href="#sources">sources.yaml</a>
        </li>
      </Stack>
    </Card>
  ),
};
