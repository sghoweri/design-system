import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Menu } from './Menu';
import { IconButton } from '../IconButton/IconButton';
import { MoreHorizontalIcon, PauseIcon } from '../../icons/icons.gen';
import { expectNoA11yViolations } from '../../../test/axe';

function Example({ onPauseMine = () => {} }: { onPauseMine?: () => void }) {
  const [stale, setStale] = useState(false);
  const [sort, setSort] = useState('score');
  return (
    <Menu.Root>
      <Menu.Trigger>Pause</Menu.Trigger>
      <Menu.Content>
        <Menu.Item icon={<PauseIcon />} onClick={onPauseMine}>
          Pause mine
        </Menu.Item>
        <Menu.Item disabled>Pause all</Menu.Item>
        <Menu.Separator />
        <Menu.CheckboxItem checked={stale} onCheckedChange={setStale}>
          Show stale
        </Menu.CheckboxItem>
        <Menu.RadioGroup label="Sort by" value={sort} onValueChange={setSort}>
          <Menu.RadioItem value="score">Score</Menu.RadioItem>
          <Menu.RadioItem value="date">Date</Menu.RadioItem>
        </Menu.RadioGroup>
        <Menu.Separator />
        <Menu.LinkItem href="#archive">Archive</Menu.LinkItem>
        <Menu.Item tone="danger">Delete</Menu.Item>
      </Menu.Content>
    </Menu.Root>
  );
}

describe('Menu', () => {
  it('renders a secondary Button trigger by default, closed, with aria-haspopup', () => {
    render(<Example />);
    const trigger = screen.getByRole('button', { name: 'Pause' });
    expect(trigger).toHaveClass('sc-button');
    expect(trigger).toHaveAttribute('data-variant', 'secondary');
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('opens on click with every item type in its role, and fires onClick then closes', async () => {
    const user = userEvent.setup();
    const onPauseMine = vi.fn();
    render(<Example onPauseMine={onPauseMine} />);
    await user.click(screen.getByRole('button', { name: 'Pause' }));
    const menu = await screen.findByRole('menu');
    expect(menu).toHaveClass('sc-menu');
    expect(screen.getByRole('menuitem', { name: 'Pause mine' })).toHaveAttribute('data-tone', 'default');
    expect(screen.getByRole('menuitem', { name: 'Pause all' })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('menuitemcheckbox', { name: 'Show stale' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
    expect(screen.getByRole('menuitemradio', { name: 'Score' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('menuitemradio', { name: 'Date' })).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('group', { name: 'Sort by' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Archive' })).toHaveAttribute('href', '#archive');
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveAttribute('data-tone', 'danger');
    expect(screen.getAllByRole('separator')).toHaveLength(2);
    await expectNoA11yViolations(document.body);

    await user.click(screen.getByRole('menuitem', { name: 'Pause mine' }));
    expect(onPauseMine).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  });

  it('closes when a link item is chosen, unless closeOnClick is false', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Example />);
    await user.click(screen.getByRole('button', { name: 'Pause' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Archive' }));
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    unmount();

    render(
      <Menu.Root>
        <Menu.Trigger>Go</Menu.Trigger>
        <Menu.Content>
          <Menu.LinkItem href="#stay" closeOnClick={false}>
            Stay
          </Menu.LinkItem>
        </Menu.Content>
      </Menu.Root>,
    );
    await user.click(screen.getByRole('button', { name: 'Go' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Stay' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('toggles a checkbox item without closing and selects a radio item', async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole('button', { name: 'Pause' }));
    await screen.findByRole('menu');
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Show stale' }));
    expect(screen.getByRole('menuitemcheckbox', { name: 'Show stale' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await user.click(screen.getByRole('menuitemradio', { name: 'Date' }));
    expect(screen.getByRole('menuitemradio', { name: 'Date' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('menuitemradio', { name: 'Score' })).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('is keyboard complete: arrows move highlight, Enter activates, Escape closes and returns focus', async () => {
    const user = userEvent.setup();
    const onPauseMine = vi.fn();
    render(<Example onPauseMine={onPauseMine} />);
    const trigger = screen.getByRole('button', { name: 'Pause' });
    trigger.focus();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('menu');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Pause mine' })).toHaveFocus());
    await user.keyboard('{ArrowDown}');
    // disabled items stay focusable so screen readers can reach them
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Pause all' })).toHaveFocus());
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(screen.getByRole('menuitemcheckbox', { name: 'Show stale' })).toHaveFocus());
    await user.keyboard('{ArrowUp}{ArrowUp}');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Pause mine' })).toHaveFocus());
    await user.keyboard('{Enter}');
    expect(onPauseMine).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());

    await user.click(trigger);
    await screen.findByRole('menu');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('renders an IconButton through the trigger render prop and reports open state', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Menu.Root onOpenChange={onOpenChange}>
        <Menu.Trigger render={<IconButton label="More actions" />}>
          <MoreHorizontalIcon />
        </Menu.Trigger>
        <Menu.Content align="end">
          <Menu.Item>Snooze</Menu.Item>
        </Menu.Content>
      </Menu.Root>,
    );
    const trigger = screen.getByRole('button', { name: 'More actions' });
    expect(trigger).toHaveClass('sc-icon-button');
    await user.click(trigger);
    await screen.findByRole('menu');
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(trigger).toHaveAttribute('data-popup-open');
  });
});
