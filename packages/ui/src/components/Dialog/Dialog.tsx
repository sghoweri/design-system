import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Inline, type InlineProps } from '../Inline/Inline';
import { cx } from '../../utils/cx';

export type DialogSize = 'sm' | 'md' | 'lg';

export interface DialogRootProps {
  /** Controlled open state. */
  open?: boolean | undefined;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean | undefined;
  /** Called when the dialog opens or closes. */
  onOpenChange?: ((open: boolean) => void) | undefined;
  /** When `false`, Esc and backdrop clicks no longer close the dialog. Default `true`. */
  dismissible?: boolean | undefined;
  children?: ReactNode | undefined;
}

/** Owns the open state. Wrap a `Dialog.Trigger` and a `Dialog.Content`. */
function Root({ dismissible = true, onOpenChange, open, defaultOpen, children }: DialogRootProps) {
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
        onOpenChange?.(next);
      }}
    >
      {children}
    </BaseDialog.Root>
  );
}

/** Opens the dialog. Pass the Button through `render`: `<Dialog.Trigger render={<Button />}>Open</Dialog.Trigger>`. */
const Trigger = BaseDialog.Trigger;

export interface DialogContentProps extends Omit<BaseDialog.Popup.Props, 'className'> {
  /** `sm` 400px for yes/no, `md` 560px (default) for a short form, `lg` 720px rarely. */
  size?: DialogSize | undefined;
  className?: string | undefined;
}

/** Portal, backdrop and the popup. Focus moves inside on open and returns to the trigger on close. */
function Content({ size = 'md', className, children, ...rest }: DialogContentProps) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className="sc-dialog__backdrop" />
      <BaseDialog.Popup
        className={cx('sc-dialog__popup', className)}
        data-size={size}
        aria-modal="true"
        {...rest}
      >
        {children}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
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

/** Free content between the description and the actions. */
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
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          aria-hidden="true"
        >
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
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
