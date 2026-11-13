import { Progress as BaseProgress } from '@base-ui/react/progress';
import type { ComponentPropsWithRef, CSSProperties, ReactNode } from 'react';
import { Spinner } from '../Spinner/Spinner';
import { cx } from '../../utils/cx';

export type ProgressTone = 'accent' | 'success' | 'warning' | 'danger' | 'neutral';
export type ProgressSize = 'sm' | 'md';
export type ProgressVariant = 'bar' | 'inline' | 'ring';

/** A threshold on the bar: where something changes ("Haiku only" at 80% of a budget). */
export interface ProgressMark {
  /** Where the tick sits, on the same scale as `value`. */
  value: number;
  /** What happens there. Read in `aria-valuetext` ("Haiku only at 80%") and shown as the tick's tooltip. */
  label?: string | undefined;
}

export interface ProgressProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** Current value. Omit or pass `null` while the amount of work is unknown (indeterminate). */
  value?: number | null | undefined;
  /** Default 100. Pass the total so `value` can be a count: `value={460} max={859}`. */
  max?: number | undefined;
  /** Default 0. */
  min?: number | undefined;
  /** What is happening: "Verifying". Visible, and names the bar for assistive tech. The ring keeps it visually hidden. */
  label?: ReactNode | undefined;
  /** Detail at the end: "460 of 859 · 3 min elapsed". A string also becomes `aria-valuetext`. The ring doesn't draw it. */
  valueText?: ReactNode | undefined;
  /** Shows the percentage when `valueText` is not given. */
  showValue?: boolean | undefined;
  /** Fill colour. Default `accent`; `success` when done, `danger` when it failed. */
  tone?: ProgressTone | undefined;
  /** Bar thickness: `sm` 4px, `md` 8px (default). Ring diameter: `sm` 36px, `md` 48px. Inline uses the text size. */
  size?: ProgressSize | undefined;
  /**
   * `bar` (default) is label, value and a track; `inline` is a Spinner beside the text for toolbars and buttons;
   * `ring` is a gauge with `children` in the centre, for a count beside a title.
   */
  variant?: ProgressVariant | undefined;
  /**
   * Bar only: ticks that reach past the track at thresholds. Each label is added to `aria-valuetext`, so a mark is
   * never shown by its tick alone.
   */
  marks?: readonly ProgressMark[] | undefined;
  /** Ring only: the centre, e.g. "2/5". Decorative; say the same in `valueText` or `aria-label`. */
  children?: ReactNode | undefined;
  /** Names the bar when there is no `label`. */
  'aria-label'?: string | undefined;
}

/** The ring's diameter per size, in the SVG's own px (the viewBox is the token's diameter). */
const RING = { sm: 36, md: 48 } as const;
/** size.progress.ring-stroke: r = (diameter - stroke) / 2 keeps the stroke inside the box. */
const RING_STROKE = 4;

const percent = (v: number, min: number, max: number) =>
  max > min ? Math.min(100, Math.max(0, ((v - min) / (max - min)) * 100)) : 0;

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
  marks,
  children,
  className,
  ...rest
}: ProgressProps) {
  const current = value ?? null;
  const ring = variant === 'ring';
  const hasValueText = !ring && (valueText != null || (showValue && current !== null));
  const shownMarks = variant === 'bar' && current !== null ? (marks ?? []) : [];
  const markText = shownMarks
    .filter((m) => m.label)
    .map((m) => `${m.label} at ${Math.round(percent(m.value, min, max))}%`)
    .join('; ');
  const ariaValueText = (formatted: string | null) => {
    const base = typeof valueText === 'string' ? valueText : (formatted ?? '');
    return markText ? (base ? `${base}; ${markText}` : markText) : base;
  };
  return (
    <BaseProgress.Root
      value={current}
      max={max}
      min={min}
      getAriaValueText={ariaValueText}
      className={cx('sc-progress', className)}
      data-variant={variant}
      data-tone={tone}
      data-size={size}
      data-marked={shownMarks.length ? true : undefined}
      {...rest}
    >
      {variant === 'inline' ? <Spinner size="sm" decorative className="sc-progress__spinner" /> : null}
      {label != null ? (
        <BaseProgress.Label className={ring ? 'sc-visually-hidden' : 'sc-progress__label'}>
          {label}
        </BaseProgress.Label>
      ) : null}
      {hasValueText ? (
        <BaseProgress.Value className="sc-progress__value">
          {(formatted) => (valueText != null ? valueText : formatted)}
        </BaseProgress.Value>
      ) : null}
      {variant === 'bar' ? (
        <BaseProgress.Track className="sc-progress__track">
          <BaseProgress.Indicator className="sc-progress__indicator" />
          {shownMarks.map((m, i) => (
            <span
              key={i}
              className="sc-progress__mark"
              title={m.label}
              aria-hidden="true"
              style={{ '--_at': `${percent(m.value, min, max)}%` } as CSSProperties}
            />
          ))}
        </BaseProgress.Track>
      ) : null}
      {ring ? (
        <Ring size={size} fraction={current === null ? null : percent(current, min, max)} centre={children} />
      ) : null}
    </BaseProgress.Root>
  );
}

function Ring({
  size,
  fraction,
  centre,
}: {
  size: ProgressSize;
  fraction: number | null;
  centre: ReactNode;
}) {
  const d = RING[size];
  const c = d / 2;
  const r = (d - RING_STROKE) / 2;
  return (
    <>
      <svg className="sc-progress__ring" viewBox={`0 0 ${d} ${d}`} aria-hidden="true" focusable="false">
        <circle className="sc-progress__ring-track" cx={c} cy={c} r={r} pathLength={100} />
        {/* No arc at 0: a zero-length dash with round caps would still paint a dot. Indeterminate spins a quarter. */}
        {fraction === null || fraction > 0 ? (
          <circle
            className="sc-progress__ring-arc"
            cx={c}
            cy={c}
            r={r}
            pathLength={100}
            data-indeterminate={fraction === null || undefined}
            style={{ '--_pct': (fraction ?? 25).toFixed(2) } as CSSProperties}
          />
        ) : null}
      </svg>
      {centre != null ? (
        <span className="sc-progress__centre" aria-hidden="true">
          {centre}
        </span>
      ) : null}
    </>
  );
}
