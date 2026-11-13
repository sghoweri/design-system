// Banner's action sits beside the text when the banner is wide and drops under it, at the inline end, when the banner
// itself is narrow: a container query on the banner, not a media query. Checked against the CSS (jsdom has no layout
// and no container queries).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(join(__dirname, 'banner.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const QUERY = /@container sc-banner \(inline-size < 560px\)\s*\{([\s\S]*?\})\s*\}/;
const body = (source: string, selector: string) =>
  [...source.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter((m) => m[1]!.split(',').some((s) => s.trim() === selector))
    .map((m) => m[2]!)
    .join('\n');
const outside = css.replace(QUERY, '');

describe('Banner layout', () => {
  it('is a named inline-size container that may wrap', () => {
    const banner = body(outside, '.sc-banner');
    expect(banner).toMatch(/container:\s*sc-banner \/ inline-size;/);
    expect(banner).toMatch(/flex-wrap:\s*wrap;/);
  });

  it('keeps the action on the text row when wide: the message has a zero basis and the action does not grow', () => {
    expect(body(outside, '.sc-banner__body')).toMatch(/flex:\s*1 1 0%;/);
    expect(body(outside, '.sc-banner__action')).toMatch(/flex:\s*none;/);
    expect(outside).not.toMatch(/@media/);
  });

  it('drops the action to its own end-aligned row below 560px of banner width', () => {
    const query = QUERY.exec(css)?.[1];
    expect(query).toBeDefined();
    const action = body(query!, '.sc-banner__action');
    expect(action).toMatch(/flex-basis:\s*100%;/);
    expect(action).toMatch(/order:\s*1;/);
    // Logical: the end is the right in LTR and the left in RTL.
    expect(action).toMatch(/justify-content:\s*flex-end;/);
    expect(query).not.toMatch(/\b(left|right)\b/);
  });
});
