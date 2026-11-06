import type { Meta, StoryObj } from '@storybook/react-vite';
import { Quote } from './Quote';
import { DarkTheme } from '../../stories/helpers';

const meta: Meta<typeof Quote> = {
  title: 'Components/Quote',
  component: Quote,
  args: { label: 'You', children: 'Less modest about the migration. Mention the zero-downtime cutover.' },
  decorators: [(Story) => <div style={{ maxWidth: 480 }}>{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof meta>;

/** Someone's own words echoed back, with who said them. The label is the figure's caption. */
export const Playground: Story = {};

export const Dark: Story = {
  render: (args) => (
    <DarkTheme>
      <Quote {...args} />
    </DarkTheme>
  ),
};
