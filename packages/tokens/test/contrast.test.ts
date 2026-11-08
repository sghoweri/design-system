// Every documented text/surface pair meets WCAG AA in both themes. Runs against the built JSON.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const json = JSON.parse(readFileSync(join(__dirname, '..', 'dist', 'json', 'tokens.json'), 'utf8')) as {
  light: Record<string, string>;
  dark: Record<string, string>;
};

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1, 7), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * ch[0]! + 0.7152 * ch[1]! + 0.0722 * ch[2]!;
}
export function contrast(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (l1 + 0.05) / (l2 + 0.05);
}

const surfaces = [
  'surface-canvas',
  'surface-default',
  'surface-raised',
  'surface-sunken',
  'surface-hover',
  'surface-active',
  'surface-raised-hover',
  'surface-raised-active',
];
// The opaque surfaces a component can sit on (no hover or pressed washes).
const solidSurfaces = ['surface-canvas', 'surface-default', 'surface-raised', 'surface-sunken'];
const pairs: Array<[string, string[], number]> = [
  ['text-default', surfaces, 4.5],
  ['text-muted', surfaces, 4.5],
  ['text-subtle', ['surface-default'], 4.5],
  ['text-link', ['surface-canvas', 'surface-default'], 4.5],
  ['text-on-accent', ['accent-default', 'accent-hover'], 4.5],
  ['accent-text', ['accent-subtle', 'surface-default'], 4.5],
  ['success-text', ['success-subtle', 'surface-default'], 4.5],
  ['warning-text', ['warning-subtle', 'surface-default'], 4.5],
  ['info-text', ['info-subtle', 'surface-default'], 4.5],
  ['danger-text', ['danger-subtle', 'surface-default'], 4.5],
  ['text-on-status', ['success-solid', 'warning-solid', 'danger-solid', 'info-solid'], 4.5],
  ['border-strong', ['surface-default', 'surface-canvas'], 3],
  ['border-focus', ['surface-canvas', 'surface-default', 'surface-raised'], 3],
  ['accent-default', ['surface-default', 'surface-canvas'], 3],
  // Text on the selected-row wash (plain Card selected).
  ['text-default', ['accent-wash'], 4.5],
  ['text-muted', ['accent-wash'], 4.5],
  ['accent-text', ['accent-wash'], 4.5],
  // Selection and tone borders are the cue, not decoration: 3:1 on the fill inside them and every surface outside.
  ['accent-border', ['accent-wash', 'accent-subtle', ...solidSurfaces], 3],
  ['success-border', ['success-subtle', ...solidSurfaces], 3],
  ['warning-border', ['warning-subtle', ...solidSurfaces], 3],
  ['danger-border', ['danger-subtle', ...solidSurfaces], 3],
  // ReasonList markers carry the tone as a shape and a colour.
  ['success-solid', solidSurfaces, 3],
  ['warning-solid', solidSurfaces, 3],
  ['danger-solid', solidSurfaces, 3],
  // Score ring: the arc against its surface.active track.
  ['accent-default', ['surface-active'], 3],
  ['success-solid', ['surface-active'], 3],
  ['warning-solid', ['surface-active'], 3],
  ['danger-solid', ['surface-active'], 3],
  ['text-muted', ['surface-active'], 3],
  // Word diff: text on the tints, and the underline and strike-through (the non-colour cue) on their tint.
  ['text-default', ['diff-added-wash', 'diff-removed-wash'], 4.5],
  ['text-muted', ['diff-removed-wash'], 4.5],
  ['diff-added-stroke', ['diff-added-wash'], 3],
  ['diff-removed-stroke', ['diff-removed-wash'], 3],
  // Avatar: initials on the disc, and the ring (the shape's boundary; the tint alone is 1.0-1.4:1) on the disc inside
  // it and every surface outside. accent.subtle once filled it alone and vanished on the canvas.
  ['avatar-text', ['avatar-fill'], 4.5],
  ['avatar-ring', ['avatar-fill', ...solidSurfaces], 3],
];

describe.each(['light', 'dark'] as const)('%s theme contrast', (theme) => {
  const t = json[theme];
  const get = (name: string) => {
    const v = t[`sc-color-${name}`];
    expect(v, `token sc-color-${name} exists`).toMatch(/^#[0-9a-f]{6}$/);
    return v!;
  };
  for (const [fg, bgs, min] of pairs) {
    for (const bg of bgs) {
      it(`${fg} on ${bg} ≥ ${min}:1`, () => {
        expect(contrast(get(fg), get(bg))).toBeGreaterThanOrEqual(min);
      });
    }
  }
});

// A hover or pressed wash has to be visible against the surface it sits on. Dark surface.hover once equalled
// surface.raised, so menu items in dark mode showed no hover at all (docs/adr/0003).
const washes: Array<[string, string]> = [
  ['surface-default', 'surface-hover'],
  ['surface-hover', 'surface-active'],
  ['surface-raised', 'surface-raised-hover'],
  ['surface-raised-hover', 'surface-raised-active'],
  ['surface-default', 'accent-wash'],
];
describe.each(['light', 'dark'] as const)('%s theme state washes', (theme) => {
  const t = json[theme];
  for (const [base, wash] of washes) {
    it(`${wash} is distinguishable from ${base}`, () => {
      expect(contrast(t[`sc-color-${base}`]!, t[`sc-color-${wash}`]!)).toBeGreaterThanOrEqual(1.08);
    });
  }
});

describe('build outputs', () => {
  it('css has both theme blocks and the density remap', () => {
    const css = readFileSync(join(__dirname, '..', 'dist', 'css', 'tokens.css'), 'utf8');
    expect(css).toContain(':root, [data-theme="light"]');
    expect(css).toContain('[data-theme="dark"]');
    expect(css).toContain('@media (prefers-color-scheme: dark)');
    expect(css).toContain('[data-density="compact"]');
    expect(css).toContain('--sc-color-surface-canvas');
  });
});
