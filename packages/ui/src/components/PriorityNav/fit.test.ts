import { fitCount, inlineFlags, isOverflowing } from './fit';

// Six items: 64 120 72 64 88 88 (sum 496). "More" is 72 wide.
const widths = [64, 120, 72, 64, 88, 88];

describe('fitCount', () => {
  it('keeps everything inline when the whole row fits, without reserving room for "More"', () => {
    expect(fitCount({ widths, current: -1, available: 496, more: 72, gap: 0 })).toBe(6);
    expect(fitCount({ widths, current: 2, available: 600, more: 72, gap: 0 })).toBe(5);
  });

  it('tolerates sub-pixel rounding at the exact fit', () => {
    expect(fitCount({ widths, current: -1, available: 495.6, more: 72, gap: 0 })).toBe(6);
  });

  it('reserves room for "More" once anything overflows, and keeps a contiguous run', () => {
    // 72 + 64 + 120 = 256 fits in 300; + 72 = 328 does not.
    expect(fitCount({ widths, current: -1, available: 300, more: 72, gap: 0 })).toBe(2);
    // The third item (72) does not fit in 495, and the shorter fourth (64) must not jump the queue.
    expect(fitCount({ widths, current: -1, available: 330, more: 72, gap: 0 })).toBe(3);
  });

  it('counts the gap between every pair, including before "More"', () => {
    // Items: 64 + 8 + 120 + 8 + more 72 = 272.
    expect(fitCount({ widths, current: -1, available: 272, more: 72, gap: 8 })).toBe(2);
    expect(fitCount({ widths, current: -1, available: 271, more: 72, gap: 8 })).toBe(1);
  });

  it('reserves the current item first, so it is never pushed out', () => {
    // Current is the last item (88): 72 + 88 = 160, + 64 = 224, + 120 = 344 > 300.
    expect(fitCount({ widths, current: 5, available: 300, more: 72, gap: 0 })).toBe(1);
    // With gaps: 72 + 88 + 4 = 164, + 64 + 4 = 232, + 120 + 4 = 356 > 300.
    expect(fitCount({ widths, current: 5, available: 300, more: 72, gap: 4 })).toBe(1);
  });

  it('collapses everything but the current item at phone widths, and returns 0 when even that does not fit', () => {
    expect(fitCount({ widths, current: 1, available: 200, more: 72, gap: 0 })).toBe(0);
    expect(fitCount({ widths, current: 1, available: 100, more: 72, gap: 0 })).toBe(0);
    expect(fitCount({ widths, current: -1, available: 50, more: 72, gap: 0 })).toBe(0);
  });

  it('handles an empty list and ignores an out-of-range current index', () => {
    expect(fitCount({ widths: [], current: -1, available: 0, more: 72, gap: 0 })).toBe(0);
    expect(fitCount({ widths: [50, 50], current: 7, available: 100, more: 72, gap: 0 })).toBe(2);
  });
});

describe('inlineFlags', () => {
  it('marks the first `count` non-current items and the current one', () => {
    expect(inlineFlags(6, -1, 2)).toEqual([true, true, false, false, false, false]);
    expect(inlineFlags(6, 5, 1)).toEqual([true, false, false, false, false, true]);
    expect(inlineFlags(6, 1, 2)).toEqual([true, true, true, false, false, false]);
    expect(inlineFlags(3, -1, 3)).toEqual([true, true, true]);
    expect(inlineFlags(0, -1, 0)).toEqual([]);
  });
});

describe('isOverflowing', () => {
  const total = 496; // the six widths above, no gap

  it('starts as soon as the items do not all fit', () => {
    expect(isOverflowing({ widths, gap: 0, available: total, was: false, hysteresis: 80 })).toBe(false);
    expect(isOverflowing({ widths, gap: 0, available: total - 1, was: false, hysteresis: 80 })).toBe(true);
  });

  it('once started, ends only when every item fits with the hysteresis to spare', () => {
    expect(isOverflowing({ widths, gap: 0, available: total + 79, was: true, hysteresis: 80 })).toBe(true);
    expect(isOverflowing({ widths, gap: 0, available: total + 80, was: true, hysteresis: 80 })).toBe(false);
    expect(isOverflowing({ widths, gap: 0, available: total + 10, was: true, hysteresis: 0 })).toBe(false);
  });

  it('does not oscillate when the header gives the row more room on overflow', () => {
    // A header of width W: the row gets W - 120 with the full "Add item [N]" button, W - 40 icon-only.
    const full = 120;
    const icon = 40;
    const settle = (W: number, hysteresis: number) => {
      let overflowing = false;
      const seen: boolean[] = [];
      for (let frame = 0; frame < 6; frame++) {
        const available = W - (overflowing ? icon : full);
        overflowing = isOverflowing({ widths, gap: 0, available, was: overflowing, hysteresis });
        seen.push(overflowing);
      }
      return seen;
    };
    // Without hysteresis, W = 580 flips every frame: 460 overflows, 540 fits, 460 overflows …
    expect(settle(580, 0)).toEqual([true, false, true, false, true, false]);
    // With the label's width as hysteresis it settles collapsed …
    expect(settle(580, full - icon)).toEqual([true, true, true, true, true, true]);
    // … and comes back only when the full button fits beside every link.
    expect(settle(full + total, full - icon)).toEqual([false, false, false, false, false, false]);
  });
});
