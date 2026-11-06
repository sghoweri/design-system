import { render, screen } from '@testing-library/react';
import { Score } from './Score';
import { Card } from '../Card/Card';
import { expectNoA11yViolations } from '../../../test/axe';

describe('Score', () => {
  it('shows the number and reads one sentence instead, without aria-label', async () => {
    const { container } = render(<Score value={94} label="Fit score" caption="fit" />);
    const score = container.querySelector('.sc-score')!;
    expect(score).toHaveAttribute('data-variant', 'tile');
    expect(score).toHaveAttribute('data-size', 'sm');
    expect(score).toHaveAttribute('data-tone', 'accent');
    expect(score).not.toHaveAttribute('aria-label');
    expect(score.querySelector('.sc-score__body')).toHaveAttribute('aria-hidden', 'true');
    expect(score.querySelector('.sc-score__value')).toHaveTextContent('94');
    expect(score.querySelector('.sc-score__caption')).toHaveTextContent('fit');
    expect(score.querySelector('.sc-visually-hidden')).toHaveTextContent('Fit score 94 out of 100');
    await expectNoA11yViolations(container);
  });

  it('names a row button by its sentence, not the bare number', () => {
    render(
      <Card render={<button type="button" />} variant="plain" interactive selected aria-pressed="true">
        <Score value={88} label="Fit score" /> Principal Engineer
      </Card>,
    );
    expect(
      screen.getByRole('button', { name: 'Fit score 88 out of 100 Principal Engineer' }),
    ).toBeInTheDocument();
  });

  it('takes a full valueText, a max, a tone and a size', () => {
    const { container } = render(
      <Score value={7} max={10} tone="warning" size="md" valueText="Seven of ten, a stretch" />,
    );
    const score = container.querySelector('.sc-score')!;
    expect(score).toHaveAttribute('data-tone', 'warning');
    expect(score).toHaveAttribute('data-size', 'md');
    expect(score.querySelector('.sc-visually-hidden')).toHaveTextContent('Seven of ten, a stretch');
  });

  it('marks itself selected on request', () => {
    const { container } = render(<Score value={81} selected />);
    expect(container.querySelector('.sc-score')).toHaveAttribute('data-selected');
  });

  it('draws a decorative ring whose arc length follows value / max, clamped', async () => {
    const { container, rerender } = render(<Score variant="ring" value={47} max={50} label="Fit score" />);
    const score = container.querySelector<HTMLElement>('.sc-score')!;
    expect(score).toHaveAttribute('data-variant', 'ring');
    expect(score).not.toHaveAttribute('data-size');
    expect(score.style.getPropertyValue('--sc-score-fill')).toBe('94.00');
    expect(score.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(score.querySelector('.sc-score__arc')).toHaveAttribute('pathLength', '100');
    await expectNoA11yViolations(container);
    rerender(<Score variant="ring" value={120} />);
    expect(score.style.getPropertyValue('--sc-score-fill')).toBe('100.00');
    rerender(<Score variant="ring" value={0} />);
    expect(score.querySelector('.sc-score__arc')).toBeNull();
  });
});
