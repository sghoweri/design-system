import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo, useState } from 'react';
import { Table, type TableSortDirection } from './Table';
import { Badge } from '../Badge/Badge';
import { Text } from '../Text/Text';
import { DarkTheme } from '../../stories/helpers';

type Row = {
  role: string;
  company: string;
  status: string;
  tone: 'success' | 'neutral' | 'info' | 'warning' | 'danger';
  score: number;
  days: number;
};

const rows: Row[] = [
  {
    role: 'Senior Design Systems Engineer',
    company: 'Linear',
    status: 'Interview',
    tone: 'success',
    score: 94,
    days: 3,
  },
  {
    role: 'Staff Frontend Engineer',
    company: 'Vercel',
    status: 'Applied',
    tone: 'neutral',
    score: 88,
    days: 5,
  },
  { role: 'Design Engineer', company: 'Figma', status: 'Screening', tone: 'info', score: 86, days: 1 },
  { role: 'Lead UI Engineer', company: 'Stripe', status: 'Follow up', tone: 'warning', score: 81, days: 9 },
  {
    role: 'Principal Frontend Architect',
    company: 'Shopify',
    status: 'Rejected',
    tone: 'danger',
    score: 77,
    days: 14,
  },
];

type SortKey = 'role' | 'company' | 'score' | 'days';

function SortableTable() {
  const [sort, setSort] = useState<{ key: SortKey; direction: Exclude<TableSortDirection, 'none'> }>({
    key: 'score',
    direction: 'descending',
  });
  const sorted = useMemo(() => {
    const sign = sort.direction === 'ascending' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const x = a[sort.key];
      const y = b[sort.key];
      return (
        (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y))) * sign
      );
    });
  }, [sort]);
  const header = (key: SortKey, label: string, numeric = false) => (
    <Table.Header
      sortable
      numeric={numeric}
      sortDirection={sort.key === key ? sort.direction : 'none'}
      onSort={(direction) => setSort({ key, direction })}
    >
      {label}
    </Table.Header>
  );
  return (
    <Table.Root>
      <Table.Caption>
        Sorted by {sort.key}, {sort.direction}. The table is controlled: the page owns the order.
      </Table.Caption>
      <Table.Head>
        <Table.Row>
          {header('role', 'Role')}
          {header('company', 'Company')}
          <Table.Header>Status</Table.Header>
          {header('score', 'Score', true)}
          {header('days', 'Days', true)}
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {sorted.map((row) => (
          <Table.Row key={row.role}>
            <Table.Header scope="row">{row.role}</Table.Header>
            <Table.Cell>{row.company}</Table.Cell>
            <Table.Cell>
              <Badge tone={row.tone} size="sm">
                {row.status}
              </Badge>
            </Table.Cell>
            <Table.Cell numeric>{row.score}</Table.Cell>
            <Table.Cell numeric>{row.days}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

const meta: Meta<typeof Table.Root> = {
  title: 'Components/Table/Sorting',
  component: Table.Root,
};
export default meta;
type Story = StoryObj<typeof meta>;

/** `sortable` headers become buttons; the sorted column carries `aria-sort` and an accent arrow. Click again to flip. */
export const Sortable: Story = { render: () => <SortableTable /> };

export const Dark: Story = {
  name: 'Dark theme',
  render: () => (
    <DarkTheme>
      <SortableTable />
      <Text tone="muted" size="xs" style={{ marginBlockStart: 'var(--sc-spacing-sm)' }}>
        Hover a header to preview its arrow.
      </Text>
    </DarkTheme>
  ),
};
