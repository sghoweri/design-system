// Fallback placement for the "More" panel where CSS anchor positioning is missing. Pure: rects in, a
// viewport position out. Unit-tested in place.test.ts.

export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface PlaceInput {
  /** The toggle's viewport rect. */
  anchor: Rect;
  /** The panel's size. */
  panel: { width: number; height: number };
  /** The viewport's size. */
  viewport: { width: number; height: number };
  /** Minimum distance from every viewport edge, px. */
  gutter: number;
  /** Space between the toggle and the panel, px. */
  offset: number;
  /** Writing direction: the panel prefers the toggle's inline-end edge. */
  rtl?: boolean | undefined;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

/**
 * Mirrors the CSS: below the toggle, aligned to its inline-end edge; if that runs past the inline-start
 * side of the viewport, aligned to its inline-start edge instead; then shifted to stay inside the gutter.
 * Below the toggle unless only above has room. The width is capped by CSS, so it always fits.
 */
export function placePanel({ anchor, panel, viewport, gutter, offset, rtl = false }: PlaceInput): {
  left: number;
  top: number;
} {
  const endAligned = rtl ? anchor.left : anchor.right - panel.width;
  const startAligned = rtl ? anchor.right - panel.width : anchor.left;
  const fitsX = (x: number) => x >= gutter && x + panel.width <= viewport.width - gutter;
  const x = fitsX(endAligned) ? endAligned : fitsX(startAligned) ? startAligned : endAligned;
  const left = clamp(x, gutter, Math.max(gutter, viewport.width - gutter - panel.width));

  const below = anchor.bottom + offset;
  const above = anchor.top - offset - panel.height;
  const fitsBelow = below + panel.height <= viewport.height - gutter;
  const top = fitsBelow || above < gutter ? below : above;
  return { left, top };
}
