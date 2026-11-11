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
  // 2026-11-11: modal by default, so the page doesn't scroll under an open popover (Base UI's scroll lock).
  it('locks page scroll while open by default', async () => {
    render(
      <Popover.Root>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Content>Panel</Popover.Content>
      </Popover.Root>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(document.body.style.overflowY).toBe('hidden'));
  });

  it('leaves page scroll alone with modal={false}', async () => {
    render(
      <Popover.Root modal={false}>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Content>Panel</Popover.Content>
      </Popover.Root>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await screen.findByText('Panel');
    expect(document.body.style.overflowY).not.toBe('hidden');
  });

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
    // Modal by default: the page behind is inert and hidden from assistive tech, and a click there still closes.
    await user.click(document.body);
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

  describe('on a viewport too short for the panel above or below', () => {
    // jsdom has no layout: give the viewport, the anchor and the panel real sizes. 1280×600, the anchor at the end of
    // a row in the middle, and a 480×500 panel that fits on neither side but would fit whole to the anchor's left.
    const rect = (x: number, y: number, width: number, height: number) =>
      ({
        x,
        y,
        width,
        height,
        top: y,
        left: x,
        right: x + width,
        bottom: y + height,
        toJSON: () => ({}),
      }) as DOMRect;
    const restore: Array<() => void> = [];
    const stub = <T extends object>(target: T, key: string, value: PropertyDescriptor) => {
      const before = Object.getOwnPropertyDescriptor(target, key);
      Object.defineProperty(target, key, { configurable: true, ...value });
      restore.push(() =>
        before ? Object.defineProperty(target, key, before) : delete (target as Record<string, unknown>)[key],
      );
    };
    beforeEach(() => {
      stub(document.documentElement, 'clientWidth', { get: () => 1280 });
      stub(document.documentElement, 'clientHeight', { get: () => 600 });
      const isPanel = (el: HTMLElement) =>
        el.classList.contains('sc-popover__positioner') || el.classList.contains('sc-popover');
      stub(HTMLElement.prototype, 'offsetWidth', {
        get(this: HTMLElement) {
          return isPanel(this) ? 480 : 0;
        },
      });
      stub(HTMLElement.prototype, 'offsetHeight', {
        get(this: HTMLElement) {
          return isPanel(this) ? 500 : 0;
        },
      });
      const own = HTMLElement.prototype.getBoundingClientRect;
      stub(HTMLElement.prototype, 'getBoundingClientRect', {
        value(this: HTMLElement) {
          if (this.textContent === 'Row actions' && this.tagName === 'BUTTON') return rect(1200, 290, 24, 24);
          return isPanel(this) ? rect(0, 0, 480, 500) : own.call(this);
        },
      });
    });
    afterEach(() => {
      while (restore.length) restore.pop()?.();
    });

    it('stays below or above its anchor (never beside it, over the row) and is told the room it has to scroll in', async () => {
      const user = userEvent.setup();
      render(<AnchoredExample />);
      await user.click(screen.getByRole('button', { name: 'Row actions' }));
      const popup = await screen.findByRole('dialog', { name: 'Correct this reason' });
      const positioner = popup.parentElement as HTMLElement;
      await waitFor(() => expect(positioner.style.getPropertyValue('--available-height')).not.toBe(''));
      expect(['bottom', 'top']).toContain(popup.getAttribute('data-side'));
      expect(parseFloat(positioner.style.getPropertyValue('--available-height'))).toBeLessThan(300);
    });
  });
});
