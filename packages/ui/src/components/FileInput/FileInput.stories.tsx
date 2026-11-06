import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { FileInput } from './FileInput';
import { Stack } from '../Stack/Stack';
import { Inline } from '../Inline/Inline';
import { Button } from '../Button/Button';
import { Text } from '../Text/Text';
import { Compact, DarkTheme } from '../../stories/helpers';

const DOCUMENT_TYPES = '.pdf,.docx,.txt,.md';

/** A stand-in file for stories; the bytes don't matter, the name, type and size do. */
function sampleFile(name: string, type: string, bytes: number) {
  return new File([new Uint8Array(bytes)], name, { type, lastModified: 1_762_300_000_000 });
}
const resume = sampleFile('resume-2026.pdf', 'application/pdf', 182_000);
const coverLetter = sampleFile(
  'cover-letter-linear.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  41_000,
);
const notes = sampleFile('interview-notes.md', 'text/markdown', 6_200);
const installer = sampleFile('setup.exe', 'application/x-msdownload', 2_400_000);
const scan = sampleFile('portfolio-scan.pdf', 'application/pdf', 14_500_000);

const meta: Meta<typeof FileInput> = {
  title: 'Forms/FileInput',
  component: FileInput,
  args: {
    label: 'Document',
    description: 'PDF, DOCX, plain text or Markdown, up to 10 MB.',
    accept: DOCUMENT_TYPES,
    maxFileSize: '10MB',
    size: 'md',
    multiple: false,
    required: false,
    disabled: false,
  },
  argTypes: { size: { control: 'radio', options: ['sm', 'md', 'lg'] } },
  decorators: [(Story) => <div style={{ maxWidth: 480 }}>{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Nothing chosen yet: the drop zone with its idle label. Click it, press Enter or Space on it, or drop a file. */
export const Idle: Story = {
  render: (args) => <FileInput {...args} />,
};

/** `multiple` lists every accepted file with its size and a labelled ×. */
export const WithFiles: Story = {
  name: 'With files',
  args: { label: 'Documents', multiple: true, maxFiles: 5 },
  render: (args) => <FileInput {...args} defaultFiles={[resume, coverLetter, notes]} />,
};

/** A file outside `accept` never joins the list; the reason shows in the error slot and is announced. */
export const InvalidType: Story = {
  name: 'Invalid type',
  render: (args) => <FileInput {...args} defaultFiles={[installer]} />,
};

/** Over `maxFileSize`: rejected the same way, with the file's size and the limit. */
export const TooLarge: Story = {
  name: 'Too large',
  render: (args) => <FileInput {...args} defaultFiles={[scan]} />,
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <Stack gap="lg">
      <FileInput {...args} />
      <FileInput {...args} label="Documents" multiple defaultFiles={[resume, notes]} />
    </Stack>
  ),
};

/** A form error from the server (`error`) uses the same slot as the component's own rejections. */
export const ServerError: Story = {
  name: 'Form error',
  args: { required: true, error: 'Choose a document to convert.' },
};

/** Controlled: the parent owns `files` and can clear them. */
export const Controlled: Story = {
  render: function Render(args) {
    const [files, setFiles] = useState<File[]>([resume]);
    return (
      <Stack gap="sm">
        <FileInput {...args} label="Documents" multiple files={files} onFilesChange={setFiles} />
        <Inline gap="sm" align="center">
          <Button size="sm" variant="secondary" onClick={() => setFiles([])} disabled={files.length === 0}>
            Clear
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setFiles((list) => [...list, notes])}>
            Add notes
          </Button>
          <Text size="sm" tone="muted">
            {files.length === 0 ? 'No files' : files.map((f) => f.name).join(', ')}
          </Text>
        </Inline>
      </Stack>
    );
  },
};

/** With `name`, the files ride along in the form's `FormData`, so a Server Action receives them like a native file input's. */
export const InAForm: Story = {
  name: 'In a form',
  render: function Render(args) {
    const [submitted, setSubmitted] = useState<string>('Nothing submitted yet.');
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const entries = new FormData(event.currentTarget).getAll('document');
          setSubmitted(
            entries.length === 0
              ? 'FormData has no "document" entries.'
              : `FormData "document": ${entries.map((f) => (f instanceof File ? `${f.name} (${f.size} bytes)` : String(f))).join(', ')}`,
          );
        }}
      >
        <Stack gap="sm">
          <FileInput {...args} name="document" required />
          <Inline gap="sm" align="center">
            <Button type="submit" size="sm">
              Convert
            </Button>
            <Text size="sm" tone="muted" data-testid="submitted">
              {submitted}
            </Text>
          </Inline>
        </Stack>
      </form>
    );
  },
};

export const Sizes: Story = {
  render: (args) => (
    <Stack gap="lg">
      <FileInput {...args} label="Small" size="sm" />
      <FileInput {...args} label="Medium" size="md" defaultFiles={[resume]} />
      <FileInput {...args} label="Large" size="lg" />
    </Stack>
  ),
};

export const Dark: Story = {
  name: 'Dark theme',
  render: (args) => (
    <DarkTheme>
      <Stack gap="lg">
        <FileInput {...args} />
        <FileInput {...args} label="Documents" multiple defaultFiles={[resume, coverLetter]} />
        <FileInput {...args} label="Rejected" defaultFiles={[installer]} />
        <FileInput {...args} label="Disabled" disabled />
      </Stack>
    </DarkTheme>
  ),
};

export const CompactDensity: Story = {
  name: 'Compact density',
  render: (args) => (
    <Compact>
      <Stack gap="md">
        <FileInput {...args} />
        <FileInput {...args} label="Documents" multiple defaultFiles={[resume, notes]} />
      </Stack>
    </Compact>
  ),
};

/** At 390px the drop zone and the file rows keep their actions; long names truncate. */
export const Phone: Story = {
  name: '390 px',
  parameters: { viewport: { value: 'phone390' } },
  globals: { viewport: { value: 'phone390', isRotated: false } },
  render: (args) => (
    <Stack gap="lg">
      <FileInput {...args} />
      <FileInput
        {...args}
        label="Documents"
        multiple
        defaultFiles={[
          sampleFile(
            'a-very-long-file-name-for-the-staff-role-resume-final-v3.pdf',
            'application/pdf',
            320_000,
          ),
          notes,
        ]}
      />
    </Stack>
  ),
};
