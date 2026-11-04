import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from './Checkbox';
import { expectNoA11yViolations } from '../../../test/axe';

describe('Checkbox', () => {
  it('is a labelled checkbox with a description, unchecked by default', async () => {
    const { container } = render(
      <Checkbox label="Show stale" description="Older than 30 days." name="stale" />,
    );
    const box = screen.getByRole('checkbox', { name: 'Show stale' });
    expect(box).toHaveAttribute('aria-checked', 'false');
    expect(box).toHaveAccessibleDescription('Older than 30 days.');
    expect(box).toHaveClass('sc-checkbox');
    expect(container.querySelector('input[name="stale"]')).not.toBeNull();
    await expectNoA11yViolations(container);
  });

  it('toggles from the label and reports the change', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Checkbox label="Remote only" onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByText('Remote only'));
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
    expect(screen.getByRole('checkbox', { name: 'Remote only' })).toHaveAttribute('aria-checked', 'true');
    await user.keyboard(' ');
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
  });

  it('supports controlled, indeterminate and disabled', () => {
    render(<Checkbox label="All" checked indeterminate disabled />);
    const box = screen.getByRole('checkbox', { name: 'All' });
    expect(box).toHaveAttribute('aria-checked', 'mixed');
    expect(box).toHaveAttribute('data-indeterminate');
    expect(box).toHaveAttribute('aria-disabled', 'true');
    expect(box).toHaveAttribute('data-disabled');
    expect(box.closest('.sc-choice')).toHaveAttribute('data-disabled');
  });
});
