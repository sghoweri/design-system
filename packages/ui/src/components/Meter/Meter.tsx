import { Meter as BaseMeter } from '@base-ui/react/meter';
import type { ComponentPropsWithRef, CSSProperties, ReactNode } from 'react';
import { cx } from '../../utils/cx';

export type MeterTone = 'accent' | 'success' | 'warning' | 'danger' | 'neutral';
export type MeterSize = 'sm' | 'md';
export type MeterLayout = 'stacked' | 'inline';

/** A part of the amount, drawn solid from the start of the bar while the rest of the fill is hatched. */
export interface MeterMark {
  /** How much of `value` it is, on the same scale ("12" strong leads of 40 found first). */
  value: number;
  /** What it is, as read aloud after the value text: "12 strong leads". */
  label: string;
}

export interface MeterProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** What is counted: "Fetched", "Shown". Names the meter; visually hidden in the `inline` layout. */
  label: ReactNode;
  /** The amount, from 0 to `max`. A share is `value={0.28} max={1}`. */
  value: number;
  /** The scale's top. Default 100. In a funnel, every row takes the first step's count so the bars compare. */
  max?: number | undefined;
  /**
   * The amount as people read it: "1,204", "340 · 28% kept". Shown at the end, and a string is also
   * `aria-valuetext`. Default: the value, formatted for the locale.
   */
  valueText?: ReactNode | undefined;
  /** A part of the value, solid while the rest is hatched. Its label is added to `aria-valuetext`. */
  mark?: MeterMark | undefined;
  /** Fill colour. Default `accent`. Every fill is ≥ 3:1 against the track and every surface in both themes. */
  tone?: MeterTone | undefined;
  /** Bar thickness: `sm` 8px (table cells), `md` 12px (default, funnel rows). */
  size?: MeterSize | undefined;
  /**
   * `stacked` (default): label and value above a full-width bar, so rows line up in a funnel. `inline`: value then
   * bar on one line with the label visually hidden, for a table cell whose column header says what it is.
   */
  layout?: MeterLayout | undefined;
}

const percent = (v: number, max: number) => (max > 0 ? Math.min(100, Math.max(0, (v / max) * 100)) : 0);

/**
 * A static amount on a bar: a count, a share, a funnel step. Not progress: it is `role="meter"` (Base UI Meter)
 * with `aria-valuenow`/`min`/`max`/`valuetext`, never a progressbar. The value text is always visible, so the bar
 * is never the only carrier of the number.
 */
export function Meter({
  label,
  value,
  max = 100,
  valueText,
  mark,
  tone = 'accent',
  size = 'md',
  layout = 'stacked',
  className,
  style,
  ...rest
}: MeterProps) {
  const markAt = mark ? percent(Math.min(mark.value, value), max) : null;
  const ariaValueText = (formatted: string) => {
    const base = typeof valueText === 'string' ? valueText : formatted;
    return mark ? `${base}; ${mark.label}` : base;
  };
  return (
    <BaseMeter.Root
      value={value}
      max={max}
      format={{ maximumFractionDigits: 2 }}
      getAriaValueText={ariaValueText}
      className={cx('sc-meter', className)}
      data-tone={tone}
      data-size={size}
      data-layout={layout}
      data-marked={mark ? true : undefined}
      style={markAt === null ? style : ({ ...style, '--_mark': `${markAt}%` } as CSSProperties)}
      {...rest}
    >
      <BaseMeter.Label className={layout === 'inline' ? 'sc-visually-hidden' : 'sc-meter__label'}>
        {label}
      </BaseMeter.Label>
      <BaseMeter.Value className="sc-meter__value">
        {(formatted) => (valueText != null ? valueText : formatted)}
      </BaseMeter.Value>
      <BaseMeter.Track className="sc-meter__track">
        <BaseMeter.Indicator className="sc-meter__fill" />
        {mark ? <span className="sc-meter__mark" title={mark.label} aria-hidden="true" /> : null}
      </BaseMeter.Track>
    </BaseMeter.Root>
  );
}
