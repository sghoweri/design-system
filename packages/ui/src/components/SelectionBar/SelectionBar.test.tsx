import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { SelectionBar } from './SelectionBar';
import { Button } from '../Button/Button';
import { Toolbar } from '../Toolbar/Toolbar';
import { expectNoA11yViolations } from '../../../test/axe';

function Example({ initial = 0 }: { initial?: number }) {
  const [count, setCount] = useState(initial);
  return (
    <>
      <button type="button" onClick={() => setCount((n) => n + 1)}>
        Select one more
      </button>
      <SelectionBar count={count} onClear={() => setCount(0)}>
        <Toolbar.Button render={<Button variant="secondary" size="sm" />} onClick={() => setCount(0)}>
          Close {count}
        </Toolbar.Button>
        <Toolbar.Button render={<Button variant="secondary" size="sm" />} disabled>
          Reopen 0 of {count}
        </Toolbar.Button>
      </SelectionBar>
    </>
  );
}

describe('SelectionBar', () => {
  it('stays hidden and silent with nothing selected', () => {
    render(<Example />);
    expect(screen.queryByRole('toolbar')).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('');
  });

  it('shows the count, the actions and Clear as one named toolbar, and announces the count; no axe violations', async () => {
    const user = userEvent.setup();
    const { container } = render(<Example />);
    await user.click(screen.getByRole('button', { name: 'Select one more' }));
    await user.click(screen.getByRole('button', { name: 'Select one more' }));
    const bar = screen.getByRole('toolbar', { name: 'Bulk actions' });
    expect(bar).toHaveTextContent('2 selected');
    expect(screen.getByRole('status')).toHaveTextContent('2 selected');
    expect(screen.getByRole('button', { name: 'Close 2' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Reopen 0 of 2' })).toHaveAttribute('aria-disabled', 'true');
    await expectNoA11yViolations(container);
  });

  it('Clear clears, announces it, and returns focus to where it came from', async () => {
    const user = userEvent.setup();
    render(<Example />);
    const opener = screen.getByRole('button', { name: 'Select one more' });
    await user.click(opener);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Close 1' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(opener).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent('Selection cleared');
    // It fades out still showing the last count, then leaves the DOM.
    expect(screen.getByRole('toolbar').parentElement).not.toHaveAttribute('data-open');
    await waitFor(() => expect(screen.queryByRole('toolbar')).toBeNull());
  });

  it('takes its labels, and leaves a spacer in the flow while it shows', () => {
    const { container } = render(
      <SelectionBar
        count={3}
        onClear={() => undefined}
        aria-label="Application actions"
        countLabel={(n) => `${n} applications`}
        clearLabel="Deselect"
      />,
    );
    expect(screen.getByRole('toolbar', { name: 'Application actions' })).toHaveTextContent('3 applications');
    expect(screen.getByRole('button', { name: 'Deselect' })).toBeInTheDocument();
    expect(screen.getByRole('toolbar').parentElement).toHaveAttribute('data-open');
    expect(container.querySelector('.sc-selection-bar__spacer')).toHaveAttribute('aria-hidden', 'true');
  });
});
