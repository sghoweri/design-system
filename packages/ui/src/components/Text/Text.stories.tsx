import type { Meta, StoryObj } from '@storybook/react-vite';
import { Text } from './Text';
import { Stack } from '../Stack/Stack';
import { Inline } from '../Inline/Inline';
import { DarkTheme } from '../../stories/helpers';

const meta = {
  title: 'Typography/Text',
  component: Text,
  args: {
    children: 'Postings are scored by fit, comp and freshness; the top of the inbox is where to start.',
    size: 'sm',
    tone: 'default',
    weight: 'regular',
  },
  argTypes: {
    size: { control: 'radio', options: ['xs', 'sm', 'md', 'lg'] },
    tone: {
      control: 'select',
      options: ['default', 'muted', 'subtle', 'accent', 'success', 'warning', 'danger', 'info'],
    },
    weight: { control: 'radio', options: ['regular', 'medium', 'semibold'] },
    align: { control: 'radio', options: [undefined, 'start', 'center', 'end'] },
    family: { control: 'radio', options: ['sans', 'mono'] },
  },
} satisfies Meta<typeof Text>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <Stack gap="sm">
      <Text size="lg">Large, 18–20px: a lede under a page heading.</Text>
      <Text size="md">Medium, 16–17px: body copy with normal leading and a 65ch measure.</Text>
      <Text size="sm">Small, 14px: the UI default for rows, labels and metadata.</Text>
      <Text size="xs">Extra small, 12px: captions and timestamps.</Text>
    </Stack>
  ),
};

export const Tones: Story = {
  render: () => (
    <Stack gap="xs">
      <Text>Default</Text>
      <Text tone="muted">Muted: secondary text and metadata</Text>
      <Text tone="subtle">Subtle: placeholders and disabled labels</Text>
      <Text tone="accent">Accent</Text>
      <Text tone="success">Success: replied</Text>
      <Text tone="warning">Warning: due today</Text>
      <Text tone="danger">Danger: rejected</Text>
      <Text tone="info">Info: screening</Text>
    </Stack>
  ),
};

/** `family="mono"` sets data apart from prose: row metadata, run times, dates. */
export const Mono: Story = {
  render: () => (
    <Stack gap="3xs" style={{ maxWidth: 280 }}>
      <Text weight="semibold">Staff Frontend Engineer, Design Systems</Text>
      <Text family="mono" size="xs" tone="muted" truncate>
        Quillstack · Remote US · 5 h · merged from two boards
      </Text>
    </Stack>
  ),
};

export const Inline_: Story = {
  name: 'Inline and numeric',
  render: () => (
    <Stack gap="xs" style={{ maxWidth: 320 }}>
      <Inline justify="between">
        <Text as="span" weight="medium">
          Applications
        </Text>
        <Text as="span" numeric tone="muted">
          1,204
        </Text>
      </Inline>
      <Inline justify="between">
        <Text as="span" weight="medium">
          Replies
        </Text>
        <Text as="span" numeric tone="muted">
          37
        </Text>
      </Inline>
      <Text as="span" truncate>
        One line that truncates: Senior Design Systems Engineer, Platform Experience, Remote (US)
      </Text>
      <Text truncate={2} tone="muted">
        Clamped to two lines: we read the posting, extract the role, level, comp and location, score it
        against your profile, then rank the inbox so the best fits come first every morning.
      </Text>
    </Stack>
  ),
};

export const Dark: Story = {
  name: 'Dark theme',
  render: () => (
    <DarkTheme>
      <Stack gap="xs">
        <Text>Default</Text>
        <Text tone="muted">Muted</Text>
        <Text tone="subtle">Subtle</Text>
        <Text tone="success">Success</Text>
        <Text tone="danger">Danger</Text>
      </Stack>
    </DarkTheme>
  ),
};
