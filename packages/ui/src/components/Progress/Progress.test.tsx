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

  it('marks thresholds with ticks past the track and reads their labels in aria-valuetext', async () => {
    const { container } = render(
      <Progress
        label="Budget"
        size="sm"
        value={1.2}
        max={2}
        valueText="$1.20 of $2.00 today"
        marks={[{ value: 1.6, label: 'Haiku only' }, { value: 1 }]}
      />,
    );
    const bar = screen.getByRole('progressbar', { name: 'Budget' });
    expect(bar).toHaveAttribute('data-marked');
    expect(bar).toHaveAttribute('aria-valuetext', '$1.20 of $2.00 today; Haiku only at 80%');
    const ticks = container.querySelectorAll<HTMLElement>('.sc-progress__track > .sc-progress__mark');
    expect(ticks).toHaveLength(2);
    expect(ticks[0]?.style.getPropertyValue('--_at')).toBe('80%');
    expect(ticks[0]).toHaveAttribute('aria-hidden', 'true');
    expect(ticks[0]).toHaveAttribute('title', 'Haiku only');
    expect(ticks[1]?.style.getPropertyValue('--_at')).toBe('50%');
    await expectNoA11yViolations(container);
  });

  it('marks still read without a valueText, and are left off while indeterminate', () => {
    const { rerender, container } = render(
      <Progress aria-label="Budget" value={30} marks={[{ value: 80, label: 'Haiku only' }]} />,
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '30%; Haiku only at 80%');
    rerender(<Progress aria-label="Budget" marks={[{ value: 80, label: 'Haiku only' }]} />);
    expect(container.querySelector('.sc-progress__mark')).toBeNull();
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('data-marked');
  });

  it('ring variant is a gauge: the label hidden, the centre decorative, the arc from the value', async () => {
    const { container } = render(
      <Progress variant="ring" size="sm" label="Setup" value={2} max={5} valueText="2 of 5 done">
        2/5
      </Progress>,
    );
    const bar = screen.getByRole('progressbar', { name: 'Setup' });
    expect(bar).toHaveAttribute('data-variant', 'ring');
    expect(bar).toHaveAttribute('aria-valuetext', '2 of 5 done');
    expect(screen.getByText('Setup')).toHaveClass('sc-visually-hidden');
    expect(container.querySelector('.sc-progress__track')).toBeNull();
    expect(container.querySelector('.sc-progress__value')).toBeNull();
    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 36 36');
    const arc = container.querySelector<SVGElement>('.sc-progress__ring-arc');
    expect(arc?.style.getPropertyValue('--_pct')).toBe('40.00');
    expect(screen.getByText('2/5')).toHaveAttribute('aria-hidden', 'true');
    await expectNoA11yViolations(container);
  });

  it('ring paints no arc at 0, and spins a quarter arc while indeterminate', () => {
    const { container, rerender } = render(<Progress variant="ring" aria-label="Setup" value={0} max={5} />);
    expect(container.querySelector('.sc-progress__ring-track')).not.toBeNull();
    expect(container.querySelector('.sc-progress__ring-arc')).toBeNull();
    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 48 48');
    rerender(<Progress variant="ring" aria-label="Setup" />);
    expect(container.querySelector('.sc-progress__ring-arc')).toHaveAttribute('data-indeterminate', 'true');
  });
});
