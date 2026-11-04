import { render, screen } from '@testing-library/react';
import { Text } from './Text';

describe('Text', () => {
  it('renders a p at sm, regular, default tone', () => {
    render(<Text>Applied 3 days ago</Text>);
    const p = screen.getByText('Applied 3 days ago');
    expect(p.tagName).toBe('P');
    expect(p).toHaveClass('sc-text');
    expect(p).toHaveAttribute('data-size', 'sm');
    expect(p).toHaveAttribute('data-weight', 'regular');
    expect(p).toHaveAttribute('data-tone', 'default');
    expect(p).not.toHaveAttribute('data-truncate');
  });

  it('takes element, size, tone, weight, align, numeric and truncation', () => {
    render(
      <>
        <Text as="span" size="xs" tone="muted" weight="medium" align="end" numeric truncate>
          12
        </Text>
        <Text as="dd" size="md" truncate={2}>
          clamped
        </Text>
      </>,
    );
    const span = screen.getByText('12');
    expect(span.tagName).toBe('SPAN');
    expect(span).toHaveAttribute('data-size', 'xs');
    expect(span).toHaveAttribute('data-tone', 'muted');
    expect(span).toHaveAttribute('data-weight', 'medium');
    expect(span).toHaveAttribute('data-align', 'end');
    expect(span).toHaveAttribute('data-numeric');
    expect(span).toHaveAttribute('data-truncate', '');
    const dd = screen.getByText('clamped');
    expect(dd.tagName).toBe('DD');
    expect(dd).toHaveAttribute('data-truncate', 'clamp');
    expect(dd.style.getPropertyValue('--sc-text-lines')).toBe('2');
  });
});
