import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';
import { expectNoA11yViolations } from '../../../test/axe';

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

describe('Badge info tone', () => {
  it('accepts the info tone', () => {
    render(<Badge tone="info">Screening</Badge>);
    expect(screen.getByText('Screening')).toHaveAttribute('data-tone', 'info');
  });
});

describe('Badge rounded', () => {
  it('is rounded by default and square-cornered on request', async () => {
    const { container } = render(
      <>
        <Badge tone="success" dot>
          Applied
        </Badge>
        <Badge rounded={false}>Draft</Badge>
      </>,
    );
    expect(screen.getByText('Applied')).toHaveAttribute('data-rounded', 'true');
    expect(screen.getByText('Draft')).not.toHaveAttribute('data-rounded');
    await expectNoA11yViolations(container);
  });
});
