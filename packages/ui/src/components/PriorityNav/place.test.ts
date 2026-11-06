import { placePanel, type Rect } from './place';

const viewport = { width: 390, height: 844 };
const panel = { width: 200, height: 160 };
const at = (left: number, top = 10, width = 80, height = 32): Rect => ({
  left,
  top,
  right: left + width,
  bottom: top + height,
});
const base = { panel, viewport, gutter: 16, offset: 4 };

describe('placePanel', () => {
  it('sits below the toggle, aligned to its inline-end edge, when that fits', () => {
    // Toggle 250–330: end-aligned left = 330 - 200 = 130.
    expect(placePanel({ ...base, anchor: at(250) })).toEqual({ left: 130, top: 46 });
  });

  it('flips to the inline-start edge near the left of the viewport', () => {
    // End-aligned would be 100 - 200 = -100; start-aligned 20 fits.
    expect(placePanel({ ...base, anchor: at(20) })).toEqual({ left: 20, top: 46 });
  });

  it('shifts inside the gutter when neither edge fits', () => {
    expect(placePanel({ ...base, anchor: at(4) }).left).toBe(16);
    expect(placePanel({ ...base, viewport: { width: 240, height: 844 }, anchor: at(150) }).left).toBe(24);
  });

  it('mirrors in right-to-left: prefers the toggle’s left edge, flips to its right edge', () => {
    expect(placePanel({ ...base, rtl: true, anchor: at(20) })).toEqual({ left: 20, top: 46 });
    // Toggle 280–360: left-aligned 280 overflows (280 + 200 > 374); right-aligned 360 - 200 = 160 fits.
    expect(placePanel({ ...base, rtl: true, anchor: at(280) }).left).toBe(160);
  });

  it('opens above only when below has no room and above does', () => {
    expect(placePanel({ ...base, anchor: at(250, 760) }).top).toBe(760 - 4 - 160);
    // Neither fits (short viewport): stays below; CSS caps the height and the panel scrolls.
    expect(placePanel({ ...base, viewport: { width: 390, height: 200 }, anchor: at(250, 60) }).top).toBe(96);
  });

  it('pins to the gutter when the panel is wider than the viewport allows', () => {
    expect(placePanel({ ...base, panel: { width: 400, height: 100 }, anchor: at(250) }).left).toBe(16);
  });
});
