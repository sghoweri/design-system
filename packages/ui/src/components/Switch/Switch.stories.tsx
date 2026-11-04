import type { Meta, StoryObj } from '@storybook/react-vite';
import { Switch } from './Switch';
import { Stack } from '../Stack/Stack';
import { DarkTheme } from '../../stories/helpers';

const meta = {
  title: 'Forms/Switch',
  component: Switch,
  args: { label: 'Pause my sweeps', description: undefined, labelPosition: 'end', disabled: false },
  argTypes: { labelPosition: { control: 'radio', options: ['end', 'start'] } },
} satisfies Meta<typeof Switch>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <Stack gap="md">
      <Switch label="Pause my sweeps" description="Stops the schedule for you only." />
      <Switch label="Notify on 90+" defaultChecked />
      <Switch label="On and disabled" defaultChecked disabled />
      <Switch label="Disabled" disabled />
    </Stack>
  ),
};

/** `labelPosition="start"` suits settings rows: the label leads and the switch sits at the end. */
export const SettingsRows: Story = {
  name: 'Settings rows',
  render: () => (
    <Stack gap="sm" style={{ maxWidth: 360 }}>
      <Switch label="Pause my sweeps" description="Stops the schedule for you only." labelPosition="start" />
      <Switch label="Global pause" description="Stops it for everyone." labelPosition="start" />
      <Switch label="Push on 90+" labelPosition="start" defaultChecked />
    </Stack>
  ),
};

export const Dark: Story = {
  name: 'Dark theme',
  render: () => (
    <DarkTheme>
      <Stack gap="md">
        <Switch label="Pause my sweeps" description="Stops the schedule for you only." />
        <Switch label="Notify on 90+" defaultChecked />
        <Switch label="Disabled" disabled />
      </Stack>
    </DarkTheme>
  ),
};
