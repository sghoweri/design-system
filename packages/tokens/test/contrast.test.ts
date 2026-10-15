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
];
const pairs: Array<[string, string[], number]> = [
  ['text-default', surfaces, 4.5],
  ['text-muted', surfaces, 4.5],
  ['text-subtle', ['surface-default'], 4.5],
  ['text-link', ['surface-canvas', 'surface-default'], 4.5],
  ['text-on-accent', ['accent-default', 'accent-hover'], 4.5],
  ['accent-text', ['accent-subtle', 'surface-default'], 4.5],
  ['success-text', ['success-subtle', 'surface-default'], 4.5],
  ['warning-text', ['warning-subtle', 'surface-default'], 4.5],
  ['danger-text', ['danger-subtle', 'surface-default'], 4.5],
  ['text-on-status', ['success-solid', 'warning-solid', 'danger-solid'], 4.5],
  ['border-strong', ['surface-default', 'surface-canvas'], 3],
  ['border-focus', ['surface-canvas', 'surface-default', 'surface-raised'], 3],
  ['accent-default', ['surface-default', 'surface-canvas'], 3],
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
