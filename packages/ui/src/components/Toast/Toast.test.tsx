import '@testing-library/jest-dom/vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toast, useToast, type ToastOptions } from './Toast';
import { expectNoA11yViolations } from '../../../test/axe';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function Trigger({ options }: { options: ToastOptions }) {
  const toast = useToast();
  return (
    <button type="button" onClick={() => toast.add(options)}>
      Show
    </button>
  );
}

describe('Toast', () => {
  it('shows a titled toast in a polite notifications region; no axe violations', async () => {
    const user = userEvent.setup();
    render(
      <Toast.Provider>
        <Trigger options={{ title: 'Closed 5 applications', description: '2 were already closed.' }} />
      </Toast.Provider>,
    );
    await user.click(screen.getByRole('button', { name: 'Show' }));
    const region = screen.getByRole('region', { name: 'Notifications' });
    expect(region).toHaveAttribute('aria-live', 'polite');
    const toast = await screen.findByRole('dialog', { name: 'Closed 5 applications' });
    expect(toast).toHaveAccessibleDescription('2 were already closed.');
    expect(toast).toHaveAttribute('data-tone', 'neutral');
    await expectNoA11yViolations(document.body);
  });

  it('the accent tone fills the toast; its buttons and description read on the fill', async () => {
    const user = userEvent.setup();
    render(
      <Toast.Provider>
        <Trigger
          options={{
            title: 'The app was updated',
            description: 'Reload to get the latest.',
            tone: 'accent',
            timeout: 0,
            action: { label: 'Reload', onClick: () => undefined },
            dismissLabel: 'Later',
          }}
        />
      </Toast.Provider>,
    );
    await user.click(screen.getByRole('button', { name: 'Show' }));
    const toast = await screen.findByRole('dialog', { name: 'The app was updated' });
    expect(toast).toHaveAttribute('data-tone', 'accent');
    expect(toast).toHaveAccessibleDescription('Reload to get the latest.');
    await expectNoA11yViolations(document.body);
    // jsdom has no cascade, so check the stylesheet: the scope repoints every token a Button or the description reads.
    const css = readFileSync(join(__dirname, '..', '..', 'styles', 'base.css'), 'utf8');
    const scope = /\.sc-toast\[data-tone='accent'\] \{([^}]*)\}/.exec(css)?.[1] ?? '';
    for (const [token, value] of [
      ['text-default', 'text-on-accent'],
      ['text-muted', 'text-on-accent'],
      ['border-strong', 'text-on-accent'],
      ['border-focus', 'text-on-accent'],
      ['surface-hover', 'accent-hover'],
      ['surface-active', 'accent-active'],
    ])
      expect(scope).toContain(`--sc-color-${token}: var(--sc-color-${value});`);
  });

  it('runs the action once and closes; Dismiss closes', async () => {
    const user = userEvent.setup();
    const undo = vi.fn();
    render(
      <Toast.Provider>
        <Trigger
          options={{
            title: 'Closed 5 applications',
            tone: 'success',
            action: { label: 'Undo', onClick: undo },
          }}
        />
      </Toast.Provider>,
    );
    await user.click(screen.getByRole('button', { name: 'Show' }));
    await user.click(await screen.findByRole('button', { name: 'Undo' }));
    expect(undo).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await user.click(screen.getByRole('button', { name: 'Show' }));
    await user.click(await screen.findByRole('button', { name: 'Dismiss' }));
    await vi.waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('closes itself after the timeout', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Toast.Provider timeout={6000}>
        <Trigger options={{ title: 'Saved' }} />
      </Toast.Provider>,
    );
    await user.click(screen.getByRole('button', { name: 'Show' }));
    expect(await screen.findByRole('dialog', { name: 'Saved' })).toBeInTheDocument();
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByRole('dialog', { name: 'Saved' })).toBeInTheDocument();
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });
    await vi.waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    vi.useRealTimers();
  });

  it('stays until answered: no timeout, an action that keeps it open, a text dismiss, onClose once', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const reload = vi.fn();
    const onClose = vi.fn();
    render(
      <Toast.Provider timeout={6000}>
        <Trigger
          options={{
            id: 'updated',
            title: 'The app was updated',
            timeout: 0,
            action: { label: 'Reload', onClick: reload, keepOpen: true },
            dismissLabel: 'Later',
            onClose,
          }}
        />
      </Toast.Provider>,
    );
    await user.click(screen.getByRole('button', { name: 'Show' }));
    const toast = await screen.findByRole('dialog', { name: 'The app was updated' });
    expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull();
    await act(async () => {
      vi.advanceTimersByTime(60_000);
    });
    expect(toast).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reload' }));
    expect(reload).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('dialog', { name: 'The app was updated' })).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Later' }));
    await vi.waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(onClose).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('adding the same id again updates it in place', async () => {
    const user = userEvent.setup();
    function Twice() {
      const toast = useToast();
      return (
        <>
          <button type="button" onClick={() => toast.add({ id: 'one', title: 'First', timeout: 0 })}>
            First
          </button>
          <button type="button" onClick={() => toast.add({ id: 'one', title: 'Second', timeout: 0 })}>
            Second
          </button>
        </>
      );
    }
    render(
      <Toast.Provider>
        <Twice />
      </Toast.Provider>,
    );
    await user.click(screen.getByRole('button', { name: 'First' }));
    await screen.findByRole('dialog', { name: 'First' });
    await user.click(screen.getByRole('button', { name: 'Second' }));
    await screen.findByRole('dialog', { name: 'Second' });
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
  });

  it('a Provider inside another shares its viewport: one Notifications region', async () => {
    const user = userEvent.setup();
    render(
      <Toast.Provider>
        <Trigger options={{ title: 'From the app' }} />
        <Toast.Provider>
          <Trigger options={{ title: 'From a page' }} />
        </Toast.Provider>
      </Toast.Provider>,
    );
    const [outer, inner] = screen.getAllByRole('button', { name: 'Show' });
    await user.click(outer!);
    await user.click(inner!);
    expect(screen.getAllByRole('region', { name: 'Notifications' })).toHaveLength(1);
    expect(await screen.findByRole('dialog', { name: 'From a page' })).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'From the app' })).toBeInTheDocument();
  });
});
