import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './Input';
import { Stack } from '../Stack/Stack';
import { Inline } from '../Inline/Inline';
import { LinkIcon, SearchIcon } from '../../icons/icons.gen';
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
