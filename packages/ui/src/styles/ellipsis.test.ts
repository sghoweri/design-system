// Single-line fields end in an ellipsis when the text is longer than the field: Input's value and placeholder, and
// Select's value in its trigger. Checked against the stylesheet itself; the stories (Forms/Input and Forms/Select,
// Long value) show it rendered.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(join(__dirname, 'field.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const body = (selector: string) =>
  [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter((m) => m[1]!.split(',').some((s) => s.trim() === selector))
    .map((m) => m[2]!)
    .join('\n');

describe('single-line fields truncate with an ellipsis', () => {
  it('Input', () => {
    expect(body('.c-proto-input')).toMatch(/text-overflow:\s*ellipsis/);
  });
  it("Select's value", () => {
    const value = body('.c-proto-select__value');
    expect(value).toMatch(/overflow:\s*hidden/);
    expect(value).toMatch(/text-overflow:\s*ellipsis/);
    expect(body('.c-proto-select')).toMatch(/white-space:\s*nowrap/);
  });
});
