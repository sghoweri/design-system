import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Select } from './Select';
import { Stack } from '../Stack/Stack';
import { Inline } from '../Inline/Inline';
import { Text } from '../Text/Text';
import { Button } from '../Button/Button';
import { Compact, DarkTheme } from '../../stories/helpers';

const sortOptions = [
  { value: 'score', label: 'Score' },
  { value: 'date', label: 'Date posted' },
  { value: 'company', label: 'Company' },
  { value: 'comp', label: 'Compensation', disabled: true },
];

const grouped = [
  {
    label: 'Open',
    options: [
      { value: 'new', label: 'New' },
      { value: 'screening', label: 'Screening' },
    ],
  },
  {
    label: 'Done',
    options: [
      { value: 'replied', label: 'Replied' },
      { value: 'rejected', label: 'Rejected' },
    ],
  },
];

const meta: Meta<typeof Select> = {
  title: 'Forms/Select',
  component: Select,
  args: { label: 'Sort by', options: sortOptions, placeholder: 'Choose…', size: 'md', fullWidth: false },
  argTypes: { size: { control: 'radio', options: ['sm', 'md', 'lg'] } },
  decorators: [(Story) => <div style={{ maxWidth: 360 }}>{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

function Controlled() {
  const [value, setValue] = useState<string | null>('score');
  return (
    <Stack gap="xs">
      <Select label="Sort by" options={sortOptions} value={value} onValueChange={setValue} />
      <Text tone="muted">Value: {String(value)}</Text>
    </Stack>
  );
}

export const States: Story = {
  render: () => (
    <Stack gap="md">
      <Controlled />
      <Select
        label="Status"
        options={grouped}
        defaultValue="replied"
        description="Grouped options with headings."
      />
      <Select label="Status" options={grouped} error="Pick a status." />
      <Select label="Sort by" options={sortOptions} defaultValue="date" disabled />
      <Select label="Sort by" options={sortOptions} fullWidth placeholder="Full width" />
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Inline gap="sm" align="end">
      <Select label="Small" size="sm" options={sortOptions} defaultValue="score" />
      <Select label="Medium" options={sortOptions} defaultValue="score" />
      <Select label="Large" size="lg" options={sortOptions} defaultValue="score" />
    </Inline>
  ),
};

export const CompactDensity: Story = {
  name: 'Compact density',
  render: () => (
    <Compact>
      <Inline gap="sm" align="end">
        <Select label="Small" size="sm" options={sortOptions} defaultValue="score" />
        <Select label="Medium" options={sortOptions} defaultValue="score" />
      </Inline>
    </Compact>
  ),
};

export const Dark: Story = {
  name: 'Dark theme',
  render: () => (
    <DarkTheme>
      <Stack gap="md">
        <Select label="Sort by" options={sortOptions} defaultValue="score" />
        <Select label="Status" options={grouped} error="Pick a status." />
      </Stack>
    </DarkTheme>
  ),
};

function Clearable() {
  const [value, setValue] = useState<string | null>('date');
  return (
    <Stack gap="xs">
      <Select
        label="Sort by"
        options={sortOptions}
        value={value}
        onValueChange={setValue}
        clearable
        fullWidth
      />
      <Inline gap="xs">
        <Text tone="muted">Value: {String(value)}</Text>
        <Button size="sm" variant="ghost" onClick={() => setValue(null)}>
          Set null from outside
        </Button>
      </Inline>
    </Stack>
  );
}

/** `value={null}` shows the placeholder; `clearable` adds an × (and Backspace/Delete on the trigger) that calls `onValueChange(null)`. */
export const ClearableStory: Story = {
  name: 'Nullable and clearable',
  render: () => <Clearable />,
};
