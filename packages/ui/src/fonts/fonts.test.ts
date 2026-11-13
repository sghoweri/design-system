// Every font the design system uses is committed here and never blocks rendering: each @font-face swaps
// (font-display: swap), points at a file next to the stylesheet, and the tokens name only families declared here.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const dir = __dirname;
const css = readFileSync(join(dir, 'fonts.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const faces = [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map((m) => m[1]!);
const urls = faces.flatMap((f) => [...f.matchAll(/url\(([^)]+)\)/g)].map((m) => m[1]!.replace(/['"]/g, '')));
const families = new Set(faces.map((f) => /font-family:\s*'([^']+)'/.exec(f)?.[1]));

describe('fonts', () => {
  it('declares the three families', () => {
    expect([...families].sort()).toEqual(['IBM Plex Mono', 'IBM Plex Sans Variable', 'Unbounded Variable']);
  });

  it('swaps every face, so text never waits for a font', () => {
    for (const f of faces) expect(f).toMatch(/font-display:\s*swap;/);
  });

  it('serves every face from a committed file next to the stylesheet', () => {
    expect(urls).toHaveLength(faces.length);
    for (const u of urls) {
      expect(u).toMatch(/^\.\/[\w-]+\.woff2$/);
      expect(existsSync(join(dir, u))).toBe(true);
    }
    const committed = readdirSync(dir).filter((f) => f.endsWith('.woff2'));
    expect(committed.sort()).toEqual(urls.map((u) => u.slice(2)).sort());
  });

  it('gives every face a unicode-range, so a page downloads only the subsets it draws', () => {
    for (const f of faces) expect(f).toMatch(/unicode-range:/);
  });

  it('fetches nothing from a font CDN or a font package', () => {
    expect(readFileSync(join(dir, 'fonts.css'), 'utf8')).not.toMatch(/https?:|\/\/|@import/);
    for (const pkg of ['../../package.json', '../../../../apps/storybook/package.json']) {
      expect(readFileSync(join(dir, pkg), 'utf8')).not.toMatch(/@fontsource/);
    }
  });

  it('declares the first web family in each font token', () => {
    const tokens = JSON.parse(
      readFileSync(join(dir, '../../../tokens/src/global/typography.json'), 'utf8'),
    ) as { font: { family: Record<string, { $value: string }> } };
    const named = Object.values(tokens.font.family).map((t) =>
      t.$value
        .split(',')
        .map((s) => s.trim().replace(/"/g, ''))
        .find((n) => families.has(n)),
    );
    expect(named).toEqual(['IBM Plex Sans Variable', 'IBM Plex Mono', 'Unbounded Variable']);
  });
});
