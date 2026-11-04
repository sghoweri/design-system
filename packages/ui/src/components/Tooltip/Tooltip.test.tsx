import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip } from './Tooltip';
import { Button } from '../Button/Button';
import { Badge } from '../Badge/Badge';
import { expectNoA11yViolations } from '../../../test/axe';

describe('Tooltip', () => {
  it('is hidden until the trigger is hovered, then is a tooltip the trigger is described by', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Tooltip content="Runs every source now" delay={0}>
        <Button variant="secondary">Sweep</Button>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button', { name: 'Sweep' });
    expect(screen.queryByRole('tooltip')).toBeNull();
    await user.hover(trigger);
    const tip = await screen.findByRole('tooltip');
    expect(tip).toHaveTextContent('Runs every source now');
    expect(tip).toHaveClass('sc-tooltip');
    expect(tip.querySelector('.sc-tooltip__arrow')).not.toBeNull();
    expect(trigger).toHaveAttribute('data-popup-open');
    await expectNoA11yViolations(container);
    await user.unhover(trigger);
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
  });

  it('opens on keyboard focus and closes on Escape', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Tooltip content="Hint" onOpenChange={onOpenChange}>
        <Button>Go</Button>
      </Tooltip>,
    );
    await user.tab();
    await screen.findByRole('tooltip');
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('never opens when disabled', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Hint" disabled>
        <Button>Go</Button>
      </Tooltip>,
    );
    await user.tab();
    await user.hover(screen.getByRole('button'));
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('works on a focusable Badge', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Replied 2 days ago" delay={0}>
        <Badge tone="success" tabIndex={0}>
          Replied
        </Badge>
      </Tooltip>,
    );
    await user.tab();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Replied 2 days ago');
  });
});
