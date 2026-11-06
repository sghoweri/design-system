import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { FilePreviewDialog } from './FilePreviewDialog';
import { Button } from '../Button/Button';
import {
  sampleBytes,
  sampleCoverTxt,
  sampleImage,
  sampleNotesMd,
  sampleResumePdf,
} from '../../stories/sampleFiles';

const meta = {
  title: 'Components/FilePreviewDialog',
  component: FilePreviewDialog,
  parameters: { layout: 'centered' },
  args: { file: null, open: false, onOpenChange: () => {} },
} satisfies Meta<typeof FilePreviewDialog>;
export default meta;
type Story = StoryObj<typeof meta>;

/** FileInput opens this from a file's name; it also works on its own, for any `File`. */
function Demo({ file, defaultOpen = true }: { file: File; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Preview {file.name}
      </Button>
      <FilePreviewDialog file={file} open={open} onOpenChange={setOpen} />
    </>
  );
}

/** A PDF in the browser's own viewer, from an object URL re-typed `application/pdf` and revoked on close. */
export const Pdf: Story = {
  name: 'PDF',
  render: () => <Demo file={sampleResumePdf()} />,
};

/** At 48rem and below (here 390px) a PDF opens in a new tab: iOS Safari draws only page 1 in a frame. */
export const PdfPhone: Story = {
  name: 'PDF at 390 px',
  parameters: { viewport: { value: 'phone390' } },
  globals: { viewport: { value: 'phone390', isRotated: false } },
  render: () => <Demo file={sampleResumePdf()} />,
};

/** Plain text, read with `file.text()` into a scrolling, focusable block. */
export const Text: Story = {
  render: () => <Demo file={sampleCoverTxt()} />,
};

/** Markdown shows as its source text. */
export const Markdown: Story = {
  render: () => <Demo file={sampleNotesMd()} />,
};

export const Image: Story = {
  render: () => <Demo file={sampleImage()} />,
};

/** Anything else gets a note. FileInput never offers a preview for these. */
export const Unsupported: Story = {
  name: 'DOCX (no preview)',
  render: () => (
    <Demo
      file={sampleBytes(
        'cover-letter.docx',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        41_000,
      )}
    />
  ),
};
