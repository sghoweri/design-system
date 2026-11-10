import { render, screen, waitFor } from '@testing-library/react';
import { useRef, useState } from 'react';
import userEvent from '@testing-library/user-event';
import { Popover } from './Popover';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { BroomIcon } from '../BroomIcon/BroomIcon';
import { expectNoA11yViolations } from '../../../test/axe';

function Example({
  arrow = false,
  onOpenChange,
}: {
  arrow?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <>
      <Popover.Root onOpenChange={onOpenChange}>
        <Popover.Trigger render={<IconButton label="Sweeps: running" dot="success" />}>
          <BroomIcon sweeping />
        </Popover.Trigger>
        <Popover.Content arrow={arrow} align="end">
          <Popover.Close />
          <Popover.Title>Sweeps</Popover.Title>
          <Popover.Description>Next sweep in 2 hours.</Popover.Description>
          <Button size="sm">Sweep now</Button>
        </Popover.Content>
      </Popover.Root>
      <button type="button">Outside</button>
    </>
  );
}

/** Opened from a row action, not a Popover.Trigger: controlled, positioned against the action button. */
function AnchoredExample() {
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLButtonElement>(null);
  return (
    <div data-testid="row">
      <button type="button" ref={anchor} onClick={() => setOpen(true)}>
        Row actions
      </button>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Content anchor={anchor} align="end">
          <Popover.Title>Correct this reason</Popover.Title>
        </Popover.Content>
      </Popover.Root>
    </div>
  );
}

describe('Popover', () => {
  it('renders a secondary Button trigger by default', () => {
    render(
      <Popover.Root>
        <Popover.Trigger>Legend</Popover.Trigger>
        <Popover.Content>Key</Popover.Content>
      </Popover.Root>,
    );
    const trigger = screen.getByRole('button', { name: 'Legend' });
    expect(trigger).toHaveClass('sc-button');
    expect(trigger).toHaveAttribute('data-variant', 'secondary');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens a labelled, described dialog from an IconButton with the system surface', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { baseElement } = render(<Example onOpenChange={onOpenChange} />);
    const trigger = screen.getByRole('button', { name: 'Sweeps: running' });
    expect(trigger).toHaveClass('sc-icon-button');
    await user.click(trigger);
    const popup = await screen.findByRole('dialog', { name: 'Sweeps' });
    expect(popup).toHaveClass('sc-popover');
    expect(popup).toHaveAccessibleDescription('Next sweep in 2 hours.');
    expect(popup.parentElement).toHaveClass('sc-popover__positioner');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    await expectNoA11yViolations(baseElement);
  });

  it('draws an arrow only when asked', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Example />);
    await user.click(screen.getByRole('button', { name: 'Sweeps: running' }));
    expect((await screen.findByRole('dialog')).querySelector('.sc-popover__arrow')).toBeNull();
    unmount();
    render(<Example arrow />);
    await user.click(screen.getByRole('button', { name: 'Sweeps: running' }));
    expect((await screen.findByRole('dialog')).querySelector('.sc-popover__arrow')).not.toBeNull();
  });

  it('closes on Escape (focus back to the trigger), on the ×, and on a click outside', async () => {
    const user = userEvent.setup();
    render(<Example />);
    const trigger = screen.getByRole('button', { name: 'Sweeps: running' });
    await user.click(trigger);
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(trigger).toHaveFocus();

    await user.click(trigger);
    await user.click(await screen.findByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

    await user.click(trigger);
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: 'Outside' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('positions against an `anchor` with no Trigger, portaled to the body, and closes through onOpenChange', async () => {
    const user = userEvent.setup();
    render(<AnchoredExample />);
    await user.click(screen.getByRole('button', { name: 'Row actions' }));
    const popup = await screen.findByRole('dialog', { name: 'Correct this reason' });
    expect(screen.getByTestId('row')).not.toContainElement(popup);
    // The portal container is a direct child of <body>, so nothing around the anchor can clip or shift it.
    const positioner = popup.parentElement;
    expect(positioner).toHaveClass('sc-popover__positioner');
    expect(positioner?.parentElement?.parentElement).toBe(document.body);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});
