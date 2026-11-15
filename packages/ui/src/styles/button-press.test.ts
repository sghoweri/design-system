// A loading Button or IconButton ignores presses (utils/loadingGuard.ts), so it must not look pressed either: every
// `:active` rule that draws a button's pressed fill leaves out `[data-loading]` as well as `:disabled`. Read from the CSS
// (jsdom has no :active), so a new variant or a new pressed rule elsewhere is checked here.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const files = readdirSync(__dirname).filter((f) => f.endsWith('.css'));
const activeSelectors = files.flatMap((file) => {
  const css = readFileSync(join(__dirname, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  return [...css.matchAll(/([^{}]+)\{[^{}]*\}/g)]
    .map((m) => m[1]!.trim().replace(/\s+/g, ' '))
    .filter((s) => /\.sc-button[^,]*:active/.test(s) || /__dismiss:active/.test(s))
    .map((selector) => ({ file, selector }));
});

describe('pressed button styles', () => {
  it('finds the pressed rules', () => {
    expect(activeSelectors.length).toBeGreaterThanOrEqual(6);
  });

  it.each(activeSelectors)('$file: $selector leaves out a loading button', ({ selector }) => {
    expect(selector).toContain(':not([data-loading])');
  });
});
