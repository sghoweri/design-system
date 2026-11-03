import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog } from './Dialog';
import { Button } from '../Button/Button';

function Example({
  dismissible = true,
  onOpenChange,
}: {
  dismissible?: boolean;
  onOpenChange?: (o: boolean) => void;
}) {
  return (
    <Dialog.Root dismissible={dismissible} onOpenChange={onOpenChange}>
      <Dialog.Trigger render={<Button variant="secondary" />}>Archive</Dialog.Trigger>
      <Dialog.Content size="sm">
        <Dialog.Close />
        <Dialog.Title>Archive 3 applications?</Dialog.Title>
        <Dialog.Description>They stay searchable.</Dialog.Description>
        <Dialog.Actions>
          <Dialog.Close render={<Button variant="secondary" />}>Cancel</Dialog.Close>
          <Dialog.Close render={<Button />}>Confirm</Dialog.Close>
        </Dialog.Actions>
      </Dialog.Content>
    </Dialog.Root>
  );
}

describe('Dialog', () => {
  it('is closed until the trigger is pressed, then is a labelled modal dialog', async () => {
    const user = userEvent.setup();
    render(<Example />);
    expect(screen.queryByRole('dialog')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Archive' }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName('Archive 3 applications?');
    expect(dialog).toHaveAccessibleDescription('They stay searchable.');
    expect(dialog).toHaveAttribute('data-size', 'sm');
  });

  it('moves focus inside on open and back to the trigger on close', async () => {
    const user = userEvent.setup();
    render(<Example />);
    const trigger = screen.getByRole('button', { name: 'Archive' });
    await user.click(trigger);
    const dialog = await screen.findByRole('dialog');
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('closes on Escape and the corner close button', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} />);
    await user.click(screen.getByRole('button', { name: 'Archive' }));
    await screen.findByRole('dialog');
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(onOpenChange).toHaveBeenLastCalledWith(false);

    await user.click(screen.getByRole('button', { name: 'Archive' }));
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('ignores Escape when not dismissible', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Example dismissible={false} onOpenChange={onOpenChange} />);
    await user.click(screen.getByRole('button', { name: 'Archive' }));
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});
