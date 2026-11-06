// The cursor rule (docs/adr/0003): anything a pointer can activate shows `pointer`; a disabled one shows
// `not-allowed`; a busy one shows `progress`; text entry keeps the browser's text cursor. `cursor: default` is
// only for things that are not activatable. Checked against the component stylesheets themselves.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const dir = __dirname;
const rules: Array<{ file: string; selector: string; cursor: string | null }> = [];
for (const file of readdirSync(dir).filter((f) => f.endsWith('.css'))) {
  const css = readFileSync(join(dir, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const cursor = /cursor:\s*([^;]+);/.exec(m[2]!)?.[1]?.trim() ?? null;
    for (const selector of m[1]!
      .split(',')
      .map((s) => s.trim().replace(/\s+/g, ' '))
      .filter(Boolean))
      rules.push({ file, selector, cursor });
  }
}
const cursorOf = (selector: string) =>
  rules.filter((r) => r.selector === selector && r.cursor).map((r) => r.cursor);

const ACTIVATABLE = [
  '.sc-button',
  '.sc-menu__item',
  '.sc-select',
  '.sc-select__item',
  '.sc-select__clear',
  '.sc-tabs__tab',
  '.sc-choice__control',
  '.sc-chip__action',
  '.sc-chip__remove',
  '.sc-disclosure__summary',
  '.sc-dialog__close',
  '.sc-table__sort',
  '.sc-table__row[data-interactive]',
  '.sc-table__select',
  '.sc-card[data-interactive]',
  '.sc-file-input .filepond--drop-label.filepond--drop-label label',
  '.sc-file-input .filepond--action-remove-item',
  '.sc-priority-nav__link',
  '.sc-priority-nav__toggle',
  '.sc-popover__close',
];
const DISABLED = [
  '.sc-button:disabled',
  '.sc-menu__item[data-disabled]',
  '.sc-select[data-disabled]',
  '.sc-select__item[data-disabled]',
  '.sc-tabs__tab[data-disabled]',
  '.sc-chip__action:disabled',
  '.sc-chip__remove:disabled',
  '.sc-choice[data-disabled] > .sc-choice__control',
  '.sc-input:disabled',
  '.sc-file-input[data-disabled]',
  '.sc-file-input .filepond--action-remove-item[disabled]',
  '.sc-table__select[data-disabled]',
  '.sc-toolbar .sc-button[data-disabled]',
];
/** Selectors allowed to say `cursor: default`: not activatable themselves. */
const DEFAULT_ALLOWED = ['.sc-field__label'];

describe('cursor rule', () => {
  it.each(ACTIVATABLE)('%s shows a pointer', (selector) => {
    expect(cursorOf(selector)).toContain('pointer');
  });
  it.each(DISABLED)('%s shows not-allowed', (selector) => {
    expect(cursorOf(selector)).toContain('not-allowed');
  });
  it('a highlighted item (menus, selects) shows a pointer on its base selector', () => {
    const bases = new Set(
      rules
        .filter((r) => r.selector.includes('[data-highlighted]'))
        .map((r) => r.selector.replace(/\[data-tone='[^']+'\]/g, '').replace('[data-highlighted]', '')),
    );
    expect(bases.size).toBeGreaterThan(0);
    for (const base of bases) expect(cursorOf(base), base).toContain('pointer');
  });
  it('uses cursor: default only where the element is not activatable', () => {
    const offenders = rules
      .filter((r) => r.cursor === 'default' && !DEFAULT_ALLOWED.includes(r.selector))
      .map((r) => `${r.file}: ${r.selector}`);
    expect(offenders).toEqual([]);
  });
});
