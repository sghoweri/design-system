import { expectNoA11yViolations } from '../../../test/axe';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders a div with defaults', () => {
    render(<Card data-testid="card">Body</Card>);
    const card = screen.getByTestId('card');
    expect(card.tagName).toBe('DIV');
    expect(card).toHaveClass('sc-card');
    expect(card).toHaveAttribute('data-variant', 'outlined');
    expect(card).toHaveAttribute('data-padding', 'md');
    expect(card).not.toHaveAttribute('data-interactive');
  });

  it('renders as another element with `as`', () => {
    render(
      <Card as="li" padding="sm">
        Item
      </Card>,
    );
    const item = screen.getByText('Item');
    expect(item.tagName).toBe('LI');
    expect(item).toHaveAttribute('data-padding', 'sm');
  });

  it('renders a labelled navigation landmark with `as="nav"`', () => {
    render(
      <Card as="nav" aria-label="Your files" padding="sm">
        <a href="#profile">profile.md</a>
      </Card>,
    );
    const nav = screen.getByRole('navigation', { name: 'Your files' });
    expect(nav.tagName).toBe('NAV');
    expect(nav).toHaveClass('sc-card');
  });

  it('composes through `render` and keeps its class and state attributes', () => {
    render(
      // eslint-disable-next-line jsx-a11y/anchor-has-content -- content comes from Card through render
      <Card interactive selected render={<a href="#job" />}>
        Open job
      </Card>,
    );
    const link = screen.getByRole('link', { name: 'Open job' });
    expect(link).toHaveAttribute('href', '#job');
    expect(link).toHaveClass('sc-card');
    expect(link).toHaveAttribute('data-interactive');
    expect(link).toHaveAttribute('data-selected');
  });

  it('renders a plain row as a real button with the selected state', async () => {
    const { container } = render(
      <ul>
        <li>
          <Card
            render={<button type="button" />}
            variant="plain"
            padding="sm"
            interactive
            selected
            aria-pressed="true"
          >
            Staff Frontend Engineer
          </Card>
        </li>
      </ul>,
    );
    const row = screen.getByRole('button', { name: 'Staff Frontend Engineer', pressed: true });
    expect(row).toHaveAttribute('data-variant', 'plain');
    expect(row).toHaveAttribute('data-selected');
    await expectNoA11yViolations(container);
  });
});
