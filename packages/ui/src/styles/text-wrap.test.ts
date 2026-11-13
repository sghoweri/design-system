// The text-wrap rule: titles and headings balance their lines, descriptions and body text wrap `pretty` (no orphan
// on the last line). New rules use the `text-wrap-style` longhand, which picks only the style and leaves wrap or
// nowrap to `white-space`, truncation and inheritance; the `text-wrap` shorthand also resets the mode to `wrap`.
// Single-line labels, controls and anything that truncates are left out. Checked against the stylesheets themselves.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const dir = __dirname;
const rules: Array<{ file: string; selector: string; body: string }> = [];
for (const file of readdirSync(dir).filter((f) => f.endsWith('.css'))) {
  const css = readFileSync(join(dir, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    for (const selector of m[1]!
      .split(',')
      .map((s) => s.trim().replace(/\s+/g, ' '))
      .filter(Boolean))
      rules.push({ file, selector, body: m[2]! });
  }
}
const wrapStyleOf = (selector: string) =>
  rules
    .filter((r) => r.selector === selector)
    .map((r) => /text-wrap(?:-style)?:\s*(balance|pretty)\s*;/.exec(r.body)?.[1])
    .filter(Boolean);

const BALANCE = [
  '.sc-heading',
  '.sc-dialog__title',
  '.sc-popover__title',
  '.sc-toast__title',
  '.sc-empty-state__title',
  '.sc-flow__step-title',
];
const PRETTY = [
  '.sc-text',
  '.sc-dialog__description',
  '.sc-dialog__body',
  '.sc-popover__description',
  '.sc-toast__description',
  '.sc-empty-state__description',
  '.sc-flow__step-description',
  '.sc-flow__rail-note',
  '.sc-field__description',
  '.sc-field__error',
  '.sc-choice__description',
  '.sc-menu__description',
  '.sc-select__item-text',
  '.sc-banner__body',
  '.sc-tooltip',
  '.sc-reason-list',
  '.sc-quote',
  '.sc-stat__hint',
  '.sc-table__caption',
  '.sc-file-preview__note',
];

describe('text-wrap rule', () => {
  it.each(BALANCE)('%s balances its lines', (selector) => {
    expect(wrapStyleOf(selector)).toContain('balance');
  });
  it.each(PRETTY)('%s wraps pretty', (selector) => {
    expect(wrapStyleOf(selector)).toContain('pretty');
  });
  it('never undoes a nowrap: a rule with white-space: nowrap sets no text-wrap shorthand but nowrap', () => {
    const offenders = rules
      .filter((r) => /white-space:\s*nowrap/.test(r.body))
      .filter((r) => /text-wrap:\s*(?!nowrap)[a-z]/.test(r.body))
      .map((r) => `${r.file}: ${r.selector}`);
    expect(offenders).toEqual([]);
  });
});
