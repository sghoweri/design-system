import { SHEET_SWIPE, dragIntent, releaseVelocity, shouldDismissSheet } from './sheetSwipe';

describe('dragIntent', () => {
  it('stays pending inside the slop, so a tap is still a tap', () => {
    expect(dragIntent(0, 0)).toBe('pending');
    expect(dragIntent(5, 5)).toBe('pending');
    expect(dragIntent(-5, -5)).toBe('pending');
  });

  it('becomes a drag once the press moves mostly downward past the slop', () => {
    expect(dragIntent(0, SHEET_SWIPE.slop)).toBe('drag');
    expect(dragIntent(10, 10)).toBe('drag');
  });

  it('gives up on a sideways or upward move', () => {
    expect(dragIntent(12, 6)).toBe('cancel');
    expect(dragIntent(0, -8)).toBe('cancel');
    expect(dragIntent(-20, 4)).toBe('cancel');
  });
});

describe('releaseVelocity', () => {
  it('is 0 with fewer than two samples', () => {
    expect(releaseVelocity([])).toBe(0);
    expect(releaseVelocity([{ t: 0, y: 100 }])).toBe(0);
  });

  it('measures px per ms over the recent window, positive downward', () => {
    expect(
      releaseVelocity([
        { t: 0, y: 0 },
        { t: 50, y: 40 },
        { t: 100, y: 80 },
      ]),
    ).toBeCloseTo(0.8);
    expect(
      releaseVelocity([
        { t: 0, y: 200 },
        { t: 40, y: 160 },
      ]),
    ).toBeCloseTo(-1);
  });

  it('ignores samples older than the window', () => {
    const samples = [
      { t: 0, y: 0 },
      { t: 10, y: 300 },
      { t: 400, y: 300 },
      { t: 450, y: 310 },
    ];
    expect(releaseVelocity(samples)).toBeCloseTo(0.2);
  });

  it('reads 0 when the finger stopped before lifting', () => {
    expect(
      releaseVelocity([
        { t: 0, y: 0 },
        { t: 50, y: 200 },
        { t: 400, y: 200 },
      ]),
    ).toBe(0);
  });
});

describe('shouldDismissSheet', () => {
  const height = 500;

  it('springs back below 30% of the height when released slowly', () => {
    expect(shouldDismissSheet({ offset: 149, height, velocity: 0.1 })).toBe(false);
    expect(shouldDismissSheet({ offset: 0, height, velocity: 0 })).toBe(false);
  });

  it('dismisses at or past 30% of the height', () => {
    expect(shouldDismissSheet({ offset: 150, height, velocity: 0 })).toBe(true);
    expect(shouldDismissSheet({ offset: 400, height, velocity: 0.2 })).toBe(true);
  });

  it('dismisses on a quick downward flick at any distance', () => {
    expect(shouldDismissSheet({ offset: 20, height, velocity: SHEET_SWIPE.velocity })).toBe(true);
    expect(shouldDismissSheet({ offset: 20, height, velocity: 2 })).toBe(true);
  });

  it('stays open when flicked back up, even past the threshold', () => {
    expect(shouldDismissSheet({ offset: 300, height, velocity: -SHEET_SWIPE.velocity })).toBe(false);
  });

  it('never dismisses without a downward offset or a measured height', () => {
    expect(shouldDismissSheet({ offset: 0, height, velocity: 3 })).toBe(false);
    expect(shouldDismissSheet({ offset: 200, height: 0, velocity: 0 })).toBe(false);
  });
});
