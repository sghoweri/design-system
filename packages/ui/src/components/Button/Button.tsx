import type { ComponentPropsWithRef, MouseEvent, ReactNode } from 'react';
import { cx } from '../../utils/cx';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ComponentPropsWithRef<'button'> {
  /** `primary` for the one main action in a view, `secondary` for the rest, `ghost` in toolbars and rows, `danger` for destructive confirmations. */
  variant?: ButtonVariant | undefined;
  /** 32, 40 or 48px tall. Compact density shrinks each by one step. */
  size?: ButtonSize | undefined;
  /** A 16px icon before the label. */
  iconStart?: ReactNode | undefined;
  /** A 16px icon after the label. */
  iconEnd?: ReactNode | undefined;
  /** Keeps the width, hides the label, shows a spinner, sets `aria-busy` and ignores clicks. */
  loading?: boolean | undefined;
  /** Stretches to the container. */
  fullWidth?: boolean | undefined;
}

/** The one way to trigger an action. Renders a native `<button>`; `type` defaults to `button`. */
export function Button({
  variant = 'primary',
  size = 'md',
  iconStart,
  iconEnd,
  loading = false,
  fullWidth = false,
  type = 'button',
  className,
  children,
  onClick,
  ...rest
}: ButtonProps) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };
  return (
    <button
      type={type}
      className={cx('sc-button', className)}
      data-variant={variant}
      data-size={size}
      data-loading={loading || undefined}
      data-full-width={fullWidth || undefined}
      aria-busy={loading || undefined}
      onClick={handleClick}
      {...rest}
    >
      {iconStart ? (
        <span className="sc-button__icon" aria-hidden="true">
          {iconStart}
        </span>
      ) : null}
      <span className="sc-button__label">{children}</span>
      {iconEnd ? (
        <span className="sc-button__icon" aria-hidden="true">
          {iconEnd}
        </span>
      ) : null}
      {loading ? <span className="sc-button__spinner" aria-hidden="true" /> : null}
    </button>
  );
}
