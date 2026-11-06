import { render, screen } from '@testing-library/react';
import { Heading } from './Heading';
import { expectNoA11yViolations } from '../../../test/axe';

describe('Heading', () => {
  it('renders an h2 at 2xl by default', async () => {
    const { container } = render(<Heading>Inbox</Heading>);
    const h = screen.getByRole('heading', { level: 2, name: 'Inbox' });
    expect(h).toHaveClass('sc-heading');
    expect(h).toHaveAttribute('data-size', '2xl');
    expect(h).toHaveAttribute('data-tone', 'default');
    await expectNoA11yViolations(container);
  });

  it('maps level to a default size and lets size and as override separately', () => {
    render(
      <>
        <Heading level={1}>One</Heading>
        <Heading level={3} size="sm">
          Three small
        </Heading>
        <Heading level={4} as="div" tone="muted" truncate>
          Not an outline entry
        </Heading>
      </>,
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveAttribute('data-size', '3xl');
    expect(screen.getByRole('heading', { level: 3 })).toHaveAttribute('data-size', 'sm');
    const div = screen.getByText('Not an outline entry');
    expect(div.tagName).toBe('DIV');
    expect(div).toHaveAttribute('data-size', 'lg');
    expect(div).toHaveAttribute('data-tone', 'muted');
    expect(div).toHaveAttribute('data-truncate');
  });

  it('has an overline size that is muted unless a tone is set', async () => {
    const { container } = render(
      <>
        <Heading level={3} size="overline">
          Why it fits
        </Heading>
        <Heading level={3} size="overline" tone="accent">
          You
        </Heading>
      </>,
    );
    const [plain, toned] = screen.getAllByRole('heading', { level: 3 });
    expect(plain).toHaveAttribute('data-size', 'overline');
    expect(plain).toHaveAttribute('data-tone', 'muted');
    expect(toned).toHaveAttribute('data-tone', 'accent');
    await expectNoA11yViolations(container);
  });
});
