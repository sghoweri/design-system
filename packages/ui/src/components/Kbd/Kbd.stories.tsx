import type { Meta, StoryObj } from '@storybook/react-vite';
import { Kbd } from './Kbd';
import { Inline } from '../Inline/Inline';

const meta = {
  title: 'Components/Kbd',
  component: Kbd,
  args: { children: 'K' },
} satisfies Meta<typeof Kbd>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {};

export const Shortcuts: Story = {
  render: () => (
    <Inline gap="lg">
      <Inline gap="xs">
        <span>Search</span>
        <Kbd.Group label="Command K">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </Kbd.Group>
      </Inline>
      <Inline gap="xs">
        <span>Go to inbox</span>
        <Kbd.Group label="g then i" separator="space">
          <Kbd>g</Kbd>
          <Kbd>i</Kbd>
        </Kbd.Group>
      </Inline>
      <Inline gap="xs">
        <span>Close</span>
        <Kbd>Esc</Kbd>
      </Inline>
      <Inline gap="xs">
        <span>Send</span>
        <Kbd.Group label="Command Enter">
          <Kbd>⌘</Kbd>
          <Kbd>↵</Kbd>
        </Kbd.Group>
      </Inline>
    </Inline>
  ),
};
