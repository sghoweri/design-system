import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Chip } from './Chip';
import { Inline } from '../Inline/Inline';
import { Stack } from '../Stack/Stack';
import { Text } from '../Text/Text';
import { CheckIcon, FilterIcon, MapPinIcon, StarIcon } from '../../icons/icons.gen';
import { Compact, DarkTheme } from '../../stories/helpers';

const meta = {
  title: 'Components/Chip',
  component: Chip,
  args: { children: 'Remote', tone: 'neutral', size: 'md', selected: false, disabled: false },
  argTypes: {
    tone: { control: 'radio', options: ['neutral', 'accent', 'success', 'warning', 'danger', 'info'] },
    size: { control: 'radio', options: ['sm', 'md'] },
    icon: { control: false },
    onClick: { control: false },
    onRemove: { control: false },
  },
} satisfies Meta<typeof Chip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const all = ['Remote', 'Hybrid', 'Staff', 'Design systems', 'Boston'];

function FilterChips() {
  const [selected, setSelected] = useState<string[]>(['Remote', 'Staff']);
  const toggle = (name: string) =>
    setSelected((s) => (s.includes(name) ? s.filter((n) => n !== name) : [...s, name]));
  return (
    <Inline gap="xs" role="group" aria-label="Filters">
      {all.map((name) => (
        <Chip
          key={name}
          selected={selected.includes(name)}
          onClick={() => toggle(name)}
          icon={selected.includes(name) ? <CheckIcon /> : undefined}
        >
          {name}
        </Chip>
      ))}
    </Inline>
  );
}

function AppliedFilters() {
  const [applied, setApplied] = useState(['Remote', 'Staff', 'Boston']);
  return (
    <Stack gap="xs">
      <Inline gap="xs">
        {applied.map((name) => (
          <Chip key={name} tone="accent" onRemove={() => setApplied((a) => a.filter((n) => n !== name))}>
            {name}
          </Chip>
        ))}
        {applied.length === 0 ? <Text tone="muted">No filters</Text> : null}
      </Inline>
      <Text tone="muted" size="xs">
        Backspace or Delete on a focused chip removes it too.
      </Text>
    </Stack>
  );
}

/** Toggle chips (`onClick` + `selected`) and removable applied filters (`onRemove`). */
export const Filters: Story = {
  render: () => (
    <Stack gap="lg">
      <FilterChips />
      <AppliedFilters />
    </Stack>
  ),
};

export const Tones: Story = {
  render: () => (
    <Stack gap="md">
      <Inline gap="xs">
        <Chip>Neutral</Chip>
        <Chip tone="accent">Accent</Chip>
        <Chip tone="success">Success</Chip>
        <Chip tone="warning">Warning</Chip>
        <Chip tone="danger">Danger</Chip>
        <Chip tone="info">Info</Chip>
      </Inline>
      <Inline gap="xs">
        <Chip selected onClick={() => {}}>
          Neutral
        </Chip>
        <Chip tone="accent" selected onClick={() => {}}>
          Accent
        </Chip>
        <Chip tone="success" selected onClick={() => {}}>
          Success
        </Chip>
        <Chip tone="warning" selected onClick={() => {}}>
          Warning
        </Chip>
        <Chip tone="danger" selected onClick={() => {}}>
          Danger
        </Chip>
        <Chip tone="info" selected onClick={() => {}}>
          Info
        </Chip>
      </Inline>
      <Inline gap="xs">
        <Chip icon={<MapPinIcon />} onRemove={() => {}}>
          Boston
        </Chip>
        <Chip icon={<StarIcon />} tone="warning" size="sm">
          Starred
        </Chip>
        <Chip icon={<FilterIcon />} size="sm" onRemove={() => {}} tone="info">
          Remote
        </Chip>
        <Chip disabled onRemove={() => {}}>
          Disabled
        </Chip>
      </Inline>
    </Stack>
  ),
};

export const Dark: Story = {
  name: 'Dark theme',
  render: () => (
    <DarkTheme>
      <Stack gap="md">
        <FilterChips />
        <AppliedFilters />
      </Stack>
    </DarkTheme>
  ),
};

export const CompactDensity: Story = {
  name: 'Compact density',
  render: () => (
    <Compact>
      <FilterChips />
    </Compact>
  ),
};
