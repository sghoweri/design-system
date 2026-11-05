import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Disclosure } from './Disclosure';
import { expectNoA11yViolations } from '../../../test/axe';

describe('Disclosure', () => {
  it('is a closed details with a summary; clicking opens it and reports the change', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { container } = render(
      <Disclosure summary="Show full description" summaryOpen="Show less" onOpenChange={onOpenChange}>
        <p>The whole description.</p>
      </Disclosure>,
    );
    const details = container.querySelector('details')!;
    expect(details).not.toHaveAttribute('open');
    const summary = screen.getByText('Show full description').closest('summary')!;
    await user.click(summary);
    await waitFor(() => expect(details).toHaveAttribute('open'));
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(screen.getByText('Show less')).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it('starts open with defaultOpen and passes previewLines as a custom property', () => {
    const { container } = render(
      <Disclosure summary="More" defaultOpen previewLines={2}>
        <p>Text</p>
      </Disclosure>,
    );
    const details = container.querySelector('details')!;
    expect(details).toHaveAttribute('open');
    expect(details).toHaveAttribute('data-preview');
    expect(details).toHaveAttribute('data-summary-position', 'end');
    expect(details.style.getPropertyValue('--_lines')).toBe('2');
  });

  it('follows a controlled open prop', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen((o) => !o)}>Toggle</button>
          <Disclosure summary="Details" open={open} onOpenChange={setOpen}>
            <p>Body</p>
          </Disclosure>
        </>
      );
    }
    const { container } = render(<Controlled />);
    const details = container.querySelector('details')!;
    await user.click(screen.getByRole('button', { name: 'Toggle' }));
    await waitFor(() => expect(details).toHaveAttribute('open'));
    await user.click(screen.getByText('Details').closest('summary')!);
    await waitFor(() => expect(details).not.toHaveAttribute('open'));
  });
});
