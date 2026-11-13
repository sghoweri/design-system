// A Button's shortcut hint is a Kbd in the button's own colour, its text and border (currentColor) both drawn at the
// hint's opacity over the button's fill. It meets WCAG AA in both themes on every variant, at rest, hovered, pressed
// and with its popup open: 4.5:1 for the key, which also clears 3:1 for its border. The fills, text colours, filters
// and the hint's opacity are read from button.css (jsdom has no cascade), the colours from the built tokens, so a new
// variant, a new fill or a dimmer hint is checked here. Disabled buttons are exempt (WCAG 1.4.3 inactive components).
// Light primary measured 3.2:1 when every variant dimmed the hint to 0.72.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const tokens = JSON.parse(
  readFileSync(createRequire(import.meta.url).resolve('@salemcobalt/tokens/json'), 'utf8'),
) as Record<'light' | 'dark', Record<string, string>>;

const css = readFileSync(join(__dirname, 'button.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
  selectors: m[1]!.split(',').map((s) => s.trim().replace(/\s+/g, ' ')),
  body: m[2]!,
}));
/** The last value `prop` gets in a rule naming exactly `selector`. */
const decl = (selector: string, prop: string) =>
  rules
    .filter((r) => r.selectors.includes(selector))
    .map((r) => new RegExp(`(?:^|;)\\s*${prop}:\\s*([^;]+);`).exec(r.body)?.[1]?.trim())
    .filter(Boolean)
    .at(-1);

function rgb(hex: string): number[] {
  const n = parseInt(hex.slice(1, 7), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function luminance(c: number[]): number {
  const [r, g, b] = c.map((v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: number[], b: number[]): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (l1 + 0.05) / (l2 + 0.05);
}
/** The hint over its fill: opacity blends the key into the fill, a brightness() filter scales both. */
function hintRatio(fg: string, bg: string, opacity: number, brightness: number): number {
  const fill = rgb(bg).map((v) => v * brightness);
  const key = rgb(fg).map((v, i) => (opacity * v + (1 - opacity) * rgb(bg)[i]!) * brightness);
  return contrast(key, fill);
}

const token = (value: string | undefined) => /^var\(--sc-color-([a-z-]+)\)$/.exec(value ?? '')?.[1];
// A transparent button shows the surface under it; a wash token is repointed to its raised twin on raised surfaces.
const PAGE = ['surface-canvas', 'surface-default', 'surface-raised', 'surface-sunken'];
const RAISED: Record<string, string> = {
  'surface-hover': 'surface-raised-hover',
  'surface-active': 'surface-raised-active',
};
const backdrops = (background: string) =>
  background === 'transparent'
    ? PAGE
    : [token(background)!, ...(RAISED[token(background)!] ? [RAISED[token(background)!]!] : [])];

const DIM = '.sc-button__shortcut .sc-kbd';
const variants = [...new Set([...css.matchAll(/\.sc-button\[data-variant='(\w+)'\]/g)].map((m) => m[1]!))];

type Case = { name: string; fg: string; backgrounds: string[]; opacity: number; brightness: number };
const cases: Case[] = [];
for (const v of variants) {
  const base = `.sc-button[data-variant='${v}']`;
  const fg = token(decl(base, 'color'))!;
  const opacity = Number(decl(`${base} > ${DIM}`, 'opacity') ?? decl(DIM, 'opacity') ?? 1);
  const rest = decl(base, 'background')!;
  const states: Array<[string, string]> = [
    ['rest', base],
    ['hover', `${base}:hover:where(:not(:disabled))`],
    ['active', `${base}:active:where(:not(:disabled))`],
    ['popup open', `${base}[data-popup-open]`],
  ];
  for (const [state, selector] of states) {
    const background =
      decl(selector, 'background') ??
      (state === 'popup open' ? decl('.sc-button[data-popup-open]', 'background') : rest)!;
    const brightness = Number(/brightness\(([\d.]+)\)/.exec(decl(selector, 'filter') ?? '')?.[1] ?? 1);
    cases.push({ name: `${v} ${state}`, fg, backgrounds: backdrops(background), opacity, brightness });
  }
}
// Secondary and ghost on the .sc-on-accent scope's fill (base.css): text.on-accent on accent default, hover, active.
for (const scope of ['.sc-on-accent', ".sc-toast[data-tone='accent']"]) {
  cases.push({
    name: `secondary and ghost in ${scope}`,
    fg: 'text-on-accent',
    backgrounds: ['accent-default', 'accent-hover', 'accent-active'],
    opacity: Number(decl(`${scope} ${DIM}`, 'opacity') ?? decl(DIM, 'opacity') ?? 1),
    brightness: 1,
  });
}

describe('button shortcut hint contrast', () => {
  it('reads every variant from button.css', () => {
    expect(variants).toEqual(expect.arrayContaining(['primary', 'secondary', 'ghost', 'danger']));
    for (const c of cases) {
      expect(c.fg, `${c.name} text colour`).toBeTruthy();
      expect(c.backgrounds.every(Boolean), `${c.name} fill`).toBe(true);
    }
  });

  describe.each(['light', 'dark'] as const)('%s theme', (theme) => {
    const hex = (name: string) => {
      const v = tokens[theme][`sc-color-${name}`];
      expect(v, `token sc-color-${name} exists`).toMatch(/^#[0-9a-f]{6}$/);
      return v!;
    };
    for (const c of cases) {
      for (const bg of c.backgrounds) {
        it(`${c.name}: ${c.fg} at ${c.opacity} on ${bg} ≥ 4.5:1`, () => {
          expect(hintRatio(hex(c.fg), hex(bg), c.opacity, c.brightness)).toBeGreaterThanOrEqual(4.5);
        });
      }
    }
  });
});
