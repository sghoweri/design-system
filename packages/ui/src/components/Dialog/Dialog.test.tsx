import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Dialog, type DialogCloseRequestReason } from './Dialog';
import { Button } from '../Button/Button';
import { Menu } from '../Menu/Menu';
import { Select } from '../Select/Select';
import { expectNoA11yViolations } from '../../../test/axe';

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

  it('has no axe violations open, and sheet is a data-variant on the same popup', async () => {
    const user = userEvent.setup();
    const { baseElement } = render(
      <Dialog.Root>
        <Dialog.Trigger render={<Button />}>Edit</Dialog.Trigger>
        <Dialog.Content variant="sheet" size="sm">
          <Dialog.Close />
          <Dialog.Title>Edit application</Dialog.Title>
          <Dialog.Description>Stage and notes.</Dialog.Description>
          <Dialog.Body>
            <p>Body</p>
          </Dialog.Body>
          <Dialog.Actions>
            <Dialog.Close render={<Button variant="secondary" />}>Cancel</Dialog.Close>
            <Dialog.Close render={<Button />}>Save</Dialog.Close>
          </Dialog.Actions>
        </Dialog.Content>
      </Dialog.Root>,
    );
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('data-variant', 'sheet');
    expect(dialog).toHaveAttribute('data-size', 'sm');
    await expectNoA11yViolations(baseElement);
  });

  it('keeps the dialog open while a Menu and a Select inside it open, pick and close', async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Content>
          <Dialog.Title>Filters</Dialog.Title>
          <Dialog.Body>
            <Select
              label="Sort by"
              onValueChange={onSort}
              options={[
                { value: 'score', label: 'Score' },
                { value: 'date', label: 'Date posted' },
              ]}
            />
            <Menu.Root>
              <Menu.Trigger>Columns</Menu.Trigger>
              <Menu.Content>
                <Menu.Item>Company</Menu.Item>
              </Menu.Content>
            </Menu.Root>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Root>,
    );
    const dialog = await screen.findByRole('dialog');
    await user.click(screen.getByRole('combobox', { name: 'Sort by' }));
    await user.click(await screen.findByRole('option', { name: 'Date posted' }));
    expect(onSort).toHaveBeenLastCalledWith('date');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    expect(dialog).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Columns' }));
    const menu = await screen.findByRole('menu');
    expect(menu).toBeInTheDocument();
    await user.click(screen.getByRole('menuitem', { name: 'Company' }));
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('routes Esc and every Dialog.Close to onRequestClose; the app closes it through open', async () => {
    const user = userEvent.setup();
    const reasons: DialogCloseRequestReason[] = [];
    function Guarded() {
      const [open, setOpen] = useState(true);
      return (
        <>
          <p>Page</p>
          <Dialog.Root open={open} onRequestClose={(reason) => reasons.push(reason)}>
            <Dialog.Content variant="fullscreen">
              <Dialog.Close />
              <Dialog.Title>Set up your search</Dialog.Title>
              <Dialog.Body>
                <p>Body</p>
              </Dialog.Body>
              <Dialog.Actions>
                <Dialog.Close render={<Button variant="secondary" />}>Cancel</Dialog.Close>
                <Button onClick={() => setOpen(false)}>Leave</Button>
              </Dialog.Actions>
            </Dialog.Content>
          </Dialog.Root>
        </>
      );
    }
    const { baseElement } = render(<Guarded />);
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('data-variant', 'fullscreen');
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(reasons).toEqual(['escape-key', 'close-press', 'close-press']);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await expectNoA11yViolations(baseElement);
    await user.click(screen.getByRole('button', { name: 'Leave' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('still swallows Esc when not dismissible, even with onRequestClose', async () => {
    const user = userEvent.setup();
    const onRequestClose = vi.fn();
    render(
      <Dialog.Root defaultOpen dismissible={false} onRequestClose={onRequestClose}>
        <Dialog.Content size="sm">
          <Dialog.Title>Finish setting up?</Dialog.Title>
          <Dialog.Close render={<Button />}>Later</Dialog.Close>
        </Dialog.Content>
      </Dialog.Root>,
    );
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    expect(onRequestClose).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Later' }));
    expect(onRequestClose).toHaveBeenCalledWith('close-press');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('gives a dialog opened inside another its own backdrop, next to its popup, so the first dialog dims', async () => {
    const user = userEvent.setup();
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Content variant="fullscreen">
          <Dialog.Title>Posting</Dialog.Title>
          <Dialog.Root>
            <Dialog.Trigger render={<Button variant="secondary" />}>Correct a reason</Dialog.Trigger>
            <Dialog.Content variant="sheet">
              <Dialog.Title>De-prioritize this</Dialog.Title>
              <Dialog.Close render={<Button variant="secondary" />}>Cancel</Dialog.Close>
            </Dialog.Content>
          </Dialog.Root>
        </Dialog.Content>
      </Dialog.Root>,
    );
    await screen.findByRole('dialog', { name: 'Posting' });
    expect(document.querySelectorAll('.sc-dialog__backdrop')).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'Correct a reason' }));
    const sheet = await screen.findByRole('dialog', { name: 'De-prioritize this' });
    expect(sheet).toHaveAttribute('data-nested');
    const backdrops = document.querySelectorAll('.sc-dialog__backdrop');
    expect(backdrops).toHaveLength(2);
    // The nested scrim is a sibling before the nested popup: dialog.css lifts it over the parent popup with
    // `.sc-dialog__backdrop:has(~ .sc-dialog__popup[data-nested])`.
    expect(backdrops[1]!.parentElement).toBe(sheet.parentElement);
    expect(backdrops[1]!.matches(':has(~ .sc-dialog__popup[data-nested])')).toBe(true);
    expect(backdrops[0]!.matches(':has(~ .sc-dialog__popup[data-nested])')).toBe(false);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(document.querySelectorAll('.sc-dialog__backdrop')).toHaveLength(1));
  });

  describe('sheet swipe to dismiss', () => {
    const rect = (top: number, height: number) =>
      ({ top, height, bottom: top + height, left: 0, right: 390, width: 390, x: 0, y: top }) as DOMRect;

    // jsdom has no layout: show the handle (as below 640px) and give the popup a 500px box at y = 300.
    beforeEach(() => {
      vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue([
        rect(0, 24),
      ] as unknown as DOMRectList);
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(rect(300, 500));
    });
    afterEach(() => vi.restoreAllMocks());

    function pointer(el: Element, type: string, y: number, t: number, x = 20) {
      const ev = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0 });
      Object.defineProperties(ev, {
        pointerId: { value: 1 },
        pointerType: { value: 'touch' },
        isPrimary: { value: true },
        timeStamp: { value: t },
      });
      act(() => {
        el.dispatchEvent(ev);
      });
    }

    /** Press at y = 310 on `el`, move down `to` px over `ms`, release. */
    function drag(el: Element, to: number, ms: number) {
      pointer(el, 'pointerdown', 310, 0);
      const steps = 5;
      for (let i = 1; i <= steps; i++) pointer(el, 'pointermove', 310 + (to * i) / steps, (ms * i) / steps);
      pointer(el, 'pointerup', 310 + to, ms);
    }

    function Sheet({
      onOpenChange,
      dismissOnSwipe,
      dismissible,
      onRequestClose,
    }: {
      onOpenChange?: (o: boolean) => void;
      dismissOnSwipe?: boolean;
      dismissible?: boolean;
      onRequestClose?: (r: DialogCloseRequestReason) => void;
    }) {
      return (
        <Dialog.Root
          defaultOpen
          onOpenChange={onOpenChange}
          dismissible={dismissible}
          onRequestClose={onRequestClose}
        >
          <Dialog.Content variant="sheet" dismissOnSwipe={dismissOnSwipe}>
            <Dialog.Close />
            <Dialog.Title>Pick careers</Dialog.Title>
            <Dialog.Body>
              <p>Body text</p>
            </Dialog.Body>
            <Dialog.Actions>
              <Dialog.Close render={<Button />}>Done</Dialog.Close>
            </Dialog.Actions>
          </Dialog.Content>
        </Dialog.Root>
      );
    }

    it('has a named handle that closes from the keyboard', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const { baseElement } = render(<Sheet onOpenChange={onOpenChange} />);
      const handle = await screen.findByRole('button', { name: 'Dismiss' });
      expect(screen.getByRole('dialog')).toHaveAttribute('data-swipe-dismiss');
      await expectNoA11yViolations(baseElement);
      handle.focus();
      await user.keyboard('{Enter}');
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
    });

    it('closes when released past 30% of the height, through onOpenChange', async () => {
      const onOpenChange = vi.fn();
      render(<Sheet onOpenChange={onOpenChange} />);
      const handle = await screen.findByRole('button', { name: 'Dismiss' });
      drag(handle, 160, 800);
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
    });

    it('springs back when released short of the threshold, slowly', async () => {
      const onOpenChange = vi.fn();
      render(<Sheet onOpenChange={onOpenChange} />);
      const dialog = await screen.findByRole('dialog');
      const title = screen.getByRole('heading', { name: 'Pick careers' });
      pointer(title, 'pointerdown', 310, 0);
      pointer(title, 'pointermove', 360, 400);
      expect(dialog.style.transform).toBe('translateY(50px)');
      expect(dialog).toHaveAttribute('data-swiping');
      pointer(title, 'pointermove', 400, 800);
      pointer(title, 'pointerup', 400, 1000);
      expect(dialog.style.transform).toBe('');
      expect(dialog).not.toHaveAttribute('data-swiping');
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(onOpenChange).not.toHaveBeenCalled();
    });

    it('closes on a quick flick, however short', async () => {
      render(<Sheet />);
      const handle = await screen.findByRole('button', { name: 'Dismiss' });
      drag(handle, 40, 50);
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    });

    it('never starts a drag inside the body, nor below the 64px header zone', async () => {
      render(<Sheet />);
      const dialog = await screen.findByRole('dialog');
      drag(screen.getByText('Body text'), 300, 100);
      expect(dialog.style.transform).toBe('');
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      const actions = screen.getByRole('button', { name: 'Done' }).parentElement!;
      pointer(actions, 'pointerdown', 300 + 65, 0);
      pointer(actions, 'pointermove', 300 + 300, 50);
      pointer(actions, 'pointerup', 300 + 300, 60);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('does nothing while the handle is hidden (the centred dialog from 640px)', async () => {
      vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue([] as unknown as DOMRectList);
      render(<Sheet />);
      const handle = await screen.findByRole('button', { name: 'Dismiss' });
      drag(handle, 300, 100);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('asks onRequestClose and springs back when the app keeps it open', async () => {
      const onRequestClose = vi.fn();
      render(<Sheet onRequestClose={onRequestClose} />);
      const dialog = await screen.findByRole('dialog');
      drag(screen.getByRole('button', { name: 'Dismiss' }), 300, 1000);
      expect(onRequestClose).toHaveBeenCalledWith('close-press');
      await waitFor(() => expect(dialog.style.transform).toBe(''));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('is off with dismissOnSwipe={false} or a non-dismissible Root: the handle is decoration', async () => {
      const { unmount } = render(<Sheet dismissOnSwipe={false} />);
      const dialog = await screen.findByRole('dialog');
      expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull();
      expect(dialog).not.toHaveAttribute('data-swipe-dismiss');
      const handle = dialog.querySelector('.sc-dialog__handle')!;
      expect(handle).toHaveAttribute('aria-hidden', 'true');
      drag(handle, 300, 100);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      unmount();

      render(<Sheet dismissible={false} />);
      await screen.findByRole('dialog');
      expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull();
    });

    it('renders no handle outside the sheet variant', async () => {
      render(<Example />);
      await userEvent.setup().click(screen.getByRole('button', { name: 'Archive' }));
      const dialog = await screen.findByRole('dialog');
      expect(dialog.querySelector('.sc-dialog__handle')).toBeNull();
    });
  });
});
