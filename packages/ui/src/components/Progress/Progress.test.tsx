import { render, screen } from '@testing-library/react';
import { Progress } from './Progress';
import { expectNoA11yViolations } from '../../../test/axe';

describe('Progress', () => {
  it('is a labelled progressbar with value attributes and visible value text', async () => {
    const { container } = render(
      <Progress label="Verifying" value={460} max={859} valueText="460 of 859 · 3 min elapsed" />,
    );
    const bar = screen.getByRole('progressbar', { name: 'Verifying' });
    expect(bar).toHaveClass('sc-progress');
    expect(bar).toHaveAttribute('aria-valuenow', '460');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '859');
    expect(bar).toHaveAttribute('aria-valuetext', '460 of 859 · 3 min elapsed');
    expect(bar).toHaveAttribute('data-variant', 'bar');
    expect(bar).toHaveAttribute('data-tone', 'accent');
    expect(bar).toHaveAttribute('data-size', 'md');
    expect(bar).toHaveAttribute('data-progressing');
    expect(screen.getByText('460 of 859 · 3 min elapsed')).toHaveClass('sc-progress__value');
    expect((container.querySelector('.sc-progress__indicator') as HTMLElement).style.width).toMatch(
      /^53\.55/,
    );
    await expectNoA11yViolations(container);
  });

  it('is indeterminate without a value and names itself through aria-label', async () => {
    const { container } = render(<Progress aria-label="Queued" />);
    const bar = screen.getByRole('progressbar', { name: 'Queued' });
    expect(bar).toHaveAttribute('data-indeterminate');
    expect(bar).not.toHaveAttribute('aria-valuenow');
    expect(container.querySelector('.sc-progress__indicator')).toHaveAttribute('data-indeterminate');
    await expectNoA11yViolations(container);
  });

  it('shows the percentage with showValue and marks completion with a tone', () => {
    render(<Progress label="Export" value={100} showValue tone="success" size="sm" />);
    const bar = screen.getByRole('progressbar', { name: 'Export' });
    expect(bar).toHaveAttribute('data-complete');
    expect(bar).toHaveAttribute('data-tone', 'success');
    expect(bar).toHaveAttribute('data-size', 'sm');
    expect(screen.getByText('100%')).toHaveClass('sc-progress__value');
  });

  it('inline variant pairs a decorative spinner with the text and no track', async () => {
    const { container } = render(
      <Progress variant="inline" label="Verifying" value={3} max={5} valueText="3 of 5" />,
    );
    const bar = screen.getByRole('progressbar', { name: 'Verifying' });
    expect(bar).toHaveAttribute('data-variant', 'inline');
    expect(bar).toHaveAttribute('aria-valuenow', '3');
    expect(container.querySelector('.sc-spinner')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.sc-progress__track')).toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
    await expectNoA11yViolations(container);
  });
});
