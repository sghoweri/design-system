import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from './Skeleton';
import { Card } from '../Card/Card';
import { Inline } from '../Inline/Inline';
import { Stack } from '../Stack/Stack';
import { Table } from '../Table/Table';
import { Compact, DarkTheme } from '../../stories/helpers';

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
  args: { variant: 'text', lines: 1, still: false },
  argTypes: { variant: { control: 'radio', options: ['text', 'rect', 'circle'] } },
  decorators: [(Story) => <div style={{ maxWidth: 480 }}>{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

function JobCardSkeleton() {
  return (
    <Card aria-busy="true" aria-label="Loading application">
      <Stack gap="sm">
        <Inline gap="sm" wrap={false}>
          <Skeleton variant="circle" width={40} />
          <Stack gap="2xs" style={{ flex: 1 }}>
            <Skeleton width="60%" />
            <Skeleton width="40%" style={{ fontSize: 'var(--sc-font-size-xs)' }} />
          </Stack>
        </Inline>
        <Skeleton lines={3} />
        <Skeleton variant="rect" height={120} />
      </Stack>
    </Card>
  );
}

/** Shapes composed into the layout they stand in for; the Card carries `aria-busy` so the state is announced once. */
export const Composed: Story = {
  name: 'Card and table rows',
  render: () => (
    <Stack gap="md">
      <JobCardSkeleton />
      <Table.Root aria-busy="true">
        <Table.Head>
          <Table.Row>
            <Table.Header>Company</Table.Header>
            <Table.Header>Stage</Table.Header>
            <Table.Header numeric>Score</Table.Header>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {[0, 1, 2].map((i) => (
            <Table.Row key={i}>
              <Table.Cell>
                <Skeleton width="70%" />
              </Table.Cell>
              <Table.Cell>
                <Skeleton width={72} />
              </Table.Cell>
              <Table.Cell numeric>
                <Skeleton width={32} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Stack>
  ),
};

export const Variants: Story = {
  render: () => (
    <Stack gap="md">
      <Skeleton />
      <Skeleton lines={3} />
      <Skeleton variant="rect" />
      <Inline gap="sm">
        <Skeleton variant="circle" width={24} />
        <Skeleton variant="circle" />
        <Skeleton variant="circle" width={56} />
      </Inline>
      <Skeleton still width="50%" />
    </Stack>
  ),
};

export const Dark: Story = {
  name: 'Dark theme',
  render: () => (
    <DarkTheme>
      <JobCardSkeleton />
    </DarkTheme>
  ),
};

export const CompactDensity: Story = {
  name: 'Compact density',
  render: () => (
    <Compact>
      <JobCardSkeleton />
    </Compact>
  ),
};
