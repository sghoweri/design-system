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
  '.c-proto-heading',
  '.c-proto-dialog__title',
  '.c-proto-popover__title',
  '.c-proto-toast__title',
  '.c-proto-empty-state__title',
  '.c-proto-flow__step-title',
  '.c-proto-callout__title',
];
const PRETTY = [
  '.c-proto-text',
  '.c-proto-callout__body',
  '.c-proto-dialog__description',
  '.c-proto-dialog__body',
  '.c-proto-popover__description',
  '.c-proto-toast__description',
  '.c-proto-empty-state__description',
  '.c-proto-flow__step-description',
  '.c-proto-flow__rail-note',
  '.c-proto-field__description',
  '.c-proto-field__error',
  '.c-proto-choice__description',
  '.c-proto-menu__description',
  '.c-proto-select__item-text',
  '.c-proto-banner__body',
  '.c-proto-tooltip',
  '.c-proto-reason-list',
  '.c-proto-reason-list__empty',
  '.c-proto-quote',
  '.c-proto-stat__hint',
  '.c-proto-table__caption',
  '.c-proto-file-preview__note',
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
