import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Avatar, AvatarButton, avatarInitials } from './Avatar';
import { Menu } from '../Menu/Menu';
import { expectNoA11yViolations } from '../../../test/axe';

// jsdom never loads images. This stand-in for `window.Image` (what Base UI preloads with) fires load or error as
// soon as `src` is set, by URL.
class FakeImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  complete = false;
  naturalWidth = 0;
  crossOrigin: string | null = null;
  set src(url: string) {
    queueMicrotask(() => (url.includes('broken') ? this.onerror?.() : this.onload?.()));
  }
}

describe('avatarInitials', () => {
  it.each([
    ['Robin Test', 'RT'],
    ['  robin  ', 'R'],
    ['Ana María de la Cruz', 'AC'],
    ['robin@example.com', 'R'],
    ['robin.test+jobs@example.com', 'RJ'],
    ['robin2@example.com', 'R'],
    ['Émile Zola', 'ÉZ'],
    ['', ''],
    [null, ''],
    [undefined, ''],
  ])('%j → %j', (name, expected) => {
    expect(avatarInitials(name)).toBe(expected);
  });
});

describe('Avatar', () => {
  it('shows initials from name, md by default, decorative and hidden from assistive tech', async () => {
    const { container } = render(<Avatar name="Robin Test" />);
    const avatar = container.querySelector('.sc-avatar')!;
    expect(avatar).toHaveTextContent('RT');
    expect(avatar).toHaveAttribute('data-size', 'md');
    expect(avatar).toHaveAttribute('aria-hidden', 'true');
    expect(avatar).not.toHaveAttribute('role');
    expect(screen.queryByRole('img')).toBeNull();
    await expectNoA11yViolations(container);
  });

  it('is an image named by label when labelled', async () => {
    const { container } = render(<Avatar name="Robin Test" label="Robin Test" size="lg" />);
    const avatar = screen.getByRole('img', { name: 'Robin Test' });
    expect(avatar).toHaveAttribute('data-size', 'lg');
    expect(avatar).not.toHaveAttribute('aria-hidden');
    await expectNoA11yViolations(container);
  });

  it('takes an initials override, up to two characters', () => {
    const { container, rerender } = render(<Avatar name="Robin Test" initials="JS" />);
    expect(container).toHaveTextContent('JS');
    rerender(<Avatar name="Robin Test" initials="ABC" />);
    expect(container).toHaveTextContent('AB');
  });

  it('shows a person glyph with no name and no initials', () => {
    const { container } = render(<Avatar />);
    expect(container.querySelector('svg.sc-avatar__icon')).not.toBeNull();
    expect(container.querySelector('.sc-avatar__initials')).toBeNull();
  });

  it('shows the picture once it loads, in place of the initials', async () => {
    vi.stubGlobal('Image', FakeImage);
    try {
      const { container } = render(<Avatar name="Robin Test" src="/robin.jpg" label="Robin Test" />);
      const img = await waitFor(() => {
        const el = container.querySelector('img');
        expect(el).not.toBeNull();
        return el!;
      });
      expect(img).toHaveAttribute('src', '/robin.jpg');
      expect(img).toHaveAttribute('alt', '');
      expect(container).not.toHaveTextContent('RT');
      await expectNoA11yViolations(container);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('keeps the initials when the picture fails to load', async () => {
    vi.stubGlobal('Image', FakeImage);
    try {
      const { container } = render(<Avatar name="Robin Test" src="/broken.jpg" />);
      await act(async () => {
        await Promise.resolve();
      });
      expect(container.querySelector('img')).toBeNull();
      expect(container).toHaveTextContent('RT');
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe('AvatarButton', () => {
  it('is a native button named by label, with the avatar inside hidden', async () => {
    const onClick = vi.fn();
    const { container } = render(
      <AvatarButton label="Account: Robin Test" name="Robin Test" size="sm" onClick={onClick} />,
    );
    const button = screen.getByRole('button', { name: 'Account: Robin Test' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('sc-avatar-button');
    expect(button).toHaveTextContent('RT');
    expect(button.querySelector('.sc-avatar')).toHaveAttribute('aria-hidden', 'true');
    expect(button.querySelector('.sc-avatar')).toHaveAttribute('data-size', 'sm');
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
    await expectNoA11yViolations(container);
  });

  it('renders as a link through render', () => {
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    render(<AvatarButton label="Your profile" name="Robin Test" render={<a href="/profile" />} />);
    const link = screen.getByRole('link', { name: 'Your profile' });
    expect(link).toHaveAttribute('href', '/profile');
    expect(link).not.toHaveAttribute('type');
  });

  it('is a menu trigger through Menu.Trigger render', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Menu.Root>
        <Menu.Trigger render={<AvatarButton label="Account: Robin Test" name="Robin Test" />} />
        <Menu.Content align="end">
          <Menu.Item>Sign out</Menu.Item>
        </Menu.Content>
      </Menu.Root>,
    );
    const trigger = screen.getByRole('button', { name: 'Account: Robin Test' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveClass('sc-avatar-button');
    await expectNoA11yViolations(container);
    await user.click(trigger);
    expect(await screen.findByRole('menuitem', { name: 'Sign out' })).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
    expect(document.activeElement).toBe(trigger);
  });
});
