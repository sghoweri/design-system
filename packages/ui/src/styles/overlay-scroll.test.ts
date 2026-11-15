// The default Dialog and Popover scroll in an inner wrapper (`.sc-dialog__scroll`, `.sc-popover__scroll`) that runs
// out over the popup's padding and pads itself back, so the content stays put while an overlay scrollbar thumb sits
// centred in the side padding: its centre half the padding from the popup's edge. Checked against the CSS itself and
// the built spacing tokens (jsdom has no layout).
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const tokens = JSON.parse(
  readFileSync(createRequire(import.meta.url).resolve('@salemcobalt/tokens/json'), 'utf8'),
) as Record<'light', Record<string, string>>;

const read = (file: string) => readFileSync(join(__dirname, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const rules = (file: string) =>
  [...read(file).matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
    selectors: m[1]!.split(',').map((s) => s.trim().replace(/\s+/g, ' ')),
    body: m[2]!,
  }));
const body = (file: string, selector: string) =>
  rules(file)
    .filter((r) => r.selectors.includes(selector))
    .map((r) => r.body)
    .join('\n');
const prop = (css: string, name: string) =>
  [...css.matchAll(new RegExp(`(?:^|[;\\s])${name}:\\s*([^;]+);`, 'g'))].map((m) => m[1]!.trim()).at(-1);

/** Resolves a px length built from spacing tokens and the scroller's own `--_*` properties. */
function px(value: string, local: string): number {
  const expr = value
    .replace(/var\((--_[\w-]+)\)/g, (_, name: string) => `(${px(prop(local, name)!, local)})`)
    .replace(/var\(--(sc-[\w-]+)\)/g, (_, name: string) => tokens.light[name]!)
    .replace(/calc\(/g, '(')
    .replace(/px/g, '');
  if (!/^[\d\s.+\-*/()]+$/.test(expr)) throw new Error(`unresolved: ${value} → ${expr}`);
  return Function(`return ${expr}`)() as number;
}

describe.each([
  {
    name: 'default Dialog',
    file: 'dialog.css',
    popup: ".sc-dialog__popup[data-variant='dialog']",
    base: '.sc-dialog__popup',
    scroller: '.sc-dialog__scroll',
    close: '.sc-dialog__close',
    pad: 'var(--sc-spacing-lg)',
    padPx: 24,
    bleedPx: 17,
  },
  {
    name: 'Popover',
    file: 'popover.css',
    popup: '.sc-popover',
    base: '.sc-popover',
    scroller: '.sc-popover__scroll',
    close: '.sc-popover__close',
    pad: 'var(--sc-spacing-md)',
    padPx: 16,
    bleedPx: 13,
  },
])('$name', ({ file, popup, base, scroller, close, pad, padPx, bleedPx }) => {
  const popupCss = body(file, popup);
  const css = body(file, scroller);

  it('stops the popup scrolling and lets the inner wrapper fill it and scroll, vertically only', () => {
    expect(prop(popupCss, 'overflow')).toBe('hidden');
    expect(prop(popupCss, 'display')).toBe('flex');
    expect(prop(popupCss, 'flex-direction')).toBe('column');
    expect(prop(css, 'overflow')).toBe('hidden auto');
    expect(prop(css, 'overscroll-behavior')).toBe('contain');
    expect(prop(css, 'flex')).toBe('1 1 auto');
    expect(prop(css, 'min-block-size')).toBe('0');
  });

  it("runs out over the popup's padding and pads back by the same amounts, so the content does not move", () => {
    // The margins undo exactly the padding the popup has, so the two must change together.
    expect(prop(body(file, base), 'padding')).toBe(pad);
    expect(prop(css, 'margin')).toBe(`calc(-1 * ${pad}) calc(-1 * var(--_bleed))`);
    expect(prop(css, 'padding')).toBe(`${pad} var(--_bleed)`);
  });

  it("centres an overlay thumb in the side padding: half the padding from the popup's edge", () => {
    expect(prop(css, '--_thumb')).toBe('6px');
    expect(prop(css, '--_thumb-inset')).toBe('2px');
    expect(prop(css, '--_bleed')).toBe(`calc(${pad} / 2 + var(--_thumb) / 2 + var(--_thumb-inset))`);
    const bleed = px('var(--_bleed)', css);
    expect(bleed).toBe(bleedPx);
    const scrollerEdge = padPx - bleed; // the scroller's inline edges, in from the popup's padding edge
    expect(scrollerEdge).toBeGreaterThanOrEqual(0);
    const thumbCentre = scrollerEdge + px('var(--_thumb-inset)', css) + px('var(--_thumb)', css) / 2;
    expect(thumbCentre).toBe(padPx / 2);
  });

  it('keeps the × in its corner: placed against the scroller, so it still scrolls away with the title', () => {
    expect(prop(css, 'position')).toBe('relative');
    const own = prop(body(file, close), 'inset-inline-end')!;
    const inScroller = prop(body(file, `${scroller} > ${close}`), 'inset-inline-end')!;
    const scrollerEdge = padPx - px('var(--_bleed)', css);
    expect(px(inScroller, css) + scrollerEdge).toBe(px(own, css));
    // The scroller's block edges are the popup's padding edges, so the × keeps its block offset as is.
    expect(prop(body(file, `${scroller} > ${close}`), 'inset-block-start')).toBeUndefined();
  });
});

describe('Popover with an arrow', () => {
  it('still does not clip the arrow; the wrapper inside scrolls instead', () => {
    expect(prop(body('popover.css', '.sc-popover:has(> .sc-popover__arrow)'), 'overflow')).toBe('visible');
  });
});
