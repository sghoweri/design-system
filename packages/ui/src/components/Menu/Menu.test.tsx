import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Menu } from './Menu';
import { IconButton } from '../IconButton/IconButton';
import { EyeOffIcon, MoreHorizontalIcon, PauseIcon } from '../../icons/icons.gen';
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

  it('gives an item a description line that is its accessible description, not part of its name', async () => {
    const user = userEvent.setup();
    render(
      <Menu.Root>
        <Menu.Trigger>Options</Menu.Trigger>
        <Menu.Content>
          <Menu.Item icon={<EyeOffIcon />} description="Leave it out of this list">
            Hide
          </Menu.Item>
          <Menu.Item description="Lower in the list" trailing="3">
            Move down
          </Menu.Item>
          <Menu.LinkItem href="#help" description="Opens the guide">
            Help
          </Menu.LinkItem>
          <Menu.Item aria-describedby="outside" description="Kept after the caller's id">
            Keep
          </Menu.Item>
          <Menu.Item icon={<PauseIcon />}>Pause</Menu.Item>
          <Menu.Item>Plain</Menu.Item>
        </Menu.Content>
      </Menu.Root>,
    );
    await user.click(screen.getByRole('button', { name: 'Options' }));
    await screen.findByRole('menu');

    const hide = screen.getByRole('menuitem', { name: 'Hide' });
    expect(hide).toHaveAccessibleDescription('Leave it out of this list');
    expect(hide.querySelector('.sc-menu__description')).toHaveTextContent('Leave it out of this list');
    // the icon is decorative
    const icon = hide.querySelector('.sc-menu__icon');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon?.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');

    // trailing text stays in the name, the description stays out of it
    const down = screen.getByRole('menuitem', { name: 'Move down 3' });
    expect(down).toHaveAccessibleDescription('Lower in the list');

    const help = screen.getByRole('menuitem', { name: 'Help' });
    expect(help).toHaveAttribute('href', '#help');
    expect(help).toHaveAccessibleDescription('Opens the guide');

    const keep = screen.getByRole('menuitem', { name: 'Keep' });
    expect(keep.getAttribute('aria-describedby')?.split(' ')[0]).toBe('outside');

    await expectNoA11yViolations(document.body);
  });

  it('leaves items without a description as they were: name from content, no ARIA references', async () => {
    const user = userEvent.setup();
    render(
      <Menu.Root>
        <Menu.Trigger>Options</Menu.Trigger>
        <Menu.Content>
          <Menu.Item icon={<PauseIcon />} trailing="Z">
            Pause
          </Menu.Item>
          <Menu.LinkItem href="#plain">Plain</Menu.LinkItem>
        </Menu.Content>
      </Menu.Root>,
    );
    await user.click(screen.getByRole('button', { name: 'Options' }));
    await screen.findByRole('menu');
    for (const item of [
      screen.getByRole('menuitem', { name: /^Pause/ }),
      screen.getByRole('menuitem', { name: 'Plain' }),
    ]) {
      expect(item).not.toHaveAttribute('aria-labelledby');
      expect(item).not.toHaveAttribute('aria-describedby');
      expect(item).toHaveAccessibleDescription('');
      expect(item.querySelector('.sc-menu__description')).toBeNull();
      expect([...item.children].map((c) => c.className)).toEqual(
        item.textContent?.includes('Z')
          ? ['sc-menu__icon', 'sc-menu__label', 'sc-menu__trailing']
          : ['sc-menu__icon', 'sc-menu__label'],
      );
      for (const child of item.querySelectorAll('span')) expect(child).not.toHaveAttribute('id');
    }
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

  it('names the menu from Menu.Header, which no key or pointer can reach as an item', async () => {
    const user = userEvent.setup();
    render(
      <Menu.Root>
        <Menu.Trigger>Account</Menu.Trigger>
        <Menu.Content>
          <Menu.Header caption="Signed in as">salem@example.com</Menu.Header>
          <Menu.Separator />
          <Menu.Item>Settings</Menu.Item>
          <Menu.Item>Sign out</Menu.Item>
        </Menu.Content>
      </Menu.Root>,
    );
    await user.click(screen.getByRole('button', { name: 'Account' }));
    const menu = await screen.findByRole('menu', { name: 'Signed in as salem@example.com' });
    const header = screen.getByText('salem@example.com').closest('.sc-menu__header')!;
    expect(header).toHaveAttribute('role', 'none');
    expect(menu).toHaveAttribute('aria-labelledby', header.id);
    expect(screen.getAllByRole('menuitem')).toHaveLength(2);
    await expectNoA11yViolations(document.body);

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Settings' })).toHaveAttribute('data-highlighted');
    await user.keyboard('{End}{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Settings' })).toHaveAttribute('data-highlighted');
  });

  it("keeps the caller's aria-label or aria-labelledby over the header", async () => {
    render(
      <>
        <span id="outside">Account menu</span>
        <Menu.Root defaultOpen>
          <Menu.Trigger>Account</Menu.Trigger>
          <Menu.Content aria-labelledby="outside">
            <Menu.Header>salem@example.com</Menu.Header>
            <Menu.Item>Settings</Menu.Item>
          </Menu.Content>
        </Menu.Root>
      </>,
    );
    expect(await screen.findByRole('menu', { name: 'Account menu' })).toBeInTheDocument();
  });

  it('submits its form from an item rendered as a native submit button, then closes', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <Menu.Root>
        <Menu.Trigger>Account</Menu.Trigger>
        <Menu.Content>
          <Menu.Item>Settings</Menu.Item>
          <form onSubmit={onSubmit}>
            <Menu.Item nativeButton render={<button type="submit" />}>
              Sign out
            </Menu.Item>
          </form>
        </Menu.Content>
      </Menu.Root>,
    );
    await user.click(screen.getByRole('button', { name: 'Account' }));
    const item = await screen.findByRole('menuitem', { name: 'Sign out' });
    expect(item.tagName).toBe('BUTTON');
    expect(item).toHaveAttribute('type', 'submit');
    expect(item).toHaveClass('sc-menu__item');
    await expectNoA11yViolations(document.body);

    await user.click(item);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  });

  it('submits from the keyboard too', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <Menu.Root>
        <Menu.Trigger>Account</Menu.Trigger>
        <Menu.Content>
          <form onSubmit={onSubmit}>
            <Menu.Item nativeButton render={<button type="submit" />}>
              Sign out
            </Menu.Item>
          </form>
        </Menu.Content>
      </Menu.Root>,
    );
    screen.getByRole('button', { name: 'Account' }).focus();
    await user.keyboard('{Enter}');
    await screen.findByRole('menu');
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Sign out' })).toHaveFocus());
    await user.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
