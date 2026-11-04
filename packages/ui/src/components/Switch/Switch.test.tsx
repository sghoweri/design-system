import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from './Switch';
import { expectNoA11yViolations } from '../../../test/axe';

describe('Switch', () => {
  it('is a labelled switch with a description', async () => {
    const { container } = render(
      <Switch label="Pause my sweeps" description="Stops the schedule for you only." name="pause" />,
    );
    const sw = screen.getByRole('switch', { name: 'Pause my sweeps' });
    expect(sw).toHaveAttribute('aria-checked', 'false');
    expect(sw).toHaveAccessibleDescription('Stops the schedule for you only.');
    expect(sw).toHaveClass('sc-switch');
    expect(container.querySelector('input[name="pause"]')).not.toBeNull();
    await expectNoA11yViolations(container);
  });

  it('flips from the label, reports the change, and can put the label first', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(
      <Switch label="Notifications" labelPosition="start" defaultChecked onCheckedChange={onCheckedChange} />,
    );
    const sw = screen.getByRole('switch', { name: 'Notifications' });
    expect(sw).toHaveAttribute('aria-checked', 'true');
    expect(sw.closest('.sc-choice')).toHaveAttribute('data-label-position', 'start');
    await user.click(screen.getByText('Notifications'));
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
    expect(sw).toHaveAttribute('aria-checked', 'false');
  });

  it('is disabled', () => {
    render(<Switch label="Off" disabled />);
    expect(screen.getByRole('switch', { name: 'Off' })).toHaveAttribute('aria-disabled', 'true');
  });
});
