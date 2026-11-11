import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { createContext, useCallback, useContext, type ComponentPropsWithRef, type ReactNode } from 'react';
import { Inline, type InlineProps } from '../Inline/Inline';
import { attachSheetSwipe } from './sheetSwipe';
import { XIcon } from '../../icons/icons.gen';
import { cx } from '../../utils/cx';

export type DialogSize = 'sm' | 'md' | 'lg';
export type DialogVariant = 'dialog' | 'sheet' | 'fullscreen';
/** How a person asked to close: Esc, a press on the backdrop, or a `Dialog.Close`. */
export type DialogCloseRequestReason = 'escape-key' | 'outside-press' | 'close-press';

const REQUESTABLE: ReadonlySet<string> = new Set<DialogCloseRequestReason>([
  'escape-key',
  'outside-press',
  'close-press',
]);

export interface DialogRootProps {
  /** Controlled open state. */
  open?: boolean | undefined;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean | undefined;
  /** Called when the dialog opens or closes. */
  onOpenChange?: ((open: boolean) => void) | undefined;
  /** When `false`, Esc and backdrop clicks no longer close the dialog. Default `true`. */
  dismissible?: boolean | undefined;
  /**
   * When set, the dialog no longer closes itself: Esc, a backdrop press and every `Dialog.Close` call
   * this with the reason instead, and the app closes it by setting `open` to `false` (for example after
   * a "Leave for now?" confirmation). Use with a controlled `open`. `dismissible={false}` still swallows
   * Esc and backdrop presses first.
   */
  onRequestClose?: ((reason: DialogCloseRequestReason) => void) | undefined;
  children?: ReactNode | undefined;
}

const DismissibleContext = createContext(true);

/** Owns the open state. Wrap a `Dialog.Trigger` and a `Dialog.Content`. */
function Root({
  dismissible = true,
  onOpenChange,
  onRequestClose,
  open,
  defaultOpen,
  children,
}: DialogRootProps) {
  return (
    <BaseDialog.Root
      open={open}
      defaultOpen={defaultOpen}
      disablePointerDismissal={!dismissible}
      onOpenChange={(next, details) => {
        if (
          !dismissible &&
          !next &&
          (details.reason === 'escape-key' || details.reason === 'outside-press')
        ) {
          details.cancel();
          return;
        }
        if (!next && onRequestClose && REQUESTABLE.has(details.reason)) {
          details.cancel();
          onRequestClose(details.reason as DialogCloseRequestReason);
          return;
        }
        onOpenChange?.(next);
      }}
    >
      <DismissibleContext.Provider value={dismissible}>{children}</DismissibleContext.Provider>
    </BaseDialog.Root>
  );
}

/** Opens the dialog. Pass the Button through `render`: `<Dialog.Trigger render={<Button />}>Open</Dialog.Trigger>`. */
const Trigger = BaseDialog.Trigger;

export interface DialogContentProps extends Omit<BaseDialog.Popup.Props, 'className'> {
  /**
   * Maximum width: `sm` 400px for yes/no, `md` 560px (default) for a short form, `lg` 720px rarely.
   * Every size clamps to the viewport minus a 16px gutter, so a 390px phone gets a 358px dialog.
   */
  size?: DialogSize | undefined;
  /**
   * `dialog` (default) centres the popup. `sheet` is the same on wide viewports but below 640px it
   * becomes a bottom sheet: full width, rounded top, title and actions pinned while `Dialog.Body`
   * scrolls, padding that clears the home indicator. Use it for forms and pickers opened from a list.
   * `fullscreen` covers the viewport (inset by 16px with a rounded edge from 900px), slides in from the
   * inline end, keeps clear of the safe areas, and lets `Dialog.Body` scroll between a pinned title and
   * actions; `size` is ignored. It is the surface of `FullScreenFlow`. Pair it with `onRequestClose` on
   * the Root when leaving needs a confirmation.
   */
  variant?: DialogVariant | undefined;
  /**
   * `sheet` only. Below 640px a downward drag on the handle or the header (the top 64px, outside controls
   * and `Dialog.Body`) moves the sheet; letting go past 30% of its height, or flicking down, closes it the
   * way a press on the handle does (the handle is a `Dialog.Close` named "Dismiss"). Set `false` where an
   * accidental close loses work; the handle then stays as decoration only. Off whenever the Root is not
   * `dismissible`. Default `true`.
   */
  dismissOnSwipe?: boolean | undefined;
  className?: string | undefined;
}

/**
 * Portal, backdrop and the popup. Focus moves inside on open and returns to the trigger on close. A dialog opened
 * from inside another has its own backdrop too, over the first dialog.
 * Menus, selects and tooltips opened from inside render above it (`--sc-z-dropdown` > `--sc-z-dialog`).
 */
function Content({
  size = 'md',
  variant = 'dialog',
  dismissOnSwipe = true,
  className,
  children,
  ...rest
}: DialogContentProps) {
  const dismissible = useContext(DismissibleContext);
  const isSheet = variant === 'sheet';
  const swipe = isSheet && dismissOnSwipe && dismissible;
  return (
    <BaseDialog.Portal>
      {/* `forceRender`: Base UI drops the backdrop of a dialog opened inside another, so a sheet over a full-screen
          dialog didn't dim it. The nested one's scrim sits above its parent's popup (dialog.css). */}
      {/* `data-variant`: a sheet's scrim moves on the sheet's duration and curve (dialog.css). */}
      <BaseDialog.Backdrop className="sc-dialog__backdrop" data-variant={variant} forceRender />
      <BaseDialog.Popup
        className={cx('sc-dialog__popup', className)}
        data-size={size}
        data-variant={variant}
        data-swipe-dismiss={swipe ? '' : undefined}
        aria-modal="true"
        {...rest}
      >
        {isSheet && <SheetHandle swipe={swipe} />}
        {children}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}

/**
 * The grab handle at the top of a docked sheet (hidden from 640px). With swipe on it is a `Dialog.Close`:
 * Enter, Space or a tap closes, and a drag from it or the header follows the finger.
 */
function SheetHandle({ swipe }: { swipe: boolean }) {
  const attach = useCallback(
    (node: HTMLButtonElement | null) => (node ? attachSheetSwipe(node) : undefined),
    [],
  );
  if (!swipe) return <div className="sc-dialog__handle" aria-hidden="true" />;
  return <BaseDialog.Close ref={attach} className="sc-dialog__handle" aria-label="Dismiss" />;
}

export interface DialogTitleProps extends Omit<BaseDialog.Title.Props, 'className'> {
  className?: string | undefined;
}

/** Required. Labels the dialog; a question or a statement. Renders an `<h2>`. */
function Title({ className, ...rest }: DialogTitleProps) {
  return <BaseDialog.Title className={cx('sc-dialog__title', className)} {...rest} />;
}

export interface DialogDescriptionProps extends Omit<BaseDialog.Description.Props, 'className'> {
  className?: string | undefined;
}

/** Optional, muted. Says what will happen. */
function Description({ className, ...rest }: DialogDescriptionProps) {
  return <BaseDialog.Description className={cx('sc-dialog__description', className)} {...rest} />;
}

export type DialogBodyProps = ComponentPropsWithRef<'div'>;

/** Free content between the description and the actions. In a `sheet` it is the part that scrolls. */
function Body({ className, ...rest }: DialogBodyProps) {
  return <div className={cx('sc-dialog__body', className)} {...rest} />;
}

export type DialogActionsProps = Omit<InlineProps, 'justify'>;

/** Right-aligned row of Buttons. Put the confirming action last. */
function Actions({ className, ...rest }: DialogActionsProps) {
  return <Inline justify="end" className={cx('sc-dialog__actions', className)} {...rest} />;
}

export interface DialogCloseProps extends Omit<BaseDialog.Close.Props, 'className'> {
  className?: string | undefined;
}

/** With no children or `render`, the × in the corner. Otherwise wraps any Button: `<Dialog.Close render={<Button variant="secondary" />}>Cancel</Dialog.Close>`. */
function Close({ className, children, render, ...rest }: DialogCloseProps) {
  if (children === undefined && render === undefined) {
    return (
      <BaseDialog.Close className={cx('sc-dialog__close', className)} aria-label="Close" {...rest}>
        <XIcon />
      </BaseDialog.Close>
    );
  }
  return (
    <BaseDialog.Close className={className} render={render} {...rest}>
      {children}
    </BaseDialog.Close>
  );
}

/** A modal that interrupts for a decision or a short form. Built on Base UI's Dialog. */
export const Dialog = { Root, Trigger, Content, Title, Description, Body, Actions, Close };
