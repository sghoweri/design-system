import { createElement, type ComponentPropsWithRef, type ReactNode } from 'react';
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon } from '../../icons/icons.gen';
import { cx } from '../../utils/cx';

export type StatTrend = 'up' | 'down' | 'flat';
export type StatDeltaTone = 'positive' | 'negative' | 'neutral';
export type StatElement = 'div' | 'li' | 'article';
export type StatVariant = 'outlined' | 'filled' | 'plain';
export type StatSize = 'sm' | 'md';

export interface StatProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** What the number is: "Applications", "Reply rate". */
  label: ReactNode;
  /** The number, already formatted: "1,204", "37%". */
  value: ReactNode;
  /** The change beside the value: "+12", "−3.1 pts", "same as last week". */
  delta?: ReactNode | undefined;
  /** Colour of the delta: `positive` green, `negative` red, `neutral` muted (default). Say which is good; up is not always good. */
  deltaTone?: StatDeltaTone | undefined;
  /** Arrow before the delta. */
  trend?: StatTrend | undefined;
  /** Muted line under the value: "last 7 days", "of 2,000 budget". */
  hint?: ReactNode | undefined;
  /** A 20px icon in the corner. Decorative. */
  icon?: ReactNode | undefined;
  /** `outlined` surface (default), `filled` inset, `plain` no surface for a row of stats inside a Card. */
  variant?: StatVariant | undefined;
  /** `md` (default) or `sm` for dense rows. */
  size?: StatSize | undefined;
  /** Element to render; `li` in a list of stats. */
  as?: StatElement | undefined;
}

const trendIcons: Record<StatTrend, ReactNode> = {
  up: <ArrowUpIcon size="xs" />,
  down: <ArrowDownIcon size="xs" />,
  flat: <ArrowRightIcon size="xs" />,
};

/** One number with its label: a KPI tile. The value is text, so it reads as "Applications, 1,204, up 12". */
export function Stat({
  label,
  value,
  delta,
  deltaTone = 'neutral',
  trend,
  hint,
  icon,
  variant = 'outlined',
  size = 'md',
  as = 'div',
  className,
  ...rest
}: StatProps) {
  return createElement(
    as,
    {
      className: cx('sc-stat', className),
      'data-variant': variant,
      'data-size': size,
      ...rest,
    },
    <>
      <div className="sc-stat__label">{label}</div>
      {icon ? (
        <span className="sc-stat__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <div className="sc-stat__value">{value}</div>
      {delta != null ? (
        <div className="sc-stat__delta" data-tone={deltaTone}>
          {trend ? (
            <span className="sc-stat__trend" aria-hidden="true">
              {trendIcons[trend]}
            </span>
          ) : null}
          {trend ? (
            <span className="sc-visually-hidden">{trend === 'flat' ? 'unchanged' : trend} </span>
          ) : null}
          {delta}
        </div>
      ) : null}
      {hint != null ? <div className="sc-stat__hint">{hint}</div> : null}
    </>,
  );
}
