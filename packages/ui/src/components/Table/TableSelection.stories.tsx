import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo, useState } from 'react';
import { Table } from './Table';
import { useRowSelection } from './useRowSelection';
import { Badge, type BadgeTone } from '../Badge/Badge';
import { Button } from '../Button/Button';
import { Kbd } from '../Kbd/Kbd';
import { SelectionBar } from '../SelectionBar/SelectionBar';
import { Stack } from '../Stack/Stack';
import { Text } from '../Text/Text';
import { Toast, useToast } from '../Toast/Toast';
import { Toolbar } from '../Toolbar/Toolbar';
import { DarkTheme } from '../../stories/helpers';

type Status = 'Applied' | 'Screen' | 'Interview' | 'Closed' | 'Rejected';
type Row = { id: string; company: string; role: string; status: Status; days: number };

const TONE: Record<Status, BadgeTone> = {
  Applied: 'neutral',
  Screen: 'info',
  Interview: 'success',
  Closed: 'neutral',
  Rejected: 'danger',
};
const COMPANIES = [
  'Northwind',
  'Globex',
  'Initech',
  'Umbrella',
  'Hooli',
  'Soylent',
  'Vandelay',
  'Wonka',
  'Stark',
  'Tyrell',
];
const ROLES = ['Design Systems Engineer', 'Staff Frontend Engineer', 'UI Engineer'];
const STATUSES: Status[] = ['Applied', 'Screen', 'Interview', 'Applied', 'Closed', 'Rejected'];

/** Thirty made-up rows; no real data. */
const ROWS: Row[] = Array.from({ length: 30 }, (_, i) => ({
  id: `row-${i + 1}`,
  company: COMPANIES[i % COMPANIES.length]!,
  role: ROLES[i % ROLES.length]!,
  status: STATUSES[i % STATUSES.length]!,
  days: (i * 7) % 23,
}));

const isClosed = (s: Status) => s === 'Closed' || s === 'Rejected';

function KeyboardHelp() {
  return (
    <Text as="p" size="xs" tone="muted">
      Click a checkbox, or <Kbd>Space</Kbd> on a focused one, to toggle a row. <Kbd>Shift</Kbd> + click (on a
      checkbox or a row) or <Kbd>Shift</Kbd> + <Kbd>Space</Kbd> extends from the last toggled row.{' '}
      <Kbd>⌘</Kbd>/<Kbd>Ctrl</Kbd> + click on a row toggles it without opening it. With focus in the table,{' '}
      <Kbd.Group label="Command A">
        <Kbd>⌘</Kbd>
        <Kbd>A</Kbd>
      </Kbd.Group>{' '}
      selects every row and <Kbd>Esc</Kbd> clears.
    </Text>
  );
}

function ApplicationsTable() {
  const [rows, setRows] = useState(ROWS);
  const [opened, setOpened] = useState<string | null>(null);
  const toast = useToast();
  const selection = useRowSelection(useMemo(() => rows.map((r) => r.id), [rows]));
  const picked = rows.filter((r) => selection.isSelected(r.id));
  const closable = picked.filter((r) => r.status !== 'Closed');
  const reopenable = picked.filter((r) => isClosed(r.status));
  const n = selection.count;
  const label = (verb: string, k: number) => (k === n ? `${verb} ${k}` : `${verb} ${k} of ${n}`);

  const apply = (verb: string, targets: Row[], to: (r: Row) => Status) => {
    const before = new Map(targets.map((r) => [r.id, r.status]));
    setRows((rs) => rs.map((r) => (before.has(r.id) ? { ...r, status: to(r) } : r)));
    selection.clear();
    toast.add({
      title: `${verb} ${targets.length} application${targets.length === 1 ? '' : 's'}`,
      action: {
        label: 'Undo',
        onClick: () =>
          setRows((rs) => rs.map((r) => (before.has(r.id) ? { ...r, status: before.get(r.id)! } : r))),
      },
    });
  };

  return (
    <Stack gap="sm">
      <KeyboardHelp />
      <Table.Root selection={selection} density="compact" aria-label="Applications" stickyHeader>
        <Table.Head>
          <Table.Row>
            <Table.SelectionHeader />
            <Table.Header>Company</Table.Header>
            <Table.Header>Role</Table.Header>
            <Table.Header>Status</Table.Header>
            <Table.Header numeric>Days quiet</Table.Header>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {rows.map((r) => (
            <Table.Row
              key={r.id}
              selectionId={r.id}
              interactive
              onClick={(event) => {
                if (!(event.target instanceof Element && event.target.closest('a, button'))) setOpened(r.id);
              }}
            >
              <Table.SelectionCell label={`Select ${r.company}, ${r.role}`} />
              <Table.Cell nowrap>
                <a href={`#${r.id}`} onClick={(event) => (event.preventDefault(), setOpened(r.id))}>
                  {r.company}
                </a>
              </Table.Cell>
              <Table.Cell>{r.role}</Table.Cell>
              <Table.Cell>
                <Badge tone={TONE[r.status]} size="sm" dot>
                  {r.status}
                </Badge>
              </Table.Cell>
              <Table.Cell numeric>{r.days}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <Text as="p" size="xs" tone="muted" aria-live="polite">
        {opened ? `A plain click opens the row: ${rows.find((r) => r.id === opened)?.company}.` : ' '}
      </Text>
      <SelectionBar count={n} onClear={selection.clear} aria-label="Application actions">
        <Toolbar.Button
          render={<Button variant="secondary" size="sm" />}
          disabled={closable.length === 0}
          onClick={() => apply('Closed', closable, () => 'Closed')}
        >
          {label('Close', closable.length)}
        </Toolbar.Button>
        <Toolbar.Button
          render={<Button variant="secondary" size="sm" />}
          disabled={reopenable.length === 0}
          onClick={() => apply('Reopened', reopenable, () => 'Applied')}
        >
          {label('Reopen', reopenable.length)}
        </Toolbar.Button>
      </SelectionBar>
    </Stack>
  );
}

const meta: Meta<typeof Table.Root> = {
  title: 'Components/Table/Selection',
  component: Table.Root,
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * `useRowSelection(ids)` + `Table.Root selection`, a `Table.SelectionHeader` and a `Table.SelectionCell` per row,
 * and a sticky `SelectionBar` whose actions say how many selected rows they apply to. An action clears the
 * selection and shows a Toast with Undo.
 */
export const BulkActions: Story = {
  name: 'Bulk actions (30 rows)',
  render: () => (
    <Toast.Provider>
      <ApplicationsTable />
    </Toast.Provider>
  ),
};

export const Dark: Story = {
  name: 'Dark theme',
  render: () => (
    <DarkTheme>
      <Toast.Provider>
        <ApplicationsTable />
      </Toast.Provider>
    </DarkTheme>
  ),
};
