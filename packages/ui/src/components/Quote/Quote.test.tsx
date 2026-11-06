import { render, screen } from '@testing-library/react';
import { Quote } from './Quote';
import { expectNoA11yViolations } from '../../../test/axe';

describe('Quote', () => {
  it('is a figure captioned by its label around a blockquote', async () => {
    const { container } = render(<Quote label="You">Less modest about the migration.</Quote>);
    // Browsers name the figure from its figcaption (HTML-AAM); jsdom's name computation does not, so check the parts.
    const figure = screen.getByRole('figure');
    expect(figure).toHaveClass('sc-quote');
    expect(figure.querySelector('figcaption')).toHaveTextContent('You');
    expect(figure.querySelector('blockquote')).toHaveTextContent('Less modest about the migration.');
    await expectNoA11yViolations(container);
  });
});
