import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import { ProtokitLogo } from './ProtokitLogo';

const css = readFileSync(join(__dirname, '../../styles/protokit-logo.css'), 'utf8');

describe('ProtokitLogo', () => {
  it('is one image named "Protokit": the mark as the P, then "rotokit", both hidden from assistive tech', () => {
    const { container } = render(<ProtokitLogo />);
    const logo = screen.getByRole('img', { name: 'Protokit' });
    expect(logo).toHaveClass('c-proto-protokit-logo');
    expect(logo).toHaveAttribute('translate', 'no');
    expect(screen.getAllByRole('img')).toHaveLength(1);
    const mark = container.querySelector('.c-proto-protokit-mark')!;
    expect(mark).toHaveClass('c-proto-protokit-logo__mark');
    expect(mark).toHaveAttribute('aria-hidden', 'true');
    expect(mark).toHaveAttribute('data-orbit', 'inside');
    const name = container.querySelector('.c-proto-protokit-logo__name')!;
    expect(name).toHaveTextContent(/^rotokit$/);
    expect(name).toHaveAttribute('aria-hidden', 'true');
    expect(mark.parentElement).toHaveClass('c-proto-protokit-logo__p');
    expect(mark.parentElement!.nextElementSibling).toBe(name);
  });

  it('runs the orbit all the time by default, or only on hover with motion="hover"', () => {
    const { container } = render(
      <>
        <ProtokitLogo />
        <ProtokitLogo motion="hover" label="Protokit home" className="brand" />
      </>,
    );
    const [always, hover] = container.querySelectorAll('.c-proto-protokit-mark');
    expect(always).toHaveAttribute('data-motion', 'always');
    expect(hover).not.toHaveAttribute('data-motion');
    expect(screen.getByRole('img', { name: 'Protokit home' })).toHaveClass('c-proto-protokit-logo', 'brand');
  });

  it("is the P's cap band tall (48u), the name at that cap height on the stem's foot, with no margins", () => {
    expect(css).toMatch(
      /\.c-proto-protokit-logo \{[^}]*--_s: var\(--proto-protokit-logo-size, 2rem\);[^}]*--_u: calc\(var\(--_s\) \/ 64\);/,
    );
    expect(css).toMatch(/\.c-proto-protokit-logo \{[^}]*--proto-protokit-mark-size: var\(--_s\);/);
    expect(css).toMatch(
      /\.c-proto-protokit-logo \{[^}]*align-items: last baseline;[^}]*block-size: calc\(var\(--_u\) \* 48\);/,
    );
    expect(css).toMatch(
      /\.c-proto-protokit-logo__p \{[^}]*position: relative;[^}]*inline-size: calc\(var\(--_u\) \* 45\);[^}]*block-size: calc\(var\(--_u\) \* 48\);/,
    );
    expect(css).toMatch(
      /\.c-proto-protokit-logo__mark \{[^}]*position: absolute;[^}]*inset-block-start: calc\(var\(--_u\) \* -8\);[^}]*inset-inline-start: calc\(var\(--_u\) \* -12\);/,
    );
    expect(css).toMatch(
      /\.c-proto-protokit-logo__name \{[^}]*font-size: var\(--_s\);[^}]*font-size-adjust: cap-height 0\.75;[^}]*text-box: trim-both cap alphabetic;/,
    );
    expect(css.replace(/\/\*[\s\S]*?\*\//g, '')).not.toMatch(/\bmargin/);
  });
});
