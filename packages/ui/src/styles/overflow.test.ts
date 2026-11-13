// Overflow on scroll containers: a tab row scrolls sideways only, a Select popup wraps long options instead of
// widening, and a scrolling dialog body keeps its scrollbar at the popup's edge with room for focus rings. Checked
// against the CSS itself (jsdom has no layout).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

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

describe('tab row', () => {
  const list = body('tabs.css', '.sc-tabs__list');

  it('scrolls sideways and never vertically', () => {
    expect(prop(list, 'overflow-x')).toBe('auto');
    // `overflow-x: auto` alone computes `overflow-y` to `auto`; `clip` beside a scrolling axis computes to `hidden`.
    expect(prop(list, 'overflow-y')).toMatch(/^(hidden|clip)$/);
  });

  it('keeps the baseline and the active indicator inside the scrollport', () => {
    // A border sits outside the scrollport, so an indicator laid over it overflowed by a pixel and was cut in half.
    expect(list).not.toMatch(/border-block-end:\s*var/);
    expect(prop(list, 'padding-block-end')).toBe('var(--sc-border-width-hairline)');
    expect(prop(list, 'box-shadow')).toMatch(/^inset 0 calc\(-1 \* var\(--sc-border-width-hairline\)\) 0 /);
    expect(prop(body('tabs.css', '.sc-tabs__indicator'), 'inset-block-end')).toBe('0');
  });

  it('draws the tab focus ring inside the tab', () => {
    expect(prop(body('tabs.css', '.sc-tabs__tab:focus-visible'), 'outline-offset')).toBe(
      'calc(-1 * var(--sc-border-width-focus))',
    );
  });
});

describe('select popup', () => {
  it('is at least the trigger wide and at most the measure or the room available', () => {
    const popup = body('field.css', '.sc-select__popup');
    expect(prop(popup, 'min-inline-size')).toBe('var(--anchor-width)');
    expect(prop(popup, 'max-inline-size')).toBe('min(var(--available-width), var(--sc-font-measure))');
  });

  it('wraps long option text with the check on the first line', () => {
    const text = body('field.css', '.sc-select__item-text');
    expect(prop(text, 'overflow-wrap')).toBe('anywhere');
    expect(prop(text, 'text-wrap-style')).toBe('pretty');
    expect(prop(body('field.css', '.sc-select__item'), 'align-items')).toBe('start');
    expect(prop(body('field.css', '.sc-select__indicator'), 'block-size')).toBe('1lh');
  });
});

describe('scrolling dialog body', () => {
  it.each(['sheet', 'fullscreen'])(
    '%s: pads inside the scroller and runs out by the same amount',
    (variant) => {
      const css = body('dialog.css', `.sc-dialog__popup[data-variant='${variant}'] > .sc-dialog__body`);
      expect(prop(css, 'overflow')).toBe('hidden auto');
      expect(prop(css, 'margin-inline')).toBe('calc(-1 * var(--_bleed))');
      expect(prop(css, 'padding')).toBe('var(--_ring) var(--_bleed)');
      // The bleed is the popup's own inline padding, less the safe-area part, which stays on the popup.
      expect(prop(css, '--_bleed')).toBe('var(--sc-spacing-lg)');
      expect(prop(css, 'margin-block')).toBe(
        'calc(var(--sc-spacing-md) - var(--_ring)) calc(-1 * var(--_ring))',
      );
    },
  );
});
