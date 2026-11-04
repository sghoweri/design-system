import { Progress as BaseProgress } from '@base-ui/react/progress';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Spinner } from '../Spinner/Spinner';
import { cx } from '../../utils/cx';

export type ProgressTone = 'accent' | 'success' | 'warning' | 'danger' | 'neutral';
export type ProgressSize = 'sm' | 'md';
export type ProgressVariant = 'bar' | 'inline';

export interface ProgressProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** Current value. Omit or pass `null` while the amount of work is unknown (indeterminate). */
  value?: number | null | undefined;
  /** Default 100. Pass the total so `value` can be a count: `value={460} max={859}`. */
  max?: number | undefined;
  /** Default 0. */
  min?: number | undefined;
  /** What is happening: "Verifying". Visible, and names the bar for assistive tech. */
  label?: ReactNode | undefined;
  /** Detail at the end: "460 of 859 · 3 min elapsed". A string also becomes `aria-valuetext`. */
  valueText?: ReactNode | undefined;
  /** Shows the percentage when `valueText` is not given. */
  showValue?: boolean | undefined;
  /** Fill colour. Default `accent`; `success` when done, `danger` when it failed. */
  tone?: ProgressTone | undefined;
  /** Bar thickness: `sm` 4px, `md` 8px (default). Inline uses the text size. */
  size?: ProgressSize | undefined;
  /** `bar` (default) is label, value and a track; `inline` is a Spinner beside the text for toolbars and buttons. */
  variant?: ProgressVariant | undefined;
  /** Names the bar when there is no `label`. */
  'aria-label'?: string | undefined;
}

/**
 * Says that something is processing and, when known, how far along it is. Built on Base UI's Progress:
 * `role="progressbar"` with the aria value attributes, or none while indeterminate.
 */
export function Progress({
  value,
  max = 100,
  min = 0,
  label,
  valueText,
  showValue = false,
  tone = 'accent',
  size = 'md',
  variant = 'bar',
  className,
  ...rest
}: ProgressProps) {
  const current = value ?? null;
  const hasValueText = valueText != null || (showValue && current !== null);
  return (
    <BaseProgress.Root
      value={current}
      max={max}
      min={min}
      getAriaValueText={(formatted) => (typeof valueText === 'string' ? valueText : (formatted ?? ''))}
      className={cx('sc-progress', className)}
      data-variant={variant}
      data-tone={tone}
      data-size={size}
      {...rest}
    >
      {variant === 'inline' ? <Spinner size="sm" decorative className="sc-progress__spinner" /> : null}
      {label != null ? <BaseProgress.Label className="sc-progress__label">{label}</BaseProgress.Label> : null}
      {hasValueText ? (
        <BaseProgress.Value className="sc-progress__value">
          {(formatted) => (valueText != null ? valueText : formatted)}
        </BaseProgress.Value>
      ) : null}
      {variant === 'bar' ? (
        <BaseProgress.Track className="sc-progress__track">
          <BaseProgress.Indicator className="sc-progress__indicator" />
        </BaseProgress.Track>
      ) : null}
    </BaseProgress.Root>
  );
}
