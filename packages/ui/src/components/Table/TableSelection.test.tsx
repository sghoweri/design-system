import '@testing-library/jest-dom/vitest';
import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Table } from './Table';
import { useRowSelection } from './useRowSelection';
import { Input } from '../Input/Input';
import { expectNoA11yViolations } from '../../../test/axe';

const ROWS = [
  { id: 'ts', company: 'Northwind', title: 'Front End Engineer' },
  { id: 'li', company: 'Linear', title: 'Design Engineer' },
  { id: 'fi', company: 'Figma', title: 'Staff Frontend Engineer' },
  { id: 've', company: 'Vercel', title: 'Senior Frontend Engineer' },
  { id: 'st', company: 'Stripe', title: 'UI Engineer' },
];

const onOpen = vi.fn();

function Example({ rows = ROWS, withField = false }: { rows?: typeof ROWS; withField?: boolean }) {
  const selection = useRowSelection(rows.map((r) => r.id));
  return (
    <>
      <button type="button">Outside</button>
      <output data-testid="selected" data-anchor={selection.anchor ?? ''}>
        {selection.selectedIds.join(',')}
      </output>
      <Table.Root selection={selection} aria-label="Applications">
        <Table.Head>
          <Table.Row>
            <Table.SelectionHeader />
            <Table.Header>Company</Table.Header>
            <Table.Header>Title</Table.Header>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {rows.map((r) => (
            <Table.Row key={r.id} selectionId={r.id} interactive onClick={() => onOpen(r.id)}>
              <Table.SelectionCell label={`Select ${r.company}, ${r.title}`} />
              <Table.Cell>
                <a href={`#${r.id}`}>{r.company}</a>
              </Table.Cell>
              <Table.Cell>
                {withField && r.id === 'ts' ? <Input label="Note" hideLabel /> : r.title}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </>
  );
}

const box = (company: string) => screen.getByRole('checkbox', { name: new RegExp(`^Select ${company},`) });
const all = () => screen.getByRole('checkbox', { name: 'Select all rows' });
const rowOf = (company: string) => screen.getByRole('link', { name: company }).closest('tr')!;
const selected = () => screen.getByTestId('selected').textContent!.split(',').filter(Boolean);
const anchor = () => screen.getByTestId('selected').dataset['anchor'];

beforeEach(() => onOpen.mockClear());

describe('Table selection column', () => {
  it('labels each row checkbox by the row, and the header checkbox as select all; no axe violations', async () => {
    const { container } = render(<Example />);
    expect(box('Northwind')).toHaveAccessibleName('Select Northwind, Front End Engineer');
    expect(all()).toHaveAttribute('aria-checked', 'false');
    expect(rowOf('Northwind')).toHaveAttribute('aria-selected', 'false');
    await userEvent.click(box('Linear'));
    await expectNoA11yViolations(container);
  });

  it('a checkbox click toggles its row and marks it selected; the header goes mixed, then checked', async () => {
    render(<Example />);
    await userEvent.click(box('Linear'));
    expect(box('Linear')).toHaveAttribute('aria-checked', 'true');
    expect(rowOf('Linear')).toHaveAttribute('data-selected');
    expect(rowOf('Linear')).toHaveAttribute('aria-selected', 'true');
    expect(all()).toHaveAttribute('aria-checked', 'mixed');
    expect(onOpen).not.toHaveBeenCalled();
    await userEvent.click(all());
    expect(all()).toHaveAttribute('aria-checked', 'true');
    expect(selected()).toEqual(['ts', 'li', 'fi', 've', 'st']);
    await userEvent.click(all());
    expect(selected()).toEqual([]);
  });

  it('a click anywhere in the checkbox cell toggles, and never opens the row', async () => {
    render(<Example />);
    await userEvent.click(box('Figma').closest('td')!);
    expect(selected()).toEqual(['fi']);
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('Shift+click on a checkbox extends from the last toggled row, inclusive', async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(box('Linear'));
    await user.keyboard('{Shift>}');
    await user.click(box('Vercel'));
    await user.keyboard('{/Shift}');
    expect(selected()).toEqual(['li', 'fi', 've']);
    expect(anchor()).toBe('ve');
  });

  it('Shift+click on a row extends the range; Cmd/Ctrl+click toggles; neither opens the row', async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(box('Northwind'));
    await user.keyboard('{Shift>}');
    await user.click(rowOf('Figma').cells[2]!);
    await user.keyboard('{/Shift}');
    expect(selected()).toEqual(['ts', 'li', 'fi']);
    await user.keyboard('{Meta>}');
    await user.click(rowOf('Stripe').cells[2]!);
    await user.keyboard('{/Meta}');
    await user.keyboard('{Control>}');
    await user.click(rowOf('Linear').cells[2]!);
    await user.keyboard('{/Control}');
    expect(selected()).toEqual(['ts', 'fi', 'st']);
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('a plain row click reaches onClick; a modifier click on a link inside the row is left to the link', async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(rowOf('Stripe').cells[2]!);
    expect(onOpen).toHaveBeenCalledWith('st');
    await user.keyboard('{Meta>}');
    await user.click(screen.getByRole('link', { name: 'Vercel' }));
    await user.keyboard('{/Meta}');
    expect(selected()).toEqual([]);
  });

  it('Space toggles the focused row checkbox; Shift+Space extends the range', async () => {
    const user = userEvent.setup();
    render(<Example />);
    box('Northwind').focus();
    await user.keyboard(' ');
    expect(selected()).toEqual(['ts']);
    box('Figma').focus();
    await user.keyboard('{Shift>} {/Shift}');
    expect(selected()).toEqual(['ts', 'li', 'fi']);
    await user.keyboard(' ');
    expect(selected()).toEqual(['ts', 'li']);
  });

  it('Cmd/Ctrl+A inside the table selects every row; Escape clears', async () => {
    const user = userEvent.setup();
    render(<Example />);
    box('Linear').focus();
    await user.keyboard('{Meta>}a{/Meta}');
    expect(selected()).toHaveLength(5);
    await user.keyboard('{Escape}');
    expect(selected()).toEqual([]);
    box('Linear').focus();
    await user.keyboard('{Control>}a{/Control}');
    expect(selected()).toHaveLength(5);
  });

  it('does not take Cmd/Ctrl+A outside the table or inside a text field in it', async () => {
    const user = userEvent.setup();
    render(<Example withField />);
    screen.getByRole('button', { name: 'Outside' }).focus();
    await user.keyboard('{Control>}a{/Control}');
    expect(selected()).toEqual([]);
    screen.getByRole('textbox', { name: 'Note' }).focus();
    await user.keyboard('{Control>}a{/Control}');
    expect(selected()).toEqual([]);
  });

  it('drops rows that disappear (filter) and keeps the rest', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Example />);
    await user.click(box('Northwind'));
    await user.click(box('Figma'));
    rerender(<Example rows={ROWS.filter((r) => r.id !== 'fi')} />);
    expect(selected()).toEqual(['ts']);
    expect(all()).toHaveAttribute('aria-checked', 'mixed');
  });

  it('disables the header checkbox when there are no rows', () => {
    render(<Example rows={[]} />);
    expect(all()).toHaveAttribute('aria-disabled', 'true');
    expect(all().closest('th')).toHaveAttribute('data-disabled');
  });

  it('throws a clear error when the parts are used without a selection', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() =>
      render(
        <Table.Root>
          <Table.Head>
            <Table.Row>
              <Table.SelectionHeader />
            </Table.Row>
          </Table.Head>
        </Table.Root>,
      ),
    ).toThrow(/Table.Root selection/);
    vi.restoreAllMocks();
  });
});

describe('useRowSelection', () => {
  it('syncs to new ids in the same render, so a removed row is never counted', () => {
    const counts: number[] = [];
    const { result, rerender } = renderHook(
      ({ ids }) => {
        const s = useRowSelection(ids);
        counts.push(s.count);
        return s;
      },
      { initialProps: { ids: ['a', 'b', 'c'] } },
    );
    act(() => result.current.selectAll());
    expect(result.current.headerState).toBe('all');
    counts.length = 0;
    rerender({ ids: ['a', 'c'] });
    expect(counts.every((n) => n === 2)).toBe(true);
    expect(result.current.selectedIds).toEqual(['a', 'c']);
    expect(result.current.headerState).toBe('all');
  });

  it('keeps the same object while nothing changes (new array, same ids)', () => {
    const { result, rerender } = renderHook(({ ids }) => useRowSelection(ids), {
      initialProps: { ids: ['a', 'b'] },
    });
    const first = result.current;
    rerender({ ids: ['a', 'b'] });
    expect(result.current).toBe(first);
  });

  it('reports range state through toggleRange with the visible order after a sort', () => {
    function useSorted() {
      const [ids, setIds] = useState(['a', 'b', 'c', 'd']);
      return { s: useRowSelection(ids), setIds };
    }
    const { result } = renderHook(useSorted);
    act(() => result.current.s.toggle('d'));
    act(() => result.current.setIds(['d', 'c', 'b', 'a']));
    act(() => result.current.s.toggleRange('b'));
    expect(result.current.s.selectedIds).toEqual(['d', 'c', 'b']);
  });
});
