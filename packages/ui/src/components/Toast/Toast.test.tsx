import '@testing-library/jest-dom/vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toast, useToast, type ToastOptions } from './Toast';
import { expectNoA11yViolations } from '../../../test/axe';

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
});
