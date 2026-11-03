import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders text with default tone, variant and size', () => {
    render(<Badge>Draft</Badge>);
    const badge = screen.getByText('Draft');
    expect(badge.tagName).toBe('SPAN');
    expect(badge).toHaveAttribute('data-tone', 'neutral');
    expect(badge).toHaveAttribute('data-variant', 'soft');
    expect(badge).toHaveAttribute('data-size', 'md');
  });

  it('applies tone, variant, size and an aria-hidden dot', () => {
    render(
      <Badge tone="success" variant="solid" size="sm" dot>
        Replied
      </Badge>,
    );
    const badge = screen.getByText('Replied');
    expect(badge).toHaveAttribute('data-tone', 'success');
    expect(badge).toHaveAttribute('data-variant', 'solid');
    expect(badge).toHaveAttribute('data-size', 'sm');
    expect(badge.querySelector('.sc-badge__dot')).toHaveAttribute('aria-hidden', 'true');
  });
});
