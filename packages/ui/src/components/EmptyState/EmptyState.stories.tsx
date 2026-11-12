import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmptyState } from './EmptyState';
import { Button } from '../Button/Button';
import { Card } from '../Card/Card';
import { Stack } from '../Stack/Stack';
import { Table } from '../Table/Table';
import { InboxIcon, PlusIcon, SearchIcon } from '../../icons/icons.gen';
import { Compact, DarkTheme } from '../../stories/helpers';

const meta: Meta<typeof EmptyState> = {
  title: 'Components/EmptyState',
  component: EmptyState,
  args: {
    title: 'No applications yet',
    description: 'Postings you apply to show up here, with their stage and the last reply.',
    size: 'md',
  },
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md'] },
    headingLevel: { control: 'select', options: [undefined, 1, 2, 3, 4, 5, 6] },
    icon: { control: false },
  },
  decorators: [(Story) => <div style={{ maxWidth: 640 }}>{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { icon: <InboxIcon /> },
  render: (args) => (
    <EmptyState {...args}>
      <Button iconStart={<PlusIcon />}>Add a job</Button>
      <Button variant="ghost">Import from LinkedIn</Button>
    </EmptyState>
  ),
};

/** `size="sm"` inside a Card or a table body; no icon when the context already says what the region is. */
export const Small: Story = {
  name: 'Small, inside a Card and a Table',
  render: () => (
    <Stack gap="md">
      <Card padding="none">
        <EmptyState
          size="sm"
          icon={<SearchIcon />}
          title="No postings match"
          description="Try fewer filters."
        >
          <Button variant="secondary" size="sm">
            Clear filters
          </Button>
        </EmptyState>
      </Card>
      <Table.Root>
        <Table.Head>
          <Table.Row>
            <Table.Header>Company</Table.Header>
            <Table.Header>Stage</Table.Header>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell colSpan={2}>
              <EmptyState size="sm" title="Nothing in this stage" />
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
    </Stack>
  ),
};

/**
 * `headingLevel` when the empty state stands in for the view's content, so the view still has a heading in
 * the outline. The title renders as `h2` here and looks the same.
 */
export const AsTheViewHeading: Story = {
  name: 'As the view heading',
  render: () => (
    <EmptyState
      as="section"
      headingLevel={2}
      icon={<InboxIcon />}
      title="Your inbox is clear"
      description="New postings land here after the next sweep."
    >
      <Button variant="secondary">Run a sweep now</Button>
    </EmptyState>
  ),
};

export const Dark: Story = {
  name: 'Dark theme',
  render: () => (
    <DarkTheme>
      <EmptyState
        icon={<InboxIcon />}
        title="No applications yet"
        description="Postings you apply to show up here."
      >
        <Button iconStart={<PlusIcon />}>Add a job</Button>
      </EmptyState>
    </DarkTheme>
  ),
};

export const CompactDensity: Story = {
  name: 'Compact density',
  render: () => (
    <Compact>
      <EmptyState
        size="sm"
        icon={<InboxIcon />}
        title="No applications yet"
        description="Postings you apply to show up here."
      >
        <Button size="sm">Add a job</Button>
      </EmptyState>
    </Compact>
  ),
};
