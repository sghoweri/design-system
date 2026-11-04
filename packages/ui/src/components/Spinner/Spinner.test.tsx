import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';
import { expectNoA11yViolations } from '../../../test/axe';

describe('Spinner', () => {
  it('is a status named Loading by default, md, in currentColor', async () => {
    const { container } = render(<Spinner />);
    const spinner = screen.getByRole('status', { name: 'Loading' });
    expect(spinner).toHaveClass('sc-spinner');
    expect(spinner).toHaveAttribute('data-size', 'md');
    expect(spinner.querySelector('svg')).toHaveAttribute('stroke', 'currentColor');
    expect(spinner.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    await expectNoA11yViolations(container);
  });

  it('takes a label and size, or hides itself when decorative', () => {
    render(<Spinner label="Sweeping" size="lg" />);
    expect(screen.getByRole('status', { name: 'Sweeping' })).toHaveAttribute('data-size', 'lg');
    const { container } = render(<Spinner decorative />);
    const el = container.querySelector('.sc-spinner')!;
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el).not.toHaveAttribute('role');
  });
});
