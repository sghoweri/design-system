import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId } from 'react';
import { ReasonList } from './ReasonList';
import { Button } from '../Button/Button';
import { Card } from '../Card/Card';
import { Heading } from '../Heading/Heading';
import { Inline } from '../Inline/Inline';
import { Kbd } from '../Kbd/Kbd';
import { Score } from '../Score/Score';
import { Stack } from '../Stack/Stack';
import { Text } from '../Text/Text';
import { DarkTheme } from '../../stories/helpers';

const meta = {
  title: 'Components/ReasonList',
  component: ReasonList,
  args: { tone: 'for', size: 'md', divider: false },
  argTypes: {
    tone: { control: 'radio', options: ['for', 'against', 'gap'] },
    size: { control: 'radio', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof ReasonList>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <ReasonList {...args} aria-label="Reasons">
      <ReasonList.Item>
        The <strong>design system</strong> is the product here, with a platform team behind it
      </ReasonList.Item>
      <ReasonList.Item>Asks for tokens, accessibility and React</ReasonList.Item>
    </ReasonList>
  ),
};

const columns = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 'var(--sc-spacing-md)',
} as const;

function Reasons() {
  const id = useId();
  return (
    <div style={columns}>
      <Stack gap="xs">
        <Heading level={3} size="overline" id={`${id}-for`}>
          Why it fits
        </Heading>
        <ReasonList tone="for" aria-labelledby={`${id}-for`}>
          <ReasonList.Item>
            The design system is the product here, with a platform team behind it
          </ReasonList.Item>
          <ReasonList.Item>Asks for tokens, accessibility and React: all in your history</ReasonList.Item>
          <ReasonList.Item>Top of range clears your floor and meets your target</ReasonList.Item>
        </ReasonList>
      </Stack>
      <Stack gap="xs">
        <Heading level={3} size="overline" id={`${id}-against`}>
          Against
        </Heading>
        <ReasonList tone="against" aria-labelledby={`${id}-against`}>
          <ReasonList.Item>On-site four days a week</ReasonList.Item>
        </ReasonList>
      </Stack>
      <Stack gap="xs">
        <Heading level={3} size="overline" id={`${id}-gap`}>
          Watch for
        </Heading>
        <ReasonList tone="gap" aria-labelledby={`${id}-gap`}>
          <ReasonList.Item>
            One legacy Angular app in scope. Your rubric counts that as a gap, nothing worse
          </ReasonList.Item>
        </ReasonList>
      </Stack>
    </div>
  );
}

/** One shape per tone: a filled square for, a bar against, a hollow circle for a gap. Each list is named by its overline heading. */
export const Tones: Story = { render: () => <Reasons /> };

/** The detail header: ring Score, the three lists, a mono provenance line and actions with key hints (hidden on touch-only devices). */
export const Detail: Story = {
  render: () => (
    <Card style={{ maxWidth: 720 }}>
      <Stack gap="lg">
        <Inline justify="between" align="start" wrap={false}>
          <Stack gap="3xs">
            <Heading level={2} size="lg">
              Staff Frontend Engineer, Design Systems
            </Heading>
            <Text tone="muted">Quillstack · Remote US · Posted 5 h ago</Text>
          </Stack>
          <Score variant="ring" value={94} tone="success" label="Fit score" />
        </Inline>
        <Reasons />
        <Text family="mono" size="xs" tone="muted">
          Found on Quillstack&apos;s careers board and one job board · merged into one posting
        </Text>
        <Inline gap="xs">
          <Button shortcut={<Kbd>A</Kbd>} aria-keyshortcuts="a">
            Approve
          </Button>
          <Button variant="secondary">Pass</Button>
          <Button variant="secondary" shortcut={<Kbd>F</Kbd>} aria-keyshortcuts="f">
            Flag
          </Button>
          <Button variant="ghost" shortcut={<Kbd>S</Kbd>} aria-keyshortcuts="s">
            Snooze
          </Button>
        </Inline>
      </Stack>
    </Card>
  ),
};

/** The compact form inside a card: `size="sm"` with the dashed `divider`. */
export const Compact: Story = {
  render: () => (
    <Card style={{ maxWidth: 360 }}>
      <Stack gap="xs">
        <Inline gap="sm" align="start" wrap={false}>
          <Score value={88} size="md" caption="fit" tone="success" label="Fit score" />
          <Stack gap="3xs">
            <Text weight="semibold">Principal Engineer, Web Platform</Text>
            <Text family="mono" size="xs" tone="muted">
              Fernpoint Health · 11 h
            </Text>
          </Stack>
        </Inline>
        <ReasonList tone="for" size="sm" divider aria-label="Why it fits">
          <ReasonList.Item>
            <strong>Platform</strong> team owns the component library
          </ReasonList.Item>
          <ReasonList.Item>Remote across the US</ReasonList.Item>
        </ReasonList>
        <ReasonList tone="gap" size="sm" aria-label="Watch for">
          <ReasonList.Item>Healthcare compliance work you haven&apos;t done before</ReasonList.Item>
        </ReasonList>
      </Stack>
    </Card>
  ),
};

export const Dark: Story = {
  render: () => (
    <DarkTheme>
      <Reasons />
    </DarkTheme>
  ),
};
