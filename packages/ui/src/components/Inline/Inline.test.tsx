import { render, screen } from '@testing-library/react';
import { Inline } from './Inline';

describe('Inline', () => {
  it('renders with the default gap and wraps', () => {
    render(<Inline data-testid="inline">x</Inline>);
    const el = screen.getByTestId('inline');
    expect(el).toHaveClass('sc-inline');
    expect(el).toHaveAttribute('data-gap', 'xs');
    expect(el).toHaveAttribute('data-align', 'center');
    expect(el).not.toHaveAttribute('data-nowrap');
  });

  it('can stop wrapping and change element', () => {
    render(
      <Inline as="nav" wrap={false} justify="end" aria-label="Actions">
        x
      </Inline>,
    );
    const nav = screen.getByRole('navigation', { name: 'Actions' });
    expect(nav).toHaveAttribute('data-nowrap');
    expect(nav).toHaveAttribute('data-justify', 'end');
  });
});
