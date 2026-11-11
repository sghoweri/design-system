import { Toast as BaseToast } from '@base-ui/react/toast';
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { XIcon } from '../../icons/icons.gen';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';

export type ToastTone = 'neutral' | 'success' | 'danger' | 'accent';

export interface ToastOptions {
  /** Required. One line: "Closed 5 applications". */
  title: ReactNode;
  description?: ReactNode | undefined;
  /**
   * `neutral` (default), `success` and `danger` colour the edge. `accent` fills the toast with the accent colour, for
   * the rare notice that has to be seen (the app was updated); its buttons read on the fill (`.sc-on-accent`).
   */
  tone?: ToastTone | undefined;
  /**
   * One action, usually Undo. It closes the toast after `onClick`, unless `keepOpen` (the action asks first, and the
   * person may cancel).
   */
  action?: { label: string; onClick: () => void; keepOpen?: boolean | undefined } | undefined;
  /** Milliseconds before it closes; paused while hovered or focused; `0` keeps it. Default: the Provider's. */
  timeout?: number | undefined;
  /** `high` announces assertively (errors). Default `low`, polite. */
  priority?: 'low' | 'high' | undefined;
  /**
   * Names the toast. Adding one whose id is showing updates it in place (new text, the timer starts again) instead
   * of stacking a second.
   */
  id?: string | undefined;
  /** The dismiss control as a text button ("Later") instead of the ×. */
  dismissLabel?: string | undefined;
  /** Called once when it closes, however: dismissed, swiped away, its action, its timeout or `close()`. */
  onClose?: (() => void) | undefined;
}

export interface ToastProviderProps {
  children?: ReactNode | undefined;
  /** Default auto-close, in milliseconds. Default 6000. */
  timeout?: number | undefined;
  /** How many show at once; older ones close. Default 3. */
  limit?: number | undefined;
}

const InsideProvider = createContext(false);

/**
 * Holds the toasts for `useToast()` below it and renders them, bottom-end, above the page. One viewport per page: a
 * Provider inside another adds nothing (its `timeout` and `limit` are ignored), so a component may wrap itself in one
 * and still share the app's.
 */
function Provider({ children, timeout = 6000, limit = 3 }: ToastProviderProps) {
  if (useContext(InsideProvider)) return children;
  return (
    <InsideProvider.Provider value>
      <BaseToast.Provider timeout={timeout} limit={limit}>
        {children}
        <BaseToast.Portal>
          <Viewport />
        </BaseToast.Portal>
      </BaseToast.Provider>
    </InsideProvider.Provider>
  );
}

function Viewport() {
  const { toasts, close } = BaseToast.useToastManager<ToastData>();
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
          {toast.data?.dismissLabel ? (
            <Button variant="ghost" size="sm" className="sc-toast__close" onClick={() => close(toast.id)}>
              {toast.data.dismissLabel}
            </Button>
          ) : (
            <IconButton label="Dismiss" size="sm" className="sc-toast__close" onClick={() => close(toast.id)}>
              <XIcon />
            </IconButton>
          )}
        </BaseToast.Root>
      ))}
    </BaseToast.Viewport>
  );
}

interface ToastData {
  dismissLabel?: string | undefined;
}

export interface ToastApi {
  /** Shows a toast and returns its id. */
  add: (options: ToastOptions) => string;
  /** Closes one toast, or every toast without an id. */
  close: (id?: string) => void;
}

/** Shows toasts from inside a `Toast.Provider`. */
export function useToast(): ToastApi {
  const manager = BaseToast.useToastManager<ToastData>();
  return useMemo(
    () => ({
      add: ({
        title,
        description,
        tone = 'neutral',
        action,
        timeout,
        priority,
        id: given,
        dismissLabel,
        onClose,
      }: ToastOptions) => {
        let id = given ?? '';
        id = manager.add({
          title,
          description,
          type: tone,
          data: { dismissLabel },
          ...(given ? { id: given } : {}),
          ...(timeout !== undefined ? { timeout } : {}),
          ...(priority ? { priority } : {}),
          ...(onClose ? { onClose } : {}),
          ...(action
            ? {
                actionProps: {
                  children: action.label,
                  onClick: () => {
                    action.onClick();
                    if (!action.keepOpen) manager.close(id);
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
