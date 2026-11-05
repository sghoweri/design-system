import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconButton } from './IconButton';
import { PauseIcon } from '../../icons/icons.gen';
import { expectNoA11yViolations } from '../../../test/axe';

// The anchor gets its name and icon from IconButton through `render`.
// eslint-disable-next-line jsx-a11y/anchor-has-content
const settingsLink = <a href="/settings" />;

describe('IconButton', () => {
  it('is a native button named by label, ghost and md by default, with a hidden icon', async () => {
    const { container } = render(
      <IconButton label="Pause sweeps">
        <PauseIcon />
      </IconButton>,
    );
    const button = screen.getByRole('button', { name: 'Pause sweeps' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('data-variant', 'ghost');
    expect(button).toHaveAttribute('data-size', 'md');
    expect(button).toHaveClass('sc-button', 'sc-icon-button');
    expect(button.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    await expectNoA11yViolations(container);
  });

  it('takes variant, size, round and forwards native props', async () => {
    const onClick = vi.fn();
    render(
      <IconButton label="Settings" variant="secondary" size="sm" round onClick={onClick} id="s">
        <PauseIcon />
      </IconButton>,
    );
    const button = screen.getByRole('button', { name: 'Settings' });
    expect(button).toHaveAttribute('data-variant', 'secondary');
    expect(button).toHaveAttribute('data-size', 'sm');
    expect(button).toHaveAttribute('data-round');
    expect(button).toHaveAttribute('id', 's');
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('ignores clicks while loading and keeps the name', async () => {
    const onClick = vi.fn();
    render(
      <IconButton label="Refresh" loading onClick={onClick}>
        <PauseIcon />
      </IconButton>,
    );
    const button = screen.getByRole('button', { name: 'Refresh' });
    expect(button).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('shows the label as a tooltip on focus when tooltip is true', async () => {
    const user = userEvent.setup();
    render(
      <IconButton label="Pause sweeps" tooltip>
        <PauseIcon />
      </IconButton>,
    );
    expect(screen.queryByRole('tooltip')).toBeNull();
    await user.tab();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Pause sweeps');
    // The tooltip adds no second name: the button is still named by its label only.
    expect(screen.getByRole('button')).toHaveAccessibleName('Pause sweeps');
  });

  it('shows custom tooltip text', async () => {
    const user = userEvent.setup();
    render(
      <IconButton label="Pause" tooltip="Pause my sweeps (P)">
        <PauseIcon />
      </IconButton>,
    );
    await user.tab();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Pause my sweeps (P)');
  });

  it('renders a link through render, keeping the name, look and no type attribute', async () => {
    const { container } = render(
      <IconButton label="Settings" render={settingsLink} variant="secondary">
        <PauseIcon />
      </IconButton>,
    );
    const link = screen.getByRole('link', { name: 'Settings' });
    expect(link).toHaveAttribute('href', '/settings');
    expect(link).toHaveClass('sc-button', 'sc-icon-button');
    expect(link).toHaveAttribute('data-variant', 'secondary');
    expect(link).not.toHaveAttribute('type');
    await expectNoA11yViolations(container);
  });
});
