// The z-index scale is one ordered ladder; every popup (menu, select, popover) sits above the dialog so it
// can open from inside one. Runs against the built JSON.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const json = JSON.parse(readFileSync(join(__dirname, '..', 'dist', 'json', 'tokens.json'), 'utf8')) as {
  light: Record<string, number>;
};

const ladder = ['base', 'raised', 'sticky', 'backdrop', 'dialog', 'dropdown', 'toast', 'tooltip'];

describe('z-index layers', () => {
  it('ascend in the documented order: page chrome < backdrop < dialog < dropdown < toast < tooltip', () => {
    const values = ladder.map((name) => json.light[`sc-z-${name}`]);
    values.forEach((v) => expect(typeof v).toBe('number'));
    for (let i = 1; i < values.length; i += 1) {
      expect(values[i]!, `${ladder[i]} must be above ${ladder[i - 1]}`).toBeGreaterThan(values[i - 1]!);
    }
  });
});
