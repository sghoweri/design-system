import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Disclosure } from './Disclosure';
import { Button } from '../Button/Button';
import { Card } from '../Card/Card';
import { Heading } from '../Heading/Heading';
import { Stack } from '../Stack/Stack';
import { Text } from '../Text/Text';
import { Compact, DarkTheme } from '../../stories/helpers';

const meta: Meta<typeof Disclosure> = {
  title: 'Components/Disclosure',
  component: Disclosure,
  args: { summary: 'Show full description', summaryOpen: 'Show less' },
  argTypes: { open: { control: false } },
  decorators: [(Story) => <div style={{ maxWidth: 520 }}>{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof meta>;

const description = (
  <Stack gap="sm">
    <Text>
      Northwind is hiring a Staff Frontend Engineer to own the design system that four product teams build on.
      You will set the component architecture, the token pipeline and the release process, and pair with
      product engineers to adopt it.
    </Text>
    <Text>
      The stack is React 19, TypeScript and CSS with custom properties; Storybook is the source of truth for
      every component. Remote across the US, with a quarterly week in Boston.
    </Text>
    <Text>
      Compensation is a base of $210,000 to $250,000 with equity and a 10% bonus target. The team is six
      engineers and a designer and ships weekly.
    </Text>
  </Stack>
);

export const Playground: Story = {
  args: { children: description },
};

/** `previewLines` keeps the first lines visible and fades them; the summary line sits under the preview. */
export const Preview: Story = {
  name: 'Preview of 3 lines',
  args: { children: description, previewLines: 3 },
};

export const Open: Story = {
  args: { children: description, defaultOpen: true, previewLines: 3 },
};

function Controlled() {
  const [open, setOpen] = useState(false);
  return (
    <Stack gap="sm">
      <Button variant="secondary" size="sm" onClick={() => setOpen((o) => !o)}>
        {open ? 'Collapse' : 'Expand'} from outside
      </Button>
      <Disclosure summary="Requirements" open={open} onOpenChange={setOpen}>
        <Text>Eight years of frontend work, two of them leading a design system.</Text>
      </Disclosure>
    </Stack>
  );
}

export const ControlledStory: Story = {
  name: 'Controlled',
  render: () => <Controlled />,
};

/** Sibling disclosures sharing a `name` are exclusive: opening one closes the others. */
export const Exclusive: Story = {
  render: () => (
    <Card padding="md">
      <Stack gap="sm">
        <Heading level={3} size="md">
          Application
        </Heading>
        <Disclosure name="app" summary="Cover letter" defaultOpen>
          <Text>Dear hiring team, …</Text>
        </Disclosure>
        <Disclosure name="app" summary="Notes">
          <Text>Recruiter said the team ships weekly.</Text>
        </Disclosure>
        <Disclosure name="app" summary="Timeline">
          <Text>Applied 2 Nov, screen 6 Nov.</Text>
        </Disclosure>
      </Stack>
    </Card>
  ),
};

export const Dark: Story = {
  name: 'Dark theme',
  render: () => (
    <DarkTheme>
      <Disclosure summary="Show full description" summaryOpen="Show less" previewLines={3}>
        {description}
      </Disclosure>
    </DarkTheme>
  ),
};

export const CompactDensity: Story = {
  name: 'Compact density',
  render: () => (
    <Compact>
      <Disclosure summary="Show full description" summaryOpen="Show less" previewLines={2}>
        {description}
      </Disclosure>
    </Compact>
  ),
};
