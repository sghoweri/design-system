// The default mobile tap flash is off for every page that loads the styles (the controls' own pressed and focus
// states replace it). jsdom applies no stylesheets, so this checks the source.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, it } from 'vitest';

it('base.css sets a transparent tap highlight on :root', () => {
  const css = readFileSync(join(__dirname, 'base.css'), 'utf8');
  expect(css).toMatch(/^:root\s*\{[^}]*-webkit-tap-highlight-color:\s*transparent;/m);
});
