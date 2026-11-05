import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toolbar } from './Toolbar';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { Menu } from '../Menu/Menu';
import { Tooltip } from '../Tooltip/Tooltip';
import { Badge } from '../Badge/Badge';
import { Text } from '../Text/Text';
import {
  FilterIcon,
  MoreHorizontalIcon,
  PauseIcon,
  PlusIcon,
  RefreshIcon,
  SettingsIcon,
} from '../../icons/icons.gen';
import { Compact, DarkTheme } from '../../stories/helpers';

const meta: Meta<typeof Toolbar.Root> = {
  title: 'Components/Toolbar',
  component: Toolbar.Root,
};
export default meta;
type Story = StoryObj<typeof meta>;

// The anchor gets its name and icon from IconButton through `render`; in an app this is a Next.js `Link`.
// eslint-disable-next-line jsx-a11y/anchor-has-content
const settingsLink = <a href="#settings" />;

function InboxToolbar({ wrap = true }: { wrap?: boolean }) {
  return (
    <Tooltip.Provider>
      <Toolbar.Root aria-label="Inbox actions" wrap={wrap}>
        <Toolbar.Group aria-label="Sweeps">
          <Toolbar.Button render={<IconButton label="Pause my sweeps" tooltip />}>
            <PauseIcon />
          </Toolbar.Button>
          <Toolbar.Button render={<IconButton label="Sweep now" tooltip />}>
            <RefreshIcon />
          </Toolbar.Button>
        </Toolbar.Group>
        <Toolbar.Separator />
        <Toolbar.Group aria-label="View">
          <Toolbar.Button render={<IconButton label="Filter" tooltip />}>
            <FilterIcon />
          </Toolbar.Button>
          <Badge tone="info" size="sm">
            12 new
          </Badge>
        </Toolbar.Group>
        <Toolbar.Spacer />
        <Text as="span" tone="muted" size="xs">
          Last sweep 4 min ago
        </Text>
        <Toolbar.Button render={<Button size="sm" iconStart={<PlusIcon />} />}>Add job</Toolbar.Button>
        <Menu.Root>
          <Toolbar.Button render={<Menu.Trigger render={<IconButton label="More actions" tooltip />} />}>
            <MoreHorizontalIcon />
          </Toolbar.Button>
          <Menu.Content align="end">
            <Menu.Item icon={<SettingsIcon />}>Settings</Menu.Item>
            <Menu.Item>Export CSV</Menu.Item>
          </Menu.Content>
        </Menu.Root>
      </Toolbar.Root>
    </Tooltip.Provider>
  );
}

/** Tab once to enter, arrow keys move between controls, Tab leaves. The spacer pushes the rest to the end. */
export const Inbox: Story = { render: () => <InboxToolbar /> };

export const Narrow: Story = {
  name: 'Narrow, wrapping',
  render: () => (
    <div
      style={{
        maxWidth: 320,
        border: '1px dashed var(--sc-color-border-default)',
        padding: 'var(--sc-spacing-xs)',
      }}
    >
      <InboxToolbar />
    </div>
  ),
};

export const NoWrap: Story = {
  name: 'Narrow, one line that scrolls',
  render: () => (
    <div
      style={{
        maxWidth: 320,
        border: '1px dashed var(--sc-color-border-default)',
        padding: 'var(--sc-spacing-xs)',
      }}
    >
      <InboxToolbar wrap={false} />
    </div>
  ),
};

export const CompactDensity: Story = {
  name: 'Compact density',
  render: () => (
    <Compact>
      <InboxToolbar />
    </Compact>
  ),
};

export const Dark: Story = {
  name: 'Dark theme',
  render: () => (
    <DarkTheme>
      <InboxToolbar />
    </DarkTheme>
  ),
};

/** `Toolbar.Link` joins the arrow-key navigation as a real anchor. The IconButton renders the `<a>` (or a Next.js `Link`). */
export const WithLink: Story = {
  name: 'With a link',
  render: () => (
    <Tooltip.Provider>
      <Toolbar.Root aria-label="Inbox actions">
        <Toolbar.Button render={<IconButton label="Sweep now" tooltip />}>
          <RefreshIcon />
        </Toolbar.Button>
        <Toolbar.Button render={<IconButton label="Filter" tooltip />}>
          <FilterIcon />
        </Toolbar.Button>
        <Toolbar.Spacer />
        <Toolbar.Link render={<IconButton label="Settings" tooltip render={settingsLink} />}>
          <SettingsIcon />
        </Toolbar.Link>
        <Toolbar.Link href="#help" className="sc-button" data-variant="ghost" data-size="sm">
          Help
        </Toolbar.Link>
      </Toolbar.Root>
    </Tooltip.Provider>
  ),
};
