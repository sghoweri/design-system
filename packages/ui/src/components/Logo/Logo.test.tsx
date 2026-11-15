import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import { Logo } from './Logo';

const css = readFileSync(join(__dirname, '../../styles/logo.css'), 'utf8');

describe('Logo', () => {
  it('is an image named "Job Sweep" by default, at the nav size, drawn as a masked tile', () => {
    const { container } = render(<Logo />);
    const logo = screen.getByRole('img', { name: 'Job Sweep' });
    expect(logo).toHaveClass('sc-logo');
    expect(logo).toHaveAttribute('data-size', 'lg');
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveClass('sc-logo__mark');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    // The tile takes currentColor (the accent token in CSS) and the broom is cut out by the mask.
    const rect = svg.querySelector('rect')!;
    expect(rect).toHaveAttribute('fill', 'currentColor');
    const id = svg.querySelector('mask')!.id;
    expect(rect).toHaveAttribute('mask', `url(#${id})`);
    expect(container.querySelector('.sc-logo__wordmark')).toBeNull();
  });

  it('takes another accessible name with label', () => {
    render(<Logo label="Job Sweep home" />);
    expect(screen.getByRole('img', { name: 'Job Sweep home' })).toBeInTheDocument();
  });

  it('with wordmark, shows the name as text and drops the img role, so the text is the name', () => {
    const { container } = render(
      <a href="/">
        <Logo wordmark />
      </a>,
    );
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByRole('link', { name: 'Job Sweep' })).toBeInTheDocument();
    expect(container.querySelector('.sc-logo__wordmark')).toHaveTextContent('Job Sweep');
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.sc-logo')).toHaveAttribute('data-wordmark', 'true');
  });

  it('centres the mark on the cap height of the wordmark, not its line box', () => {
    expect(css).toMatch(/\.sc-logo\[data-wordmark\] \{\s*align-items: baseline;/);
    expect(css).toMatch(
      /\.sc-logo\[data-wordmark\] > \.sc-logo__mark \{[^}]*--_drop: calc\(\(var\(--_s\) - 1cap\) \/ 2\);[^}]*inset-block-start: var\(--_drop\);[^}]*margin-block: calc\(-1 \* var\(--_drop\)\) var\(--_drop\);/,
    );
  });

  it('gives each instance its own mask id', () => {
    const { container } = render(
      <>
        <Logo />
        <Logo />
      </>,
    );
    const ids = Array.from(container.querySelectorAll('mask'), (m) => m.id);
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
    for (const id of ids) expect(id).toMatch(/^[\w-]+$/);
  });

  it('switches to the 16px drawing at md and below', () => {
    const cuts = (size: 'sm' | 'md' | 'lg' | 'xl') => {
      const { container, unmount } = render(<Logo size={size} />);
      // The full drawing has the two bristle cuts (a white stroke inside the mask); the 16px one does not.
      const n = container.querySelectorAll('mask path[stroke="#fff"]').length;
      unmount();
      return n;
    };
    expect(cuts('sm')).toBe(0);
    expect(cuts('md')).toBe(0);
    expect(cuts('lg')).toBe(1);
    expect(cuts('xl')).toBe(1);
  });

  it('passes className and other props to the root', () => {
    render(<Logo className="brand" data-testid="logo" size="em" />);
    const logo = screen.getByTestId('logo');
    expect(logo).toHaveClass('sc-logo', 'brand');
    expect(logo).toHaveAttribute('data-size', 'em');
  });

  it('colours the tile from the accent token, CanvasText in forced colours, and keeps the mask out of forced colours', () => {
    expect(css).toMatch(/\.sc-logo__mark \{[^}]*color: var\(--sc-color-accent-default\)/);
    expect(css).toMatch(/\.sc-logo__mark \{[^}]*forced-color-adjust: none/);
    expect(css).toMatch(/@media \(forced-colors: active\) \{\s*\.sc-logo__mark \{\s*color: CanvasText;/);
    expect(css).toMatch(/--sc-logo-size/);
  });
});
