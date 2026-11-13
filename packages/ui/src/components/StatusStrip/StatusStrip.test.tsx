import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatusStrip, type StatusStripItem } from './StatusStrip';
import { expectNoA11yViolations } from '../../../test/axe';

const items: StatusStripItem[] = [
  { id: 'a', tone: 'success', label: 'Finished · Mon 7:00 AM · 18 new roles', href: '#run-a' },
  { id: 'b', tone: 'warning', label: 'Finished with warnings · Mon 12:00 PM', href: '#run-b' },
  { id: 'c', tone: 'danger', label: "Failed · Mon 5:00 PM · Greenhouse didn't answer", href: '#run-c' },
  { id: 'd', tone: 'neutral', label: 'Skipped · Tue 7:00 AM · paused', href: '#run-d' },
  { id: 'e', tone: 'running', label: 'Running · Tue 12:00 PM', href: '#run-e' },
];

describe('StatusStrip', () => {
  it('is a named ordered list whose linked cells are named by their labels, newest last', async () => {
    const { container } = render(<StatusStrip aria-label="Last 5 sweeps, oldest first" items={items} />);
    const list = screen.getByRole('list', { name: 'Last 5 sweeps, oldest first' });
    expect(list.tagName).toBe('OL');
    expect(list).toHaveClass('sc-status-strip');
    const cells = within(list).getAllByRole('listitem');
    expect(cells).toHaveLength(5);
    const links = within(list).getAllByRole('link');
    expect(links.map((l) => l.getAttribute('href'))).toEqual([
      '#run-a',
      '#run-b',
      '#run-c',
      '#run-d',
      '#run-e',
    ]);
    expect(
      screen.getByRole('link', { name: "Failed · Mon 5:00 PM · Greenhouse didn't answer" }),
    ).toHaveAttribute('data-tone', 'danger');
    expect(within(cells[4]!).getByRole('link')).toHaveAccessibleName('Running · Tue 12:00 PM');
    await expectNoA11yViolations(container);
  });

  it('gives each tone a shape: glyphs for warning, danger and running, none for success and neutral', () => {
    const { container } = render(<StatusStrip aria-label="Runs" items={items} />);
    const glyph = (tone: string) =>
      container.querySelector(`.sc-status-strip__cell[data-tone='${tone}'] > .sc-status-strip__glyph`);
    expect(glyph('success')).toBeNull();
    expect(glyph('neutral')).toBeNull();
    for (const tone of ['warning', 'danger', 'running']) {
      expect(glyph(tone), tone).toHaveAttribute('aria-hidden', 'true');
    }
    expect(glyph('warning')?.innerHTML).not.toBe(glyph('danger')?.innerHTML);
  });

  it('without href a cell is a non-interactive item that still exposes its label', async () => {
    const { container } = render(
      <StatusStrip aria-label="Runs" items={items.map(({ href: _h, ...item }) => item)} />,
    );
    expect(screen.queryAllByRole('link')).toHaveLength(0);
    const cell = screen.getAllByRole('listitem')[2]!;
    expect(cell).toHaveTextContent("Failed · Mon 5:00 PM · Greenhouse didn't answer");
    expect(cell.querySelector('.sc-status-strip__cell')?.tagName).toBe('SPAN');
    expect(cell.querySelector('[tabindex]')).toBeNull();
    await expectNoA11yViolations(container);
  });

  it('a tooltip opens on keyboard focus and the link keeps its label as its name', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <StatusStrip
        aria-label="Runs"
        items={[{ ...items[2]!, tooltip: "Mon 5:00 PM · Greenhouse didn't answer" }, items[0]!]}
      />,
    );
    await user.tab();
    const link = screen.getByRole('link', { name: "Failed · Mon 5:00 PM · Greenhouse didn't answer" });
    expect(link).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent("Mon 5:00 PM · Greenhouse didn't answer");
    await expectNoA11yViolations(container);
  });

  it('a tap on a linked cell is not intercepted, so it navigates', () => {
    render(
      <StatusStrip aria-label="Runs" items={[{ ...items[0]!, tooltip: 'Mon 7:00 AM · 18 new roles' }]} />,
    );
    const link = screen.getByRole('link');
    let notPrevented = false;
    act(() => {
      fireEvent.pointerDown(link, { pointerType: 'touch' });
      fireEvent.pointerUp(link, { pointerType: 'touch' });
      notPrevented = fireEvent.click(link);
    });
    expect(notPrevented).toBe(true);
    expect(screen.queryByRole('tooltip')).toBeNull();
  });
});
