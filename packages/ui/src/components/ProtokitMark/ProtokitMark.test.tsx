import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import { ProtokitMark } from './ProtokitMark';

const css = readFileSync(join(__dirname, '../../styles/protokit-mark.css'), 'utf8');

describe('ProtokitMark', () => {
  it('is an image named "Protokit", at the nav size, drawn as the Proton P with the electron inside by default', () => {
    const { container } = render(<ProtokitMark />);
    const mark = screen.getByRole('img', { name: 'Protokit' });
    expect(mark).toHaveClass('c-proto-protokit-mark');
    expect(mark).toHaveAttribute('data-size', 'lg');
    expect(mark).toHaveAttribute('data-orbit', 'inside');
    const svg = container.querySelector('.c-proto-protokit-mark__drawing')!;
    expect(svg).toHaveAttribute('viewBox', '0 0 64 64');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    // The brand drawing: stem, ring (the bowl) and nucleus.
    expect(svg.querySelector('rect')).toHaveAttribute('fill', 'currentColor');
    const ring = svg.querySelector('.c-proto-protokit-mark__ring')!;
    expect(ring).toHaveAttribute('r', '16');
    expect(ring).toHaveAttribute('stroke-width', '7');
    expect(svg.querySelector('.c-proto-protokit-mark__nucleus')).toHaveAttribute('r', '5.5');
    expect(container.querySelector('.c-proto-protokit-mark__electron')).toHaveAttribute('cx', '44');
  });

  it('with orbit={false}, is the plain P: no electron layer and no data-orbit', () => {
    const { container } = render(<ProtokitMark orbit={false} />);
    expect(screen.getByRole('img', { name: 'Protokit' })).not.toHaveAttribute('data-orbit');
    expect(container.querySelector('.c-proto-protokit-mark__orbit')).toBeNull();
    expect(container.querySelector('.c-proto-protokit-mark__drawing')).not.toBeNull();
  });

  it('with motion="always", marks the orbit to run all the time; not by default, and not for the plain P', () => {
    const { container } = render(
      <>
        <ProtokitMark />
        <ProtokitMark motion="always" />
        <ProtokitMark motion="always" orbit={false} />
      </>,
    );
    const [hover, always, plain] = container.querySelectorAll('.c-proto-protokit-mark');
    expect(hover).not.toHaveAttribute('data-motion');
    expect(always).toHaveAttribute('data-motion', 'always');
    expect(plain).not.toHaveAttribute('data-motion');
  });

  it('takes another accessible name with label, and passes className and other props to the root', () => {
    render(<ProtokitMark label="Protokit home" className="brand" data-testid="mark" size="em" />);
    const mark = screen.getByRole('img', { name: 'Protokit home' });
    expect(mark).toBe(screen.getByTestId('mark'));
    expect(mark).toHaveClass('c-proto-protokit-mark', 'brand');
    expect(mark).toHaveAttribute('data-size', 'em');
  });

  it('with orbit, adds a hidden electron layer before the drawing, inside the counter or outside the ring', () => {
    const { container } = render(
      <>
        <ProtokitMark orbit="inside" />
        <ProtokitMark orbit="outside" />
      </>,
    );
    const [inside, outside] = container.querySelectorAll('.c-proto-protokit-mark');
    expect(inside).toHaveAttribute('data-orbit', 'inside');
    expect(outside).toHaveAttribute('data-orbit', 'outside');
    for (const mark of [inside, outside]) {
      const layer = mark!.firstElementChild!;
      // Under the drawing, so the stem paints over an electron passing behind it.
      expect(layer).toHaveClass('c-proto-protokit-mark__orbit');
      expect(layer).toHaveAttribute('aria-hidden', 'true');
      expect(layer.nextElementSibling).toHaveClass('c-proto-protokit-mark__drawing');
    }
    const electron = (m: Element) => m.querySelector('.c-proto-protokit-mark__electron')!;
    // Inside: r 2 at r 9 from the nucleus (35, 27), clear of the nucleus (5.5) and the ring's inner edge (12.5).
    expect(electron(inside!)).toHaveAttribute('cx', '44');
    expect(electron(inside!)).toHaveAttribute('r', '2');
    // Outside: r 2.5 at r 24.5, clear of the ring's outer edge (19.5) and inside the 64 box at the top.
    expect(electron(outside!)).toHaveAttribute('cx', '59.5');
    expect(electron(outside!)).toHaveAttribute('r', '2.5');
    expect(electron(outside!)).toHaveAttribute('cy', '27');
  });

  it('takes stem and ring from the inherited colour and nucleus and electron from the accent, CanvasText in forced colours', () => {
    // No colour of its own outside forced colours, so a link's hover and pressed colours reach the P.
    expect(/\.c-proto-protokit-mark \{[^}]*\}/.exec(css)![0]).not.toMatch(/\bcolor:/);
    expect(css).toMatch(
      /\.c-proto-protokit-mark__nucleus,\s*\.c-proto-protokit-mark__electron \{\s*fill: var\(--proto-color-accent-default\);/,
    );
    expect(css).toMatch(
      /@media \(forced-colors: active\) \{[^@]*color: CanvasText;[^@]*forced-color-adjust: none;[^@]*fill: CanvasText;/,
    );
    expect(css).toMatch(/--proto-protokit-mark-size/);
  });

  it('draws the heavier ring under 24px and no electron under 32px, measured by a size container', () => {
    expect(css).toMatch(/container: proto-protokit-mark \/ inline-size;/);
    expect(css).toMatch(
      /@container proto-protokit-mark \(inline-size < 24px\) \{\s*\.c-proto-protokit-mark__ring \{\s*stroke-width: 8;/,
    );
    expect(css).toMatch(
      /@container proto-protokit-mark \(inline-size < 32px\) \{\s*\.c-proto-protokit-mark__orbit \{\s*display: none;/,
    );
  });

  it('parks the electron at half past one, shown and paused, and turns it only on hover or keyboard focus, never for reduced motion', () => {
    // At rest: drawn, parked at 45° above 3 o'clock, the loop paused; no fade, so the electron is part of the mark.
    expect(css).toMatch(
      /\.c-proto-protokit-mark__orbit \{[^}]*transform-origin: 54\.6875% 42\.1875%;[^}]*rotate: -45deg;[^}]*animation: proto-protokit-mark-orbit var\(--proto-protokit-mark-orbit-duration, 6s\) linear infinite paused;/,
    );
    expect(css).not.toMatch(/opacity: 0;\s*\/\* The nucleus/);
    expect(css).not.toMatch(/\.c-proto-protokit-mark__orbit \{[^}]*opacity/);
    // The turn runs only with no motion preference.
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: no-preference\) \{\s*:is\(a, button\):is\(:hover, :focus-visible\)\s*:is\(\.c-proto-protokit-mark__orbit, \.c-proto-protokit-mark__orbit > svg\),\s*\.c-proto-protokit-mark\[data-motion='always'\]\s*:is\(\.c-proto-protokit-mark__orbit, \.c-proto-protokit-mark__orbit > svg\) \{\s*animation-play-state: running;/,
    );
    expect(css.match(/animation-play-state: running/g)).toHaveLength(1);
    expect(css).toMatch(
      /@keyframes proto-protokit-mark-orbit \{\s*from \{\s*rotate: -45deg;\s*\}\s*to \{\s*rotate: 315deg;/,
    );
  });

  it('takes an outside electron behind the letter where its orbit crosses the stem, in step with the turn', () => {
    expect(css).toMatch(
      /\.c-proto-protokit-mark\[data-orbit='outside'\] \.c-proto-protokit-mark__orbit > svg \{\s*animation-name: proto-protokit-mark-occult;\s*animation-duration: var\(--proto-protokit-mark-orbit-duration, 6s\);\s*animation-timing-function: linear;\s*animation-iteration-count: infinite;\s*\}/,
    );
    // Paused at rest by a rule the hover rule outranks: a shorthand on the outside rule would pin it paused.
    expect(css).toMatch(/\.c-proto-protokit-mark__orbit > svg \{[^}]*animation-play-state: paused;/);
    expect(css).not.toMatch(/animation: proto-protokit-mark-occult/);
    // 110°–130° out, 230°–250° back in: (θ + 45) / 360 of a loop that starts at -45°.
    expect(css).toMatch(
      /@keyframes proto-protokit-mark-occult \{\s*43\.06%,\s*81\.94% \{\s*opacity: 1;\s*\}\s*48\.61%,\s*76\.39% \{\s*opacity: 0;/,
    );
  });
});
