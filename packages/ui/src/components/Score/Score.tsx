import type { ComponentPropsWithRef, CSSProperties, ReactNode } from 'react';
import { cx } from '../../utils/cx';

export type ScoreTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
export type ScoreSize = 'sm' | 'md';
export type ScoreVariant = 'tile' | 'ring';

export interface ScoreProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  /**
   * The number shown, e.g. a fit score. Rendered as given; round it first. `null` means not scored yet: a neutral
   * tile (or an empty ring) with a dash, read as "{label}: not scored", and `tone` is ignored.
   */
  value: number | null;
  /** The top of the scale. Default 100. Fills the ring and ends the default accessible text. */
  max?: number | undefined;
  /** Colour. The system holds no thresholds: map the value to a tone in the app. Default `accent`. */
  tone?: ScoreTone | undefined;
  /** `tile` (default), a number on a tinted square, or `ring`, a donut for detail headers. */
  variant?: ScoreVariant | undefined;
  /** Tile size: `sm` 40px for list rows (default), `md` 48px. The ring is 64px. */
  size?: ScoreSize | undefined;
  /** A short word under the number: "fit". Visual only; say it in `label`. */
  caption?: ReactNode | undefined;
  /** What the number measures, read before it: "Fit score". Default "Score". */
  label?: string | undefined;
  /** The whole text assistive tech reads instead of the default "{label} {value} out of {max}" ("{label}: not scored" without a value). */
  valueText?: string | undefined;
  /** Shows the selected look (solid fill). Also on automatically inside a selected Card or an element with `aria-pressed="true"` or `aria-selected="true"`. */
  selected?: boolean | undefined;
}

/**
 * A score as a number on a tinted tile or inside a ring. The number and caption are visual; assistive tech reads one
 * visually hidden sentence ("Fit score 94 out of 100"), so the score is named without `aria-label` on a non-interactive
 * element and reads whole inside a row button. A `null` value is "not scored": a dash, no tone, no arc.
 */
export function Score({
  value,
  max = 100,
  tone = 'accent',
  variant = 'tile',
  size = 'sm',
  caption,
  label = 'Score',
  valueText,
  selected = false,
  className,
  style,
  ...rest
}: ScoreProps) {
  const scored = value !== null;
  const fraction = scored && max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  return (
    <span
      className={cx('sc-score', className)}
      data-variant={variant}
      data-size={variant === 'tile' ? size : undefined}
      data-tone={scored ? tone : undefined}
      data-unscored={scored ? undefined : true}
      data-selected={selected || undefined}
      style={
        variant === 'ring'
          ? ({ ...style, '--sc-score-fill': (fraction * 100).toFixed(2) } as CSSProperties)
          : style
      }
      {...rest}
    >
      <span className="sc-visually-hidden">
        {valueText ?? (scored ? `${label} ${value} out of ${max}` : `${label}: not scored`)}
      </span>
      {variant === 'ring' ? (
        <svg className="sc-score__ring" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
          {/* r = (64 - ring stroke 6) / 2, so the stroke sits inside the 64px box. */}
          <circle className="sc-score__track" cx="32" cy="32" r="29" pathLength={100} />
          {/* No arc at 0: a zero-length dash with round caps would still paint a dot. */}
          {fraction > 0 ? <circle className="sc-score__arc" cx="32" cy="32" r="29" pathLength={100} /> : null}
        </svg>
      ) : null}
      <span className="sc-score__body" aria-hidden="true">
        <span className="sc-score__value">{scored ? value : '–'}</span>
        {caption != null ? <span className="sc-score__caption">{caption}</span> : null}
      </span>
    </span>
  );
}
