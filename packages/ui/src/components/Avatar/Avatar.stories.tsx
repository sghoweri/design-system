import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar, AvatarButton } from './Avatar';
import { Menu } from '../Menu/Menu';
import { Inline } from '../Inline/Inline';
import { Stack } from '../Stack/Stack';
import { Text } from '../Text/Text';
import { SettingsIcon } from '../../icons/icons.gen';
import { Compact, DarkTheme } from '../../stories/helpers';

// A stand-in picture, inline so the story needs no network.
const picture =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><defs><linearGradient id="g" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#f4b183"/><stop offset="1" stop-color="#7d4e9e"/></linearGradient></defs>' +
      '<rect width="96" height="96" fill="url(#g)"/><circle cx="48" cy="38" r="17" fill="#fde7d6"/>' +
      '<path d="M16 96c4-22 18-32 32-32s28 10 32 32z" fill="#fde7d6"/></svg>',
  );

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  args: { name: 'Robin Test', size: 'md' },
  argTypes: {
    size: { control: 'radio', options: ['xs', 'sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Avatar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <Inline gap="sm" align="center">
      <Avatar name="Robin Test" size="xs" />
      <Avatar name="Robin Test" size="sm" />
      <Avatar name="Robin Test" />
      <Avatar name="Robin Test" size="lg" />
    </Inline>
  ),
};

/** From a name, from an email address, an override, and nothing at all (a person glyph). */
export const Initials: Story = {
  render: () => (
    <Inline gap="sm" align="center">
      <Avatar name="Robin Test" label="Robin Test" />
      <Avatar name="robin@example.com" label="robin@example.com" />
      <Avatar name="Robin Test" initials="Ro" label="Robin Test" />
      <Avatar label="Unknown person" />
    </Inline>
  ),
};

/** A picture once it loads; a picture that fails keeps the initials. */
export const Picture: Story = {
  render: () => (
    <Inline gap="sm" align="center">
      <Avatar name="Robin Test" src={picture} label="Robin Test" size="lg" />
      <Avatar name="Robin Test" src="/missing-avatar.png" label="Robin Test" size="lg" />
    </Inline>
  ),
};

/** Decorative beside the name it repeats; labelled when it stands alone. */
export const Labelling: Story = {
  render: () => (
    <Stack gap="sm">
      <Inline gap="xs" align="center">
        <Avatar name="Robin Test" size="xs" />
        <Text>Robin Test</Text>
      </Inline>
      <Avatar name="Robin Test" label="Robin Test" />
    </Stack>
  ),
};

/** The account menu: the ring thickens on hover and while the menu is open; on touch the hit area is 44px. */
export const AccountMenu: Story = {
  name: 'AvatarButton as a menu trigger',
  render: () => (
    <Inline gap="sm" align="center">
      <Menu.Root modal={false}>
        <Menu.Trigger render={<AvatarButton label="Account: Robin Test" name="Robin Test" size="sm" />} />
        <Menu.Content align="end">
          <Menu.LinkItem icon={<SettingsIcon size="sm" />} href="#settings">
            Settings
          </Menu.LinkItem>
          <Menu.Item>Sign out</Menu.Item>
        </Menu.Content>
      </Menu.Root>
      <AvatarButton label="Your profile" name="Robin Test" src={picture} />
      <AvatarButton label="Account (unavailable)" name="Robin Test" disabled />
    </Inline>
  ),
};

/** Header canvas, both themes: the ring keeps the circle visible where the tint alone would not be. */
export const OnCanvas: Story = {
  name: 'On the canvas, light and dark',
  render: () => (
    <Stack gap="md">
      <div style={{ padding: 'var(--sc-spacing-lg)', background: 'var(--sc-color-surface-canvas)' }}>
        <Inline gap="sm" align="center">
          <Avatar name="Robin Test" size="sm" />
          <Avatar name="Robin Test" />
          <AvatarButton label="Account: Robin Test" name="Robin Test" size="sm" />
          <Avatar name="Robin Test" src={picture} />
        </Inline>
      </div>
      <DarkTheme>
        <Inline gap="sm" align="center">
          <Avatar name="Robin Test" size="sm" />
          <Avatar name="Robin Test" />
          <AvatarButton label="Account: Robin Test" name="Robin Test" size="sm" />
          <Avatar name="Robin Test" src={picture} />
        </Inline>
      </DarkTheme>
    </Stack>
  ),
};

export const CompactDensity: Story = {
  name: 'Compact density',
  render: () => (
    <Compact>
      <Inline gap="sm" align="center">
        <Avatar name="Robin Test" size="sm" />
        <Avatar name="Robin Test" />
        <Avatar name="Robin Test" size="lg" />
      </Inline>
    </Compact>
  ),
};
