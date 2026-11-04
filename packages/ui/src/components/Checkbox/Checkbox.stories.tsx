import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Checkbox } from './Checkbox';
import { Stack } from '../Stack/Stack';
import { DarkTheme } from '../../stories/helpers';

const meta = {
  title: 'Forms/Checkbox',
  component: Checkbox,
  args: { label: 'Show stale postings', description: undefined, disabled: false, indeterminate: false },
} satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

function Group() {
  const [sources, setSources] = useState({ greenhouse: true, ashby: false, lever: true });
  const values = Object.values(sources);
  const all = values.every(Boolean);
  const some = values.some(Boolean) && !all;
  return (
    <Stack as="fieldset" gap="xs">
      <legend className="sc-visually-hidden">Sources</legend>
      <Checkbox
        label="All sources"
        checked={all}
        indeterminate={some}
        onCheckedChange={(next) => setSources({ greenhouse: next, ashby: next, lever: next })}
      />
      <Stack gap="xs" style={{ paddingInlineStart: 'var(--sc-spacing-lg)' }}>
        {(Object.keys(sources) as Array<keyof typeof sources>).map((key) => (
          <Checkbox
            key={key}
            label={key[0]!.toUpperCase() + key.slice(1)}
            checked={sources[key]}
            onCheckedChange={(next) => setSources({ ...sources, [key]: next })}
          />
        ))}
      </Stack>
    </Stack>
  );
}

export const States: Story = {
  render: () => (
    <Stack gap="md">
      <Checkbox label="Show stale postings" description="Older than 30 days, usually filled." />
      <Checkbox label="Remote only" defaultChecked />
      <Checkbox label="Checked and disabled" defaultChecked disabled />
      <Checkbox label="Disabled" disabled />
      <Group />
    </Stack>
  ),
};

export const Dark: Story = {
  name: 'Dark theme',
  render: () => (
    <DarkTheme>
      <Stack gap="md">
        <Checkbox label="Show stale postings" description="Older than 30 days." />
        <Checkbox label="Remote only" defaultChecked />
        <Checkbox label="Some of these" indeterminate />
        <Checkbox label="Disabled" disabled />
      </Stack>
    </DarkTheme>
  ),
};
