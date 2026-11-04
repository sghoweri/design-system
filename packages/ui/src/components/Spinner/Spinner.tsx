import type { ComponentPropsWithRef } from 'react';
import type { IconSize } from '../Icon/Icon';
import { cx } from '../../utils/cx';

export interface SpinnerProps extends ComponentPropsWithRef<'span'> {
  /** `xs` 12, `sm` 14, `md` 16 (default), `lg` 20, `xl` 24, or `em` to follow the font size. */
  size?: IconSize | undefined;
  /** What is happening, announced once as a status. Default "Loading". */
  label?: string | undefined;
  /** Hides it from assistive tech when the text beside it already says what is happening. */
  decorative?: boolean | undefined;
}

/** An indeterminate activity indicator in `currentColor`. Slows down, never stops, under reduced motion. */
export function Spinner({
  size = 'md',
  label = 'Loading',
  decorative = false,
  className,
  ...rest
}: SpinnerProps) {
  return (
    <span
      className={cx('sc-spinner', className)}
      data-size={size}
      role={decorative ? undefined : 'status'}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      {...rest}
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        aria-hidden="true"
        focusable="false"
      >
        <circle className="sc-spinner__track" cx="8" cy="8" r="6.25" />
        <circle className="sc-spinner__arc" cx="8" cy="8" r="6.25" strokeLinecap="round" />
      </svg>
    </span>
  );
}
