import type { ComponentPropsWithRef } from 'react';
import { cx } from '../../utils/cx';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeVariant = 'soft' | 'solid' | 'outline';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends ComponentPropsWithRef<'span'> {
  /** Color reinforces the status; the word is the status. */
  tone?: BadgeTone | undefined;
  /** `soft` tinted fill (default), `solid` filled, `outline` hairline. */
  variant?: BadgeVariant | undefined;
  /** `md` 24px (default) or `sm` 20px for table rows and Card headers. */
  size?: BadgeSize | undefined;
  /** A 6px dot before the label for scannable lists. */
  dot?: boolean | undefined;
  /**
   * Fully round ends in the mono face, the homepage's pill (default `true`). Most badges are status or evidence
   * ("Applied", "2 sources", "CORS · named as a gap"), so this is opt-out: `rounded={false}` gives the 4px corner in
   * the sans face, for dense tables or a badge that sits beside square controls.
   */
  rounded?: boolean | undefined;
}

/** One or two words of status beside a thing. Text only; never clickable. */
export function Badge({
  tone = 'neutral',
  variant = 'soft',
  size = 'md',
  dot = false,
  rounded = true,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cx('sc-badge', className)}
      data-tone={tone}
      data-variant={variant}
      data-size={size}
      data-rounded={rounded || undefined}
      {...rest}
    >
      {dot ? <span className="sc-badge__dot" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
