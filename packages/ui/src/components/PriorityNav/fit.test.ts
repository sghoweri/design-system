import { fitCount, inlineFlags } from './fit';

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
