import { Toast as BaseToast } from '@base-ui/react/toast';
import { useMemo, type ReactNode } from 'react';
import { XIcon } from '../../icons/icons.gen';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';

export type ToastTone = 'neutral' | 'success' | 'danger';

export interface ToastOptions {
  /** Required. One line: "Closed 5 applications". */
  title: ReactNode;
  description?: ReactNode | undefined;
  /** A coloured edge. Default `neutral`. */
  tone?: ToastTone | undefined;
  /** One action, usually Undo. It closes the toast after `onClick`. */
  action?: { label: string; onClick: () => void } | undefined;
  /** Milliseconds before it closes; paused while hovered or focused; `0` keeps it. Default: the Provider's. */
  timeout?: number | undefined;
  /** `high` announces assertively (errors). Default `low`, polite. */
  priority?: 'low' | 'high' | undefined;
}

export interface ToastProviderProps {
  children?: ReactNode | undefined;
  /** Default auto-close, in milliseconds. Default 6000. */
  timeout?: number | undefined;
  /** How many show at once; older ones close. Default 3. */
  limit?: number | undefined;
}

/** Holds the toasts for `useToast()` below it and renders them, bottom-end, in the top layer. */
function Provider({ children, timeout = 6000, limit = 3 }: ToastProviderProps) {
  return (
    <BaseToast.Provider timeout={timeout} limit={limit}>
      {children}
      <BaseToast.Portal>
        <Viewport />
      </BaseToast.Portal>
    </BaseToast.Provider>
  );
}

function Viewport() {
  const { toasts, close } = BaseToast.useToastManager();
  return (
    <BaseToast.Viewport className="sc-toast-viewport">
      {toasts.map((toast) => (
        <BaseToast.Root key={toast.id} toast={toast} className="sc-toast" data-tone={toast.type ?? 'neutral'}>
          <BaseToast.Content className="sc-toast__content">
            <BaseToast.Title className="sc-toast__title" />
            {toast.description != null ? <BaseToast.Description className="sc-toast__description" /> : null}
          </BaseToast.Content>
          {toast.actionProps ? (
            <BaseToast.Action
              className="sc-toast__action"
              render={<Button variant="secondary" size="sm" />}
            />
          ) : null}
          <IconButton label="Dismiss" size="sm" className="sc-toast__close" onClick={() => close(toast.id)}>
            <XIcon />
          </IconButton>
        </BaseToast.Root>
      ))}
    </BaseToast.Viewport>
  );
}

export interface ToastApi {
  /** Shows a toast and returns its id. */
  add: (options: ToastOptions) => string;
  /** Closes one toast, or every toast without an id. */
  close: (id?: string) => void;
}

/** Shows toasts from inside a `Toast.Provider`. */
export function useToast(): ToastApi {
  const manager = BaseToast.useToastManager();
  return useMemo(
    () => ({
      add: ({ title, description, tone = 'neutral', action, timeout, priority }: ToastOptions) => {
        let id = '';
        id = manager.add({
          title,
          description,
          type: tone,
          ...(timeout !== undefined ? { timeout } : {}),
          ...(priority ? { priority } : {}),
          ...(action
            ? {
                actionProps: {
                  children: action.label,
                  onClick: () => {
                    action.onClick();
                    manager.close(id);
                  },
                },
              }
            : {}),
        });
        return id;
      },
      close: manager.close,
    }),
    [manager],
  );
}

/**
 * Short-lived status messages: "Closed 5 applications · Undo". Built on Base UI's Toast: announced through a
 * polite region (`priority: 'high'` for errors), paused while hovered or focused, F6 moves focus to them.
 */
export const Toast = { Provider };
