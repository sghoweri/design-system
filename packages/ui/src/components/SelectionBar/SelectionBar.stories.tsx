import type { Meta, StoryObj } from '@storybook/react-vite';
import { SelectionBar } from './SelectionBar';
import { Button } from '../Button/Button';
import { Toolbar } from '../Toolbar/Toolbar';
import { DarkTheme } from '../../stories/helpers';

const actions = (
  <>
    <Toolbar.Button render={<Button variant="secondary" size="sm" />}>Close 4</Toolbar.Button>
    <Toolbar.Button render={<Button variant="secondary" size="sm" />}>Mark ghosted 2 of 4</Toolbar.Button>
    <Toolbar.Button render={<Button variant="secondary" size="sm" />} disabled>
      Reopen 0 of 4
    </Toolbar.Button>
  </>
);

const meta = {
  title: 'Components/SelectionBar',
  component: SelectionBar,
  args: { count: 4, onClear: () => undefined, children: actions },
} satisfies Meta<typeof SelectionBar>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The bar on its own, floating at the bottom of the canvas; see Table / Selection for it with a table. Hidden at count 0. */
export const Playground: Story = {};

export const Dark: Story = {
  name: 'Dark theme',
  render: (args) => (
    <DarkTheme>
      <SelectionBar {...args} />
    </DarkTheme>
  ),
};
