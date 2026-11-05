import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconButton } from './IconButton';
import { Tooltip } from '../Tooltip/Tooltip';
import { Inline } from '../Inline/Inline';
import { Stack } from '../Stack/Stack';
import {
  FilterIcon,
  MoreHorizontalIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  RefreshIcon,
  SettingsIcon,
  TrashIcon,
  XIcon,
} from '../../icons/icons.gen';
import { Compact, DarkTheme } from '../../stories/helpers';

const meta = {
  title: 'Components/IconButton',
  component: IconButton,
  args: {
    label: 'Pause sweeps',
    variant: 'ghost',
    size: 'md',
    tooltip: true,
    round: false,
    children: <PauseIcon />,
  },
  argTypes: {
    variant: { control: 'radio', options: ['ghost', 'secondary', 'primary', 'danger'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    tooltip: { control: 'boolean' },
    children: { control: false },
  },
} satisfies Meta<typeof IconButton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

// The anchors get their name and icon from IconButton through `render`; in an app this is a Next.js `Link`.
/* eslint-disable jsx-a11y/anchor-has-content */
const settingsLink = <a href="#settings" />;
const postingLink = <a href="#posting" target="_blank" rel="noreferrer" />;
/* eslint-enable jsx-a11y/anchor-has-content */

export const Variants: Story = {
  render: () => (
    <Inline gap="sm">
      <IconButton label="Settings">
        <SettingsIcon />
      </IconButton>
      <IconButton label="Filter" variant="secondary">
        <FilterIcon />
      </IconButton>
      <IconButton label="Add job" variant="primary">
        <PlusIcon />
      </IconButton>
      <IconButton label="Delete" variant="danger">
        <TrashIcon />
      </IconButton>
      <IconButton label="Close" round>
        <XIcon />
      </IconButton>
    </Inline>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Inline gap="sm">
      <IconButton label="Refresh" size="sm" variant="secondary">
        <RefreshIcon />
      </IconButton>
      <IconButton label="Refresh" variant="secondary">
        <RefreshIcon />
      </IconButton>
      <IconButton label="Refresh" size="lg" variant="secondary">
        <RefreshIcon />
      </IconButton>
    </Inline>
  ),
};

export const States: Story = {
  render: () => (
    <Inline gap="sm">
      <IconButton label="Play" disabled>
        <PlayIcon />
      </IconButton>
      <IconButton label="Sweeping" loading variant="secondary">
        <RefreshIcon />
      </IconButton>
    </Inline>
  ),
};

/** Wrap a row in `Tooltip.Provider` so moving between buttons shows each hint without the delay. */
export const ToolbarRow: Story = {
  name: 'Row with tooltips',
  render: () => (
    <Tooltip.Provider>
      <Inline gap="2xs">
        <IconButton label="Pause my sweeps" tooltip>
          <PauseIcon />
        </IconButton>
        <IconButton label="Sweep now" tooltip="Sweep now (S)">
          <RefreshIcon />
        </IconButton>
        <IconButton label="Filter" tooltip>
          <FilterIcon />
        </IconButton>
        <IconButton label="Settings" tooltip tooltipSide="bottom">
          <SettingsIcon />
        </IconButton>
        <IconButton label="More actions" tooltip>
          <MoreHorizontalIcon />
        </IconButton>
      </Inline>
    </Tooltip.Provider>
  ),
};

export const CompactDensity: Story = {
  name: 'Compact density',
  render: () => (
    <Compact>
      <Inline gap="sm">
        <IconButton label="Refresh" size="sm" variant="secondary">
          <RefreshIcon />
        </IconButton>
        <IconButton label="Refresh" variant="secondary">
          <RefreshIcon />
        </IconButton>
        <IconButton label="Refresh" size="lg" variant="secondary">
          <RefreshIcon />
        </IconButton>
      </Inline>
    </Compact>
  ),
};

export const Dark: Story = {
  name: 'Dark theme',
  render: () => (
    <DarkTheme>
      <Stack gap="sm">
        <Inline gap="sm">
          <IconButton label="Settings" tooltip>
            <SettingsIcon />
          </IconButton>
          <IconButton label="Filter" variant="secondary" tooltip>
            <FilterIcon />
          </IconButton>
          <IconButton label="Add job" variant="primary" tooltip>
            <PlusIcon />
          </IconButton>
          <IconButton label="Delete" variant="danger" tooltip>
            <TrashIcon />
          </IconButton>
        </Inline>
      </Stack>
    </DarkTheme>
  ),
};

/** `render` swaps the element: an `<a>` here, a Next.js `Link` in an app. Name and look stay. */
export const AsLink: Story = {
  name: 'As a link (render)',
  render: () => (
    <Tooltip.Provider>
      <Inline gap="2xs">
        <IconButton label="Settings" tooltip render={settingsLink}>
          <SettingsIcon />
        </IconButton>
        <IconButton label="Open posting" tooltip variant="secondary" render={postingLink}>
          <PlusIcon />
        </IconButton>
      </Inline>
    </Tooltip.Provider>
  ),
};
