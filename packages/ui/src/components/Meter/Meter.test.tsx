import { render, screen } from '@testing-library/react';
import { Meter } from './Meter';
import { expectNoA11yViolations } from '../../../test/axe';

describe('Meter', () => {
  it('is a labelled meter, not a progressbar, with value attributes and visible value text', async () => {
    const { container } = render(<Meter label="Shown" value={214} max={1204} valueText="214 of 1,204" />);
    const meter = screen.getByRole('meter', { name: 'Shown' });
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(meter).toHaveClass('sc-meter');
    expect(meter).toHaveAttribute('aria-valuenow', '214');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '1204');
    expect(meter).toHaveAttribute('aria-valuetext', '214 of 1,204');
    expect(meter).toHaveAttribute('data-tone', 'accent');
    expect(meter).toHaveAttribute('data-size', 'md');
    expect(meter).toHaveAttribute('data-layout', 'stacked');
    expect(screen.getByText('214 of 1,204')).toHaveClass('sc-meter__value');
    expect(screen.getByText('Shown')).toHaveClass('sc-meter__label');
    expect((container.querySelector('.sc-meter__fill') as HTMLElement).style.width).toMatch(/^17\.77/);
    await expectNoA11yViolations(container);
  });

  it('defaults the value text to the formatted count, and takes a share as value over max 1', () => {
    const { rerender } = render(<Meter label="Fetched" value={1204} max={2000} />);
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuetext', '1,204');
    expect(screen.getByText('1,204')).toHaveClass('sc-meter__value');
    rerender(<Meter label="Kept" value={0.28} max={1} valueText="28%" />);
    const meter = screen.getByRole('meter', { name: 'Kept' });
    expect(meter).toHaveAttribute('aria-valuenow', '0.28');
    expect(meter).toHaveAttribute('aria-valuetext', '28%');
  });

  it('draws a mark as a solid part of the fill and reads its label after the value text', async () => {
    const { container } = render(
      <Meter
        label="7:00 AM"
        value={40}
        max={80}
        valueText="40 found first"
        mark={{ value: 12, label: '12 strong leads' }}
        tone="success"
      />,
    );
    const meter = screen.getByRole('meter', { name: '7:00 AM' });
    expect(meter).toHaveAttribute('data-marked');
    expect(meter).toHaveAttribute('aria-valuetext', '40 found first; 12 strong leads');
    expect(meter.style.getPropertyValue('--_mark')).toBe('15%');
    const mark = container.querySelector('.sc-meter__track > .sc-meter__mark');
    expect(mark).toHaveAttribute('aria-hidden', 'true');
    expect(mark).toHaveAttribute('title', '12 strong leads');
    await expectNoA11yViolations(container);
  });

  it('never draws a mark longer than the value', () => {
    render(<Meter label="Slot" value={5} max={10} mark={{ value: 9, label: '9 strong' }} />);
    expect(screen.getByRole('meter').style.getPropertyValue('--_mark')).toBe('50%');
  });

  it('inline layout keeps the label for assistive tech only, for a table cell', async () => {
    const { container } = render(
      <table>
        <tbody>
          <tr>
            <td>
              <Meter layout="inline" size="sm" label="Shown, Greenhouse" value={121} max={121} />
            </td>
          </tr>
        </tbody>
      </table>,
    );
    const meter = screen.getByRole('meter', { name: 'Shown, Greenhouse' });
    expect(meter).toHaveAttribute('data-layout', 'inline');
    expect(meter).toHaveAttribute('data-size', 'sm');
    expect(screen.getByText('Shown, Greenhouse')).toHaveClass('sc-visually-hidden');
    expect(screen.getByText('121')).toHaveClass('sc-meter__value');
    await expectNoA11yViolations(container);
  });

  it('clamps out-of-range values for the fill and aria-valuenow', () => {
    const { container } = render(<Meter label="Over" value={150} max={100} valueText="150" />);
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '100');
    expect((container.querySelector('.sc-meter__fill') as HTMLElement).style.width).toBe('100%');
  });
});
