import { render, screen } from '@testing-library/react';
import { Stat } from './Stat';
import { BriefcaseIcon } from '../../icons/icons.gen';
import { expectNoA11yViolations } from '../../../test/axe';

describe('Stat', () => {
  it('renders label and value, outlined and md by default', async () => {
    const { container } = render(<Stat label="Applications" value="1,204" />);
    const stat = screen.getByText('Applications').closest('.sc-stat')!;
    expect(stat.tagName).toBe('DIV');
    expect(stat).toHaveAttribute('data-variant', 'outlined');
    expect(stat).toHaveAttribute('data-size', 'md');
    expect(screen.getByText('1,204')).toHaveClass('sc-stat__value');
    expect(stat.querySelector('.sc-stat__delta')).toBeNull();
    await expectNoA11yViolations(container);
  });

  it('shows delta with tone and a trend arrow that reads as text, plus hint and icon', async () => {
    const { container } = render(
      <ul>
        <Stat
          label="Reply rate"
          value="37%"
          delta="+3.1 pts"
          deltaTone="positive"
          trend="up"
          hint="last 7 days"
          icon={<BriefcaseIcon />}
          as="li"
          variant="filled"
          size="sm"
        />
      </ul>,
    );
    const stat = screen.getByText('Reply rate').closest('.sc-stat')!;
    expect(stat.tagName).toBe('LI');
    expect(stat).toHaveAttribute('data-variant', 'filled');
    expect(stat).toHaveAttribute('data-size', 'sm');
    const delta = stat.querySelector('.sc-stat__delta')!;
    expect(delta).toHaveAttribute('data-tone', 'positive');
    expect(delta).toHaveTextContent('up +3.1 pts');
    expect(delta.querySelector('.sc-stat__trend')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('last 7 days')).toHaveClass('sc-stat__hint');
    expect(stat.querySelector('.sc-stat__icon')).toHaveAttribute('aria-hidden', 'true');
    await expectNoA11yViolations(container);
  });

  it('reads "unchanged" for a flat trend', () => {
    render(<Stat label="Stale" value="24" delta="same as last week" trend="flat" />);
    expect(screen.getByText('Stale').closest('.sc-stat')!.querySelector('.sc-stat__delta')).toHaveTextContent(
      'unchanged same as last week',
    );
  });
});
