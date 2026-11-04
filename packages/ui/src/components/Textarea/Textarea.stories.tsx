import type { Meta, StoryObj } from '@storybook/react-vite';
import { Textarea } from './Textarea';
import { Stack } from '../Stack/Stack';
import { DarkTheme } from '../../stories/helpers';

const meta: Meta<typeof Textarea> = {
  title: 'Forms/Textarea',
  component: Textarea,
  args: { label: 'Notes', placeholder: 'What stood out?', rows: 3, resize: 'vertical' },
  argTypes: { resize: { control: 'radio', options: ['vertical', 'none'] } },
  decorators: [(Story) => <div style={{ maxWidth: 420 }}>{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <Stack gap="md">
      <Textarea label="Notes" placeholder="What stood out?" description="Private to you." />
      <Textarea
        label="Cover letter"
        rows={6}
        defaultValue="Dear hiring team,"
        error="Keep it under 2,000 characters."
      />
      <Textarea label="Notes" defaultValue="Read only." disabled resize="none" />
    </Stack>
  ),
};

export const Dark: Story = {
  name: 'Dark theme',
  render: () => (
    <DarkTheme>
      <Stack gap="md">
        <Textarea label="Notes" placeholder="What stood out?" description="Private to you." />
        <Textarea
          label="Cover letter"
          defaultValue="Dear hiring team,"
          error="Keep it under 2,000 characters."
        />
      </Stack>
    </DarkTheme>
  ),
};
