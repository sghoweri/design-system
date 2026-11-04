import { render, screen } from '@testing-library/react';
import { Stack } from './Stack';

describe('Stack', () => {
  it('renders a div with the default gap, align and justify', () => {
    render(<Stack data-testid="stack">x</Stack>);
    const el = screen.getByTestId('stack');
    expect(el.tagName).toBe('DIV');
    expect(el).toHaveClass('sc-stack');
    expect(el).toHaveAttribute('data-gap', 'sm');
    expect(el).toHaveAttribute('data-align', 'stretch');
    expect(el).toHaveAttribute('data-justify', 'start');
  });

  it('renders lists with semantics and takes a scale gap', () => {
    render(
      <Stack as="ul" gap="lg" align="center" justify="between" inline>
        <li>a</li>
      </Stack>,
    );
    const list = screen.getByRole('list');
    expect(list).toHaveAttribute('data-gap', 'lg');
    expect(list).toHaveAttribute('data-align', 'center');
    expect(list).toHaveAttribute('data-justify', 'between');
    expect(list).toHaveAttribute('data-inline');
  });
});
