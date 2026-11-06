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

/** Sub-pixel slack: measured widths are fractional and a row that fits exactly must not flip to "More". */
const EPSILON = 0.5;

/**
 * How many of the non-current items stay inline, counted in order. Every item fits: all of them.
 * Otherwise room is made for the "More" item and the current item first, then items are added in order
 * until the next one does not fit. The run stays contiguous (a short item after a long one does not jump
 * the queue), so the row reads as the start of the list, plus the current page.
 */
export function fitCount({ widths, current, available, more, gap }: FitInput): number {
  const n = widths.length;
  const hasCurrent = current >= 0 && current < n;
  const others = hasCurrent ? n - 1 : n;
  let total = 0;
  for (const w of widths) total += w;
  if (n > 1) total += gap * (n - 1);
  if (total <= available + EPSILON) return others;

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
