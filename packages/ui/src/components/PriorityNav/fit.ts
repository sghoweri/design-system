// Pure layout arithmetic for PriorityNav: no DOM, unit-tested in fit.test.ts.

export interface FitInput {
  /** Measured inline size of each item, in order, px. */
  widths: readonly number[];
  /** Index of the current item, or -1. It is always kept inline. */
  current: number;
  /** Inline size of the row, px. */
  available: number;
  /** Inline size of the "More" item, px. */
  more: number;
  /** Gap between items, px. */
  gap: number;
}

/**
 * Float slack only, smaller than a layout unit (1/64 px in Chromium and WebKit, 1/60 in Firefox). Widths are
 * exact fractional layout sizes, so a row that fits exactly still sums to `available`. Anything looser lets a
 * row that is a fraction of a pixel too wide count as fitting, and the current link, the one item that may
 * shrink, absorbs the overrun and shows its ellipsis ("Inb…") at that width.
 */
const EPSILON = 0.01;

/**
 * How many of the non-current items stay inline, counted in order. Every item fits: all of them.
 * Otherwise room is made for the "More" item and the current item first, then items are added in order
 * until the next one does not fit. The run stays contiguous (a short item after a long one does not jump
 * the queue), so the row reads as the start of the list, plus the current page.
 */
/** The inline size of every item in one row, gaps included. */
export function rowWidth(widths: readonly number[], gap: number): number {
  let total = 0;
  for (const w of widths) total += w;
  return widths.length > 1 ? total + gap * (widths.length - 1) : total;
}

export function fitCount({ widths, current, available, more, gap }: FitInput): number {
  const n = widths.length;
  const hasCurrent = current >= 0 && current < n;
  const others = hasCurrent ? n - 1 : n;
  if (rowWidth(widths, gap) <= available + EPSILON) return others;

  let used = more + (hasCurrent ? widths[current]! + gap : 0);
  let count = 0;
  for (let i = 0; i < n; i++) {
    if (i === current) continue;
    const next = used + widths[i]! + gap;
    if (next > available + EPSILON) break;
    used = next;
    count++;
  }
  return count;
}

/**
 * Which items are inline, given `fitCount`'s answer: the first `count` non-current items, plus the
 * current one wherever it sits. Everything else goes into "More", in its original order.
 */
export function inlineFlags(length: number, current: number, count: number): boolean[] {
  const flags: boolean[] = [];
  let seen = 0;
  for (let i = 0; i < length; i++) {
    if (i === current) flags.push(true);
    else flags.push(seen++ < count);
  }
  return flags;
}

export interface OverflowInput {
  widths: readonly number[];
  gap: number;
  available: number;
  /** The previous answer. */
  was: boolean;
  /** Extra room required, beyond fitting every item, before an overflowing row reports that it fits again. */
  hysteresis: number;
}

/**
 * Whether the row reports `overflowing`, with hysteresis. It starts as soon as the items do not all fit.
 * Once started, it ends only when every item fits with `hysteresis` px to spare: when a header reacts to
 * overflow by giving the row more room (an action button drops its label), the row then fits, and without
 * the margin it would report "fits", the label would come back, and the row would overflow again.
 */
export function isOverflowing({ widths, gap, available, was, hysteresis }: OverflowInput): boolean {
  const total = rowWidth(widths, gap);
  return was ? total + Math.max(0, hysteresis) > available + EPSILON : total > available + EPSILON;
}
