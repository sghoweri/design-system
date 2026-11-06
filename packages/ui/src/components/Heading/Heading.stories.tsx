import type { Meta, StoryObj } from '@storybook/react-vite';
import { Heading } from './Heading';
import { Text } from '../Text/Text';
import { Stack } from '../Stack/Stack';
import { DarkTheme } from '../../stories/helpers';

const meta = {
  title: 'Typography/Heading',
  component: Heading,
  args: { level: 2, children: 'Senior Design Systems Engineer', tone: 'default', truncate: false },
  argTypes: {
    level: { control: 'radio', options: [1, 2, 3, 4, 5, 6] },
    size: {
      control: 'select',
      options: [undefined, 'overline', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'],
    },
    tone: {
      control: 'select',
      options: ['default', 'muted', 'subtle', 'accent', 'success', 'warning', 'danger', 'info'],
    },
  },
} satisfies Meta<typeof Heading>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** `level` sets the element; `size` defaults from it and can be changed without touching the outline. */
export const Levels: Story = {
  render: () => (
    <Stack gap="sm">
      <Heading level={1}>Level 1, 3xl</Heading>
      <Heading level={2}>Level 2, 2xl</Heading>
      <Heading level={3}>Level 3, xl</Heading>
      <Heading level={4}>Level 4, lg</Heading>
      <Heading level={5}>Level 5, md</Heading>
      <Heading level={6}>Level 6, sm</Heading>
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack gap="sm">
      <Heading size="5xl">Display 5xl</Heading>
      <Heading size="4xl">Display 4xl</Heading>
      <Heading level={2} size="lg">
        An h2 at lg
      </Heading>
      <Heading level={3} size="sm" tone="muted">
        An h3 at sm, muted: a section label
      </Heading>
    </Stack>
  ),
};

/** `overline`: a 12px uppercase mono section label with wide tracking, muted unless a tone is set. Keep the level real. */
export const Overline: Story = {
  render: () => (
    <Stack gap="2xs" style={{ maxWidth: 360 }}>
      <Heading level={3} size="overline">
        Why it fits
      </Heading>
      <Text tone="muted">The design system is the product here, with a platform team behind it.</Text>
    </Stack>
  ),
};

export const InACard: Story = {
  name: 'Card title and metadata',
  render: () => (
    <Stack gap="2xs" style={{ maxWidth: 320 }}>
      <Heading level={3} size="md" truncate>
        Senior Design Systems Engineer, Platform Experience
      </Heading>
      <Text tone="muted">Linear · Remote · applied 3 days ago</Text>
    </Stack>
  ),
};

export const Dark: Story = {
  name: 'Dark theme',
  render: () => (
    <DarkTheme>
      <Stack gap="sm">
        <Heading level={1}>Inbox</Heading>
        <Heading level={3} tone="muted">
          12 postings, 3 new
        </Heading>
      </Stack>
    </DarkTheme>
  ),
};
