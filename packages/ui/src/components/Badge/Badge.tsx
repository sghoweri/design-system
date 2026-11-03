import type { ComponentPropsWithRef } from 'react';
import { cx } from '../../utils/cx';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
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
}

/** One or two words of status beside a thing. Text only; never clickable. */
export function Badge({
  tone = 'neutral',
  variant = 'soft',
  size = 'md',
  dot = false,
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
      {...rest}
    >
      {dot ? <span className="sc-badge__dot" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
