import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tooltip } from './Tooltip';
import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { Inline } from '../Inline/Inline';
import { Kbd } from '../Kbd/Kbd';
import { Stack } from '../Stack/Stack';
import { RefreshIcon } from '../../icons/icons.gen';
import { DarkTheme } from '../../stories/helpers';

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  parameters: { layout: 'centered' },
  args: {
    content: 'Runs every source now',
    side: 'top',
    align: 'center',
    children: <Button variant="secondary">Sweep now</Button>,
  },
  argTypes: {
    side: { control: 'radio', options: ['top', 'bottom', 'left', 'right'] },
    align: { control: 'radio', options: ['start', 'center', 'end'] },
    children: { control: false },
  },
} satisfies Meta<typeof Tooltip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Placements: Story = {
  render: () => (
    <Inline gap="md">
      {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
        <Tooltip key={side} content={`Opens on the ${side}`} side={side}>
          <Button variant="secondary">{side}</Button>
        </Tooltip>
      ))}
    </Inline>
  ),
};

/** The usual case: an IconButton with `tooltip`, which wires this component for you. */
export const OnIconButton: Story = {
  name: 'On IconButton',
  render: () => (
    <IconButton label="Sweep now" tooltip>
      <RefreshIcon />
    </IconButton>
  ),
};

/** A Badge is not focusable; give it `tabIndex={0}` so keyboard users get the hint too. */
export const OnBadge: Story = {
  render: () => (
    <Tooltip content="Replied 2 days ago via Greenhouse">
      <Badge tone="success" tabIndex={0}>
        Replied
      </Badge>
    </Tooltip>
  ),
};

export const WithShortcut: Story = {
  name: 'With a shortcut',
  render: () => (
    <Tooltip
      content={
        <Inline gap="xs" wrap={false}>
          Sweep now
          <Kbd.Group label="S">
            <Kbd>S</Kbd>
          </Kbd.Group>
        </Inline>
      }
    >
      <Button variant="secondary">Sweep now</Button>
    </Tooltip>
  ),
};

export const Controlled: Story = {
  name: 'Controlled, open',
  render: () => (
    <Tooltip content="Always visible for review" open>
      <Button variant="secondary">Trigger</Button>
    </Tooltip>
  ),
};

export const Dark: Story = {
  name: 'Dark theme',
  render: () => (
    <DarkTheme>
      <Stack gap="md" align="center">
        <Tooltip content="Tooltips invert against the theme" open>
          <Button variant="secondary">Trigger</Button>
        </Tooltip>
      </Stack>
    </DarkTheme>
  ),
};
