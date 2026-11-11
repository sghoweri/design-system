// Under `viewport-fit=cover` the screen's safe-area insets are the app's to clear. Every surface that touches a
// screen edge pads or offsets by env(safe-area-inset-*) on that edge, checked against the CSS itself (jsdom has no
// layout and no env()).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file: string) => readFileSync(join(__dirname, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const rules = (file: string) =>
  [...read(file).matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
    selectors: m[1]!.split(',').map((s) => s.trim().replace(/\s+/g, ' ')),
    body: m[2]!,
  }));
const body = (file: string, selector: string) =>
  rules(file)
    .filter((r) => r.selectors.includes(selector))
    .map((r) => r.body)
    .join('\n');
const SIDES = /max\(var\(--_gutter\), env\(safe-area-inset-left, 0px\), env\(safe-area-inset-right, 0px\)\)/;

describe('safe areas', () => {
  it('toasts clear the bottom inset and either side inset', () => {
    const viewport = body('toast.css', '.sc-toast-viewport');
    expect(viewport).toMatch(/--_bottom:[^;]*env\(safe-area-inset-bottom, 0px\)/);
    expect(viewport).toMatch(SIDES);
    expect(viewport).toMatch(/inset-inline-end:\s*var\(--_side\)/);
    expect(viewport).toMatch(/inline-size:\s*min\(360px, 100vw - 2 \* var\(--_side\)\)/);
  });

  it('the selection bar clears the bottom inset and either side inset', () => {
    const bar = body('selection-bar.css', '.sc-selection-bar');
    expect(bar).toMatch(/inset-block-end:[^;]*env\(safe-area-inset-bottom, 0px\)/);
    expect(bar).toMatch(SIDES);
    expect(bar).toMatch(/inset-inline:\s*var\(--_side\)/);
  });

  it('a centred dialog keeps its gutters at least as wide as the insets', () => {
    const popup = body('dialog.css', '.sc-dialog__popup');
    expect(popup).toMatch(SIDES);
    expect(popup).toMatch(
      /--_ends:\s*max\(var\(--_gutter\), env\(safe-area-inset-top, 0px\), env\(safe-area-inset-bottom, 0px\)\)/,
    );
    expect(popup).toMatch(/--_max:\s*calc\(100dvw - 2 \* var\(--_side\)\)/);
    expect(popup).toMatch(/max-block-size:\s*min\(100dvh - 2 \* var\(--_ends\), 85dvh\)/);
  });

  it('a docked sheet and the full-screen surface pad every edge they touch', () => {
    const sheet = body('dialog.css', ".sc-dialog__popup[data-variant='sheet']");
    for (const edge of ['top', 'bottom', 'left', 'right'])
      expect(sheet).toContain(`env(safe-area-inset-${edge}, 0px)`);
    const full = body('dialog.css', ".sc-dialog__popup[data-variant='fullscreen']");
    for (const edge of ['top', 'bottom', 'left', 'right'])
      expect(full).toContain(`env(safe-area-inset-${edge}, 0px)`);
    const close = body('dialog.css', ".sc-dialog__popup[data-variant='fullscreen'] .sc-dialog__close");
    expect(close).toMatch(/inset-block-start:[^;]*env\(safe-area-inset-top, 0px\)/);
    expect(close).toMatch(/inset-inline-end:[^;]*env\(safe-area-inset-right, 0px\)/);
  });

  it('the full-screen flow’s header and footer pad the edges they touch', () => {
    const header = body('full-screen-flow.css', '.sc-flow__header');
    for (const edge of ['top', 'left', 'right'])
      expect(header).toContain(`env(safe-area-inset-${edge}, 0px)`);
    const footer = body('full-screen-flow.css', '.sc-flow__footer');
    for (const edge of ['bottom', 'left', 'right'])
      expect(footer).toContain(`env(safe-area-inset-${edge}, 0px)`);
  });
});
