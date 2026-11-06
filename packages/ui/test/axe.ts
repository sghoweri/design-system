import axe, { type AxeResults } from 'axe-core';

/**
 * Runs axe on a rendered container (jsdom). Colour contrast is skipped: component CSS is not loaded
 * in unit tests and the tokens package already checks every text/surface pair. Frames are not entered:
 * jsdom cannot message into them, and a frame's own document (a PDF viewer) is not ours to check.
 */
export async function runAxe(container: Element): Promise<AxeResults> {
  return axe.run(container, {
    iframes: false,
    rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
  });
}

export function formatViolations(results: AxeResults): string {
  return results.violations
    .map((v) => `${v.id}: ${v.help}\n  ${v.nodes.map((n) => n.html).join('\n  ')}`)
    .join('\n');
}

/** Asserts no axe violations in the container. */
export async function expectNoA11yViolations(container: Element): Promise<void> {
  const results = await runAxe(container);
  expect(results.violations, formatViolations(results)).toEqual([]);
}
