import { render, screen } from '@testing-library/react';
import { BroomIcon } from './BroomIcon';
import { IconButton } from '../IconButton/IconButton';

describe('BroomIcon', () => {
  it('is a decorative inline SVG on a 24px grid, still by default', () => {
    const { container } = render(<BroomIcon />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveClass('sc-icon', 'sc-broom');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('data-size', 'lg');
    expect(svg).not.toHaveAttribute('data-sweeping');
    expect(svg.querySelector('.sc-broom__body')).not.toBeNull();
    expect(svg.querySelector('.sc-broom__band')).not.toBeNull();
    expect(svg.querySelectorAll('.sc-broom__dust circle')).toHaveLength(3);
    // Inline paths, not a <use> clone, so CSS can animate the groups.
    expect(svg.querySelector('use')).toBeNull();
  });

  it('marks sweeping and the display size for the stylesheet', () => {
    const { container } = render(<BroomIcon sweeping size="display" />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('data-sweeping', 'true');
    expect(svg).toHaveAttribute('data-size', 'display');
  });

  it('takes an accessible name with title', () => {
    render(<BroomIcon title="Sweeping" />);
    expect(screen.getByRole('img', { name: 'Sweeping' })).not.toHaveAttribute('aria-hidden');
  });

  it('sits in an IconButton whose label carries the status, with the status dot', () => {
    render(
      <IconButton label="Sweeps: paused" dot="warning">
        <BroomIcon />
      </IconButton>,
    );
    const button = screen.getByRole('button', { name: 'Sweeps: paused' });
    const dot = button.querySelector('.sc-icon-button__dot')!;
    expect(dot).toHaveAttribute('data-tone', 'warning');
    expect(dot).toHaveAttribute('aria-hidden', 'true');
  });
});
