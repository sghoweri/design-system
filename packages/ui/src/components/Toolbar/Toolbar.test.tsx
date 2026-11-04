import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toolbar } from './Toolbar';
import { IconButton } from '../IconButton/IconButton';
import { Button } from '../Button/Button';
import { Menu } from '../Menu/Menu';
import { MoreHorizontalIcon, PauseIcon, RefreshIcon } from '../../icons/icons.gen';
import { expectNoA11yViolations } from '../../../test/axe';

function Example() {
  return (
    <Toolbar.Root aria-label="Inbox actions">
      <Toolbar.Group aria-label="Sweeps">
        <Toolbar.Button render={<IconButton label="Pause" />}>
          <PauseIcon />
        </Toolbar.Button>
        <Toolbar.Button render={<IconButton label="Sweep now" />}>
          <RefreshIcon />
        </Toolbar.Button>
      </Toolbar.Group>
      <Toolbar.Separator />
      <Toolbar.Button render={<Button variant="secondary" size="sm" />}>Add job</Toolbar.Button>
      <Toolbar.Spacer />
      <Menu.Root>
        <Toolbar.Button render={<Menu.Trigger render={<IconButton label="More" />} />}>
          <MoreHorizontalIcon />
        </Toolbar.Button>
        <Menu.Content>
          <Menu.Item>Snooze</Menu.Item>
        </Menu.Content>
      </Menu.Root>
    </Toolbar.Root>
  );
}

describe('Toolbar', () => {
  it('is a labelled toolbar with a group, a separator, and wraps by default', async () => {
    const { container } = render(<Example />);
    const toolbar = screen.getByRole('toolbar', { name: 'Inbox actions' });
    expect(toolbar).toHaveClass('sc-toolbar');
    expect(toolbar).toHaveAttribute('data-wrap');
    expect(toolbar).toHaveAttribute('data-gap', 'xs');
    expect(screen.getByRole('group', { name: 'Sweeps' })).toHaveClass('sc-toolbar__group');
    expect(screen.getByRole('separator')).toHaveClass('sc-toolbar__separator');
    expect(screen.getByRole('button', { name: 'Pause' })).toHaveClass('sc-icon-button');
    await expectNoA11yViolations(container);
  });

  it('has one tab stop and moves between items with arrow keys', async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Pause' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Sweep now' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Add job' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'More' })).toHaveFocus();
    // focus loops
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Pause' })).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('button', { name: 'More' })).toHaveFocus();
    await user.keyboard('{Enter}');
    await screen.findByRole('menu');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  });

  it('can stop wrapping', () => {
    render(<Toolbar.Root aria-label="x" wrap={false} gap="sm" />);
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar).not.toHaveAttribute('data-wrap');
    expect(toolbar).toHaveAttribute('data-gap', 'sm');
  });
});
