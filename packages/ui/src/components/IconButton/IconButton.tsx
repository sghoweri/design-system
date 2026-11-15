import { useRender } from '@base-ui/react/use-render';
import type { ReactNode } from 'react';
import { Tooltip, type TooltipSide } from '../Tooltip/Tooltip';
import type { ButtonSize, ButtonVariant } from '../Button/Button';
import { cx } from '../../utils/cx';
import { guardPressWhileLoading } from '../../utils/loadingGuard';

export type IconButtonDotTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

export interface IconButtonProps extends Omit<useRender.ComponentProps<'button'>, 'children' | 'aria-label'> {
  /** Required. The accessible name, and the tooltip text when `tooltip` is `true`. */
  label: string;
  /** The icon, usually a shipped `<Name>Icon`. It is decorative; `label` names the button. Optional only so a popup trigger can supply it through `render`. */
  children?: ReactNode | undefined;
  /** `ghost` (default) in toolbars and rows, `secondary` when it must read as a button, `primary` and `danger` rarely. */
  variant?: ButtonVariant | undefined;
  /** Square: 32, 40 or 48px. Compact density shrinks each by one step. */
  size?: ButtonSize | undefined;
  /** `true` shows `label` as a tooltip on hover and focus; a string shows that text instead. */
  tooltip?: boolean | string | undefined;
  /** Side the tooltip opens on. Default `top`. */
  tooltipSide?: TooltipSide | undefined;
  /** Fully round, for avatars and floating actions. */
  round?: boolean | undefined;
  /** Shows a spinner, sets `aria-busy` and ignores presses (the click, mousedown, pointerdown and keydown handlers don't run), including a popup trigger's merged in through `render`. */
  loading?: boolean | undefined;
  /** A status dot in the top-left corner, ringed in `--sc-icon-button-dot-ring` (default `surface-default`). Decorative: put the status in `label` too ("Sweeps: paused"). */
  dot?: IconButtonDotTone | undefined;
}

/**
 * A square Button for one icon. Always named by `label`; use `tooltip` to show that name on hover.
 * Renders a `<button>` unless `render` gives another element: `render={<a href="/settings" />}` or a
 * Next.js `<Link href="/settings" />` makes it a link with the same look and name.
 */
export function IconButton({
  label,
  children,
  variant = 'ghost',
  size = 'md',
  tooltip,
  tooltipSide = 'top',
  round = false,
  loading = false,
  dot,
  type,
  className,
  onClick,
  onMouseDown,
  onPointerDown,
  onKeyDown,
  render,
  ref,
  ...rest
}: IconButtonProps) {
  const press = guardPressWhileLoading(loading, { onClick, onMouseDown, onPointerDown, onKeyDown });
  const button = useRender({
    render,
    ref,
    defaultTagName: 'button',
    props: {
      // `type` only means something on a real button; a rendered link keeps its own attributes.
      type: render ? type : (type ?? 'button'),
      className: cx('sc-button', 'sc-icon-button', className),
      'data-variant': variant,
      'data-size': size,
      'data-round': round || undefined,
      'data-loading': loading || undefined,
      'aria-busy': loading || undefined,
      'aria-label': label,
      ...rest,
      ...press,
      children: (
        <>
          <span className="sc-button__icon" aria-hidden="true">
            {children}
          </span>
          {loading ? <span className="sc-button__spinner" aria-hidden="true" /> : null}
          {dot ? <span className="sc-icon-button__dot" data-tone={dot} aria-hidden="true" /> : null}
        </>
      ),
    },
  });
  if (!tooltip) return button;
  return (
    <Tooltip content={tooltip === true ? label : tooltip} side={tooltipSide}>
      {button}
    </Tooltip>
  );
}
