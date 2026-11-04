import { render, screen } from '@testing-library/react';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Icon } from './Icon';
import * as icons from '../../icons/icons.gen';
import { iconNames } from '../../icons/icon-names.gen';
import { expectNoA11yViolations } from '../../../test/axe';

describe('Icon', () => {
  it('is decorative by default', () => {
    render(
      <Icon data-testid="icon">
        <path d="M8 3v10" />
      </Icon>,
    );
    const svg = screen.getByTestId('icon');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).not.toHaveAttribute('role');
    expect(svg).toHaveAttribute('data-size', 'md');
    expect(svg).toHaveAttribute('viewBox', '0 0 16 16');
    expect(svg).toHaveAttribute('stroke', 'currentColor');
  });

  it('becomes a labelled image with title', async () => {
    const { container } = render(
      <Icon title="Interview" size="lg">
        <path d="M8 3v10" />
      </Icon>,
    );
    const img = screen.getByRole('img', { name: 'Interview' });
    expect(img).not.toHaveAttribute('aria-hidden');
    expect(img).toHaveAttribute('data-size', 'lg');
    await expectNoA11yViolations(container);
  });
});

describe('icon set', () => {
  const svgDir = join(__dirname, '..', '..', 'icons', 'svg');
  const files = readdirSync(svgDir)
    .filter((f) => f.endsWith('.svg'))
    .map((f) => f.slice(0, -4))
    .sort();

  it('generates one component per SVG and the names list matches the folder', () => {
    expect([...iconNames]).toEqual(files);
    for (const name of files) {
      const pascal = name.replace(/(^|-)([a-z0-9])/g, (_, __, c: string) => c.toUpperCase());
      expect(icons, `${pascal}Icon`).toHaveProperty(`${pascal}Icon`);
    }
    expect(Object.keys(icons).length).toBe(files.length);
  });

  it('renders every icon as a decorative 16×16 svg in currentColor', () => {
    const { container } = render(
      <div>
        {Object.values(icons).map((Glyph, i) => (
          <Glyph key={i} />
        ))}
      </div>,
    );
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(files.length);
    for (const svg of svgs) {
      expect(svg).toHaveAttribute('aria-hidden', 'true');
      for (const el of svg.querySelectorAll('*')) {
        for (const attr of ['fill', 'stroke']) {
          const v = el.getAttribute(attr);
          if (v !== null) expect(['currentColor', 'none'], `${attr} on ${el.tagName}`).toContain(v);
        }
      }
    }
  });
});
