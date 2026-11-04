import { render, screen } from '@testing-library/react';
import { Table } from './Table';
import { Badge } from '../Badge/Badge';
import { expectNoA11yViolations } from '../../../test/axe';

function Example(props: Partial<React.ComponentProps<typeof Table.Root>>) {
  return (
    <Table.Root {...props}>
      <Table.Caption>Applications this week</Table.Caption>
      <Table.Head>
        <Table.Row>
          <Table.Header width="40%">Role</Table.Header>
          <Table.Header>Status</Table.Header>
          <Table.Header numeric>Score</Table.Header>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        <Table.Row selected>
          <Table.Header scope="row" truncate>
            Senior Design Systems Engineer
          </Table.Header>
          <Table.Cell>
            <Badge tone="success" size="sm">
              Interview
            </Badge>
          </Table.Cell>
          <Table.Cell numeric>94</Table.Cell>
        </Table.Row>
        <Table.Row interactive>
          <Table.Header scope="row">Staff Frontend Engineer</Table.Header>
          <Table.Cell>Applied</Table.Cell>
          <Table.Cell numeric>88</Table.Cell>
        </Table.Row>
      </Table.Body>
      <Table.Foot>
        <Table.Row>
          <Table.Cell colSpan={2}>2 roles</Table.Cell>
          <Table.Cell numeric>91 avg</Table.Cell>
        </Table.Row>
      </Table.Foot>
    </Table.Root>
  );
}

describe('Table', () => {
  it('is a native table with caption, column and row headers, in a scrolling wrapper', async () => {
    const { container } = render(<Example />);
    const table = screen.getByRole('table', { name: 'Applications this week' });
    expect(table).toHaveClass('sc-table');
    expect(table).toHaveAttribute('data-divided');
    expect(table).toHaveAttribute('data-layout', 'auto');
    expect(table.parentElement).toHaveClass('sc-table-wrap');
    expect(screen.getAllByRole('columnheader')).toHaveLength(3);
    expect(screen.getByRole('columnheader', { name: 'Role' })).toHaveStyle({ inlineSize: '40%' });
    expect(screen.getByRole('columnheader', { name: 'Score' })).toHaveAttribute('data-align', 'end');
    expect(screen.getAllByRole('rowheader')).toHaveLength(2);
    expect(screen.getByRole('rowheader', { name: 'Senior Design Systems Engineer' })).toHaveAttribute(
      'data-truncate',
    );
    expect(screen.getByRole('cell', { name: '94' })).toHaveAttribute('data-numeric');
    await expectNoA11yViolations(container);
  });

  it('marks selected and interactive rows', () => {
    render(<Example />);
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveAttribute('data-selected');
    expect(rows[1]).toHaveAttribute('aria-selected', 'true');
    expect(rows[2]).toHaveAttribute('data-interactive');
  });

  it('takes sticky header, max height, density and layout', () => {
    render(<Example stickyHeader maxHeight="240px" density="compact" layout="fixed" divided={false} />);
    const table = screen.getByRole('table');
    const wrap = table.parentElement!;
    expect(wrap).toHaveAttribute('data-sticky-header');
    expect(wrap).toHaveAttribute('data-scroll');
    expect(wrap).toHaveStyle({ maxBlockSize: '240px' });
    expect(table).toHaveAttribute('data-density', 'compact');
    expect(table).toHaveAttribute('data-layout', 'fixed');
    expect(table).not.toHaveAttribute('data-divided');
  });
});
