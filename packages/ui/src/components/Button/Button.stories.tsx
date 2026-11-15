import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
import { Inline } from '../Inline/Inline';
import { Stack } from '../Stack/Stack';
import { Kbd } from '../Kbd/Kbd';
import { PlusIcon } from '../../icons/icons.gen';
import { DarkTheme } from '../../stories/helpers';

const meta = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'Add job', variant: 'primary', size: 'md' },
  argTypes: {
    variant: { control: 'radio', options: ['primary', 'secondary', 'ghost', 'danger'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <Inline gap="sm">
      <Button variant="primary">Add job</Button>
      <Button variant="secondary">Cancel</Button>
      <Button variant="ghost">Snooze</Button>
      <Button variant="danger">Delete application</Button>
    </Inline>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Inline gap="sm">
      <Button size="sm">Small 32</Button>
      <Button>Medium 40</Button>
      <Button size="lg">Large 48</Button>
    </Inline>
  ),
};

export const States: Story = {
  render: () => (
    <Stack gap="md">
      <Inline gap="sm">
        <Button disabled>Disabled</Button>
        <Button loading>Sending</Button>
        <Button variant="secondary" iconStart={<PlusIcon />}>
          With icon
        </Button>
        <Button variant="ghost" iconEnd={<PlusIcon />}>
          Icon after
        </Button>
      </Inline>
      <Button fullWidth variant="secondary">
        Full width
      </Button>
    </Stack>
  ),
};

function ShortcutRow() {
  return (
    <Inline gap="sm">
      <Button iconStart={<PlusIcon />} shortcut={<Kbd>N</Kbd>} aria-keyshortcuts="n">
        Add a job
      </Button>
      <Button variant="secondary" shortcut={<Kbd>R</Kbd>} aria-keyshortcuts="r">
        Refresh
      </Button>
      <Button variant="ghost" size="sm" shortcut={<Kbd>E</Kbd>} aria-keyshortcuts="e">
        Archive
      </Button>
      <Button variant="danger" shortcut={<Kbd>D</Kbd>} aria-keyshortcuts="d">
        Delete
      </Button>
      <Button
        variant="secondary"
        shortcut={
          <Kbd.Group label="Command K">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </Kbd.Group>
        }
        aria-keyshortcuts="Meta+K"
      >
        Search
      </Button>
    </Inline>
  );
}

/** `shortcut` shows a Kbd hint after the label, tinted to the button: dimmed on secondary and ghost, full strength on the primary and danger fills (4.5:1, `button-shortcut.test.ts`). It is hidden from the accessible name; announce the key with `aria-keyshortcuts`. */
export const Shortcut: Story = {
  name: 'Shortcut hint',
  render: () => (
    <Stack gap="md">
      <ShortcutRow />
      <DarkTheme>
        <ShortcutRow />
      </DarkTheme>
    </Stack>
  ),
};

export const CompactDensity: Story = {
  name: 'Compact density',
  render: () => (
    <div data-density="compact">
      <Inline gap="sm">
        <Button size="sm">Small 28</Button>
        <Button>Medium 32</Button>
        <Button size="lg">Large 40</Button>
      </Inline>
    </div>
  ),
};
