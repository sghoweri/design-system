import type { ComponentPropsWithRef } from 'react';
import { cx } from '../../utils/cx';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeVariant = 'soft' | 'solid' | 'outline';
export type BadgeSize = 'sm' | 'md';
export type BadgeShape = 'rounded' | 'pill';

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
   * `rounded` (default) is a 4px corner in the sans face; `pill` is fully round in the mono face, for status and
   * evidence badges ("Applied", "2 sources", "CORS · named as a gap").
   */
  shape?: BadgeShape | undefined;
}

/** One or two words of status beside a thing. Text only; never clickable. */
export function Badge({
  tone = 'neutral',
  variant = 'soft',
  size = 'md',
  dot = false,
  shape = 'rounded',
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
      data-shape={shape}
      {...rest}
    >
      {dot ? <span className="sc-badge__dot" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
