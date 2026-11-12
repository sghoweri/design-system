// The docked sheet's motion and touch contract, checked against dialog.css itself (jsdom has no layout or CSS).
// A sheet and its scrim leave on one duration and curve, so the scrim never goes before the sheet; the sheet's own
// `transition` shorthand used to out-rank the shared exit timing, so the sheet left on the enter curve. Both run
// past the bottom edge (the overhang) and never pan the page behind them.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(join(__dirname, 'dialog.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
  selectors: m[1]!.split(',').map((s) => s.trim().replace(/\s+/g, ' ')),
  body: m[2]!,
}));
const bodiesFor = (selector: string) =>
  rules.filter((r) => r.selectors.includes(selector)).map((r) => r.body);

const SHEET_OUT = ".sc-dialog__popup[data-variant='sheet'][data-ending-style]";
const SCRIM_OUT = ".sc-dialog__backdrop[data-variant='sheet'][data-ending-style]";

describe('dialog.css: docked sheet', () => {
  it('leaves with its scrim on one duration and the exit curve', () => {
    const shared = rules.find(
      (r) => r.selectors.includes(SHEET_OUT) && r.selectors.includes(SCRIM_OUT) && /ease-exit/.test(r.body),
    );
    expect(shared?.body).toMatch(/transition-duration:\s*calc\(var\(--sc-duration-slow\) \* 0\.75\)/);
    expect(shared?.body).toMatch(/transition-timing-function:\s*var\(--sc-ease-exit\)/);
  });

  it('enters with its scrim on the slow duration and the standard curve', () => {
    expect(bodiesFor(".sc-dialog__popup[data-variant='sheet']").join()).toMatch(
      /translate var\(--sc-duration-slow\) var\(--sc-ease-standard\)/,
    );
    const scrim = bodiesFor(".sc-dialog__backdrop[data-variant='sheet']").join();
    expect(scrim).toMatch(/transition-duration:\s*var\(--sc-duration-slow\)/);
    expect(scrim).toMatch(/transition-timing-function:\s*var\(--sc-ease-standard\)/);
  });

  it('has no motion under reduced motion, exit included', () => {
    const reduced = rules.filter(
      (r) => r.selectors.includes(SHEET_OUT) && /transition-duration:\s*0ms/.test(r.body),
    );
    expect(reduced.length).toBe(1);
    expect(reduced[0]!.selectors).toContain(SCRIM_OUT);
  });

  it('runs past the bottom edge and never pans the page behind it', () => {
    expect(bodiesFor('.sc-dialog__backdrop').join()).toMatch(/touch-action:\s*none/);
    expect(bodiesFor('.sc-dialog__backdrop').join()).toMatch(/inset:\s*0 0 calc\(-1 \* var\(--_overhang\)\)/);
    const sheet = bodiesFor(".sc-dialog__popup[data-variant='sheet']").join();
    expect(sheet).toMatch(/touch-action:\s*none/);
    expect(sheet).toMatch(/0 var\(--_overhang\) 0 0 var\(--sc-color-surface-raised\)/);
    expect(sheet).toMatch(/100dvh/);
    expect(sheet).toMatch(/env\(safe-area-inset-bottom, 0px\)/);
  });

  // iOS 26+ Safari extends a fixed surface's colour under its status bar and toolbar only when the box sits on the
  // layout viewport's edges; a box pushed past the bottom edge left the page showing above and below it (2026-11-12).
  it('keeps the sheet and the full-screen surface on the bottom edge; the overhang is a shadow', () => {
    const docked = [
      ...bodiesFor(".sc-dialog__popup[data-variant='sheet']"),
      ...bodiesFor(".sc-dialog__popup[data-variant='fullscreen']"),
    ].join();
    expect(docked).not.toMatch(/border-block-end:\s*var\(--_overhang\)/);
    expect(docked).not.toMatch(/inset[^;]*calc\(-1 \* var\(--_overhang\)\)/);
    expect(bodiesFor(".sc-dialog__popup[data-variant='fullscreen']").join()).toMatch(
      /box-shadow:\s*0 var\(--_overhang\) 0 0 var\(--sc-color-surface-default\)/,
    );
  });
});
