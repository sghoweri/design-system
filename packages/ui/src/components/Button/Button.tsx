import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { guardPressWhileLoading } from '../../utils/loadingGuard';

/**
 * `success` is for the positive decision (Approve), beside a neutral or danger counterpart. `inverse` is a white button
 * for a dark or coloured fill (the accent Toast's action); elsewhere use the others.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'inverse';
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
  /** Keeps the width, hides the label, shows a spinner, sets `aria-busy` and ignores presses (the click, mousedown, pointerdown and keydown handlers don't run). */
  loading?: boolean | undefined;
  /** Stretches to the container. */
  fullWidth?: boolean | undefined;
  /** A keyboard hint after the label: `shortcut={<Kbd>N</Kbd>}`. Hidden from assistive tech; announce the key with `aria-keyshortcuts="n"`. Not shown on devices with no fine pointer (touch only). */
  shortcut?: ReactNode | undefined;
  /** Shows only `iconStart` (or `iconEnd`) in a square button; the label stays the accessible name and the shortcut hides. Toggles without remounting, e.g. when a header runs out of room. Pair with a Tooltip carrying the label. */
  iconOnly?: boolean | undefined;
}

/**
 * The one way to trigger an action. Renders a native `<button>`; `type` defaults to `button`.
 *
 * @since 0.1.0
 */
export function Button({
  variant = 'primary',
  size = 'md',
  iconStart,
  iconEnd,
  loading = false,
  fullWidth = false,
  shortcut,
  iconOnly = false,
  type = 'button',
  className,
  children,
  onClick,
  onMouseDown,
  onPointerDown,
  onKeyDown,
  ...rest
}: ButtonProps) {
  const press = guardPressWhileLoading(loading, { onClick, onMouseDown, onPointerDown, onKeyDown });
  return (
    <button
      type={type}
      className={cx('c-proto-button', className)}
      data-variant={variant}
      data-size={size}
      data-loading={loading || undefined}
      data-full-width={fullWidth || undefined}
      data-icon-only={iconOnly || undefined}
      aria-busy={loading || undefined}
      {...rest}
      {...press}
    >
      {iconStart ? (
        <span className="c-proto-button__icon" aria-hidden="true">
          {iconStart}
        </span>
      ) : null}
      <span className="c-proto-button__label">{children}</span>
      {iconEnd ? (
        <span className="c-proto-button__icon" aria-hidden="true">
          {iconEnd}
        </span>
      ) : null}
      {shortcut ? (
        <span className="c-proto-button__shortcut" aria-hidden="true">
          {shortcut}
        </span>
      ) : null}
      {loading ? <span className="c-proto-button__spinner" aria-hidden="true" /> : null}
    </button>
  );
}
