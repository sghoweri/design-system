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
  '.c-proto-button',
  '.c-proto-avatar-button',
  '.c-proto-menu__item',
  '.c-proto-select',
  '.c-proto-select__item',
  '.c-proto-select__clear',
  '.c-proto-tabs__tab',
  '.c-proto-choice__control',
  '.c-proto-chip__action',
  '.c-proto-chip__remove',
  '.c-proto-disclosure__summary',
  '.c-proto-dialog__close',
  '.c-proto-table__sort',
  '.c-proto-table__row[data-interactive]',
  '.c-proto-table__select',
  '.c-proto-card[data-interactive]',
  '.c-proto-file-input .filepond--drop-label.filepond--drop-label label',
  '.c-proto-file-input .filepond--action-remove-item',
  '.c-proto-file-input .c-proto-file-input__preview',
  '.c-proto-priority-nav__link',
  '.c-proto-priority-nav__toggle',
  '.c-proto-popover__close',
  '.c-proto-flow__rail-item',
  'a.c-proto-status-strip__cell',
];
const DISABLED = [
  '.c-proto-button:disabled',
  '.c-proto-avatar-button:disabled',
  '.c-proto-menu__item[data-disabled]',
  '.c-proto-select[data-disabled]',
  '.c-proto-select__item[data-disabled]',
  '.c-proto-tabs__tab[data-disabled]',
  '.c-proto-chip__action:disabled',
  '.c-proto-chip__remove:disabled',
  '.c-proto-choice[data-disabled] > .c-proto-choice__control',
  '.c-proto-input:disabled',
  '.c-proto-file-input[data-disabled]',
  '.c-proto-file-input .filepond--action-remove-item[disabled]',
  '.c-proto-table__select[data-disabled]',
  '.c-proto-toolbar .c-proto-button[data-disabled]',
  '.c-proto-flow__rail-item:disabled',
];
/** Selectors allowed to say `cursor: default`: not activatable themselves. */
const DEFAULT_ALLOWED = ['.c-proto-field__label'];

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
