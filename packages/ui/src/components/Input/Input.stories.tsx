import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './Input';
import { Stack } from '../Stack/Stack';
import { Inline } from '../Inline/Inline';
import { CalendarIcon, LinkIcon, SearchIcon } from '../../icons/icons.gen';
import { Compact, DarkTheme } from '../../stories/helpers';

const meta: Meta<typeof Input> = {
  title: 'Forms/Input',
  component: Input,
  args: { label: 'Company', placeholder: 'Linear', size: 'md', required: false, disabled: false },
  argTypes: { size: { control: 'radio', options: ['sm', 'md', 'lg'] } },
  decorators: [(Story) => <div style={{ maxWidth: 360 }}>{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <Stack gap="md">
      <Input label="Company" placeholder="Linear" />
      <Input label="Posting URL" type="url" required description="Paste the job page; we read the rest." />
      <Input label="Posting URL" type="url" defaultValue="not a url" error="That is not a URL." />
      <Input label="Title" defaultValue="Staff Frontend Engineer" disabled />
      <Input label="Search" hideLabel placeholder="Search postings" iconStart={<SearchIcon />} />
      <Input label="Link" defaultValue="https://linear.app/careers" iconEnd={<LinkIcon />} readOnly />
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Inline gap="sm" align="end">
      <Input label="Small" size="sm" placeholder="32px" />
      <Input label="Medium" placeholder="40px" />
      <Input label="Large" size="lg" placeholder="48px" />
    </Inline>
  ),
};

export const CompactDensity: Story = {
  name: 'Compact density',
  render: () => (
    <Compact>
      <Inline gap="sm" align="end">
        <Input label="Small" size="sm" placeholder="28px" />
        <Input label="Medium" placeholder="32px" />
        <Input label="Large" size="lg" placeholder="40px" />
      </Inline>
    </Compact>
  ),
};

export const Dark: Story = {
  name: 'Dark theme',
  render: () => (
    <DarkTheme>
      <Stack gap="md">
        <Input label="Company" placeholder="Linear" />
        <Input label="Posting URL" defaultValue="not a url" error="That is not a URL." />
        <Input label="Search" hideLabel placeholder="Search postings" iconStart={<SearchIcon />} />
        <Input label="Disabled" defaultValue="Read only" disabled />
      </Stack>
    </DarkTheme>
  ),
};

/** Native `type`s keep the same box and `iconStart` slot; date and time show the browser's picker at the end. */
export const NativeTypes: Story = {
  name: 'Date, time, number',
  render: () => (
    <Stack gap="md">
      <Inline gap="sm" align="end">
        <Input label="Applied on" type="date" defaultValue="2026-11-02" />
        <Input label="Screen at" type="time" defaultValue="14:30" />
        <Input label="Base salary" type="number" min={0} step={1000} defaultValue={210000} />
      </Inline>
      <Inline gap="sm" align="end">
        <Input label="Applied on" type="date" iconStart={<CalendarIcon />} size="sm" />
        <Input label="Screen at" type="time" size="sm" />
        <Input label="Years" type="number" size="sm" min={0} max={40} defaultValue={8} />
      </Inline>
    </Stack>
  ),
};

/** `list` points at a `<datalist>` rendered beside the field: free text with suggestions, no Select needed. */
export const Datalist: Story = {
  name: 'Datalist suggestions',
  render: () => (
    <Stack gap="xs">
      <Input label="Company" list="companies" placeholder="Start typing…" autoComplete="off" />
      <datalist id="companies">
        <option value="Linear" />
        <option value="Northwind" />
        <option value="Vercel" />
        <option value="Figma" />
      </datalist>
    </Stack>
  ),
};
