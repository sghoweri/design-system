import type { Meta, StoryObj } from '@storybook/react-vite';
import { Textarea } from './Textarea';
import { Stack } from '../Stack/Stack';
import { DarkTheme } from '../../stories/helpers';

const meta: Meta<typeof Textarea> = {
  title: 'Forms/Textarea',
  component: Textarea,
  args: { label: 'Notes', placeholder: 'What stood out?', rows: 3, resize: 'vertical' },
  argTypes: {
    resize: { control: 'radio', options: ['vertical', 'none'] },
    variant: { control: 'radio', options: ['default', 'code'] },
    autoSize: { control: 'boolean' },
  },
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

const markdown = `# Staff Frontend Engineer

- **Team:** design systems, 6 engineers
- **Stack:** React 19, TypeScript, Storybook
	- nested with a tab

| Stage | Date |
| ----- | ---- |
| Applied | 2026-11-02 |
`;

/** `variant="code"` for Markdown and JSON: monospace, tab-size 2, no spellcheck or autocorrect. Add native `wrap="off"` to scroll long lines instead of wrapping. */
export const Code: Story = {
  name: 'Code (Markdown)',
  render: () => (
    <Stack gap="md">
      <Textarea label="Notes (Markdown)" variant="code" rows={8} defaultValue={markdown} />
      <Textarea
        label="Raw posting JSON"
        variant="code"
        rows={4}
        wrap="off"
        defaultValue={JSON.stringify(
          {
            title: 'Staff Frontend Engineer',
            company: 'Northwind',
            url: 'https://northwind.example/careers/staff-frontend-engineer-remote-us-2026',
          },
          null,
          2,
        )}
        description='wrap="off": long lines scroll sideways.'
      />
    </Stack>
  ),
};

/**
 * `autoSize` grows the field with its text and shrinks it back, from `rows` lines up, with no resize handle.
 * One row for a short phrase that may wrap (an inline editor); more for notes.
 */
export const AutoSize: Story = {
  name: 'Auto-size',
  render: () => (
    <Stack gap="md">
      <Textarea
        label="Job title"
        autoSize
        rows={1}
        defaultValue="Staff frontend engineer, design systems and web platform"
      />
      <Textarea label="Notes" autoSize placeholder="Type a few lines; the field grows with them." />
    </Stack>
  ),
};
