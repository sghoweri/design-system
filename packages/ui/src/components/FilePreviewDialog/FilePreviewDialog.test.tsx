import { render, screen, waitFor } from '@testing-library/react';
import { FilePreviewDialog } from './FilePreviewDialog';
import { expectNoA11yViolations } from '../../../test/axe';

const originalMatchMedia = window.matchMedia;
function setNarrow(matches: boolean) {
  window.matchMedia = ((query: string) => ({
    matches,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

let create: ReturnType<typeof vi.fn>;
let revoke: ReturnType<typeof vi.fn>;
let count = 0;
beforeEach(() => {
  setNarrow(false);
  create = vi.fn(() => `blob:url-${++count}`);
  revoke = vi.fn();
  URL.createObjectURL = create as unknown as typeof URL.createObjectURL;
  URL.revokeObjectURL = revoke as unknown as typeof URL.revokeObjectURL;
});
afterAll(() => {
  window.matchMedia = originalMatchMedia;
});

const pdf = (name = 'cv.pdf', type = 'application/pdf') => new File(['%PDF-1.4'], name, { type });

describe('FilePreviewDialog', () => {
  it('frames a PDF from an object URL re-typed application/pdf, and revokes it on close', async () => {
    // An HTML file named .pdf: the frame gets a PDF-typed blob, so the HTML can never run.
    const file = pdf('trap.pdf', 'text/html');
    const { rerender } = render(<FilePreviewDialog file={file} open onOpenChange={() => {}} />);
    const dialog = await screen.findByRole('dialog', { name: 'trap.pdf' });
    expect(dialog).toHaveAccessibleDescription('PDF, 8 bytes');
    const frame = screen.getByTitle('Preview of trap.pdf');
    expect(frame).toHaveAttribute('src', 'blob:url-1');
    expect(frame).not.toHaveAttribute('sandbox');
    expect(create).toHaveBeenCalledTimes(1);
    expect((create.mock.calls[0]![0] as Blob).type).toBe('application/pdf');
    expect(screen.getByRole('link', { name: 'Open in a new tab' })).toHaveAttribute('href', 'blob:url-1');
    await expectNoA11yViolations(document.body);
    rerender(<FilePreviewDialog file={file} open={false} onOpenChange={() => {}} />);
    expect(revoke).toHaveBeenCalledWith('blob:url-1');
  });

  it('revokes the URL when it unmounts while open', async () => {
    const { unmount } = render(<FilePreviewDialog file={pdf()} open onOpenChange={() => {}} />);
    await screen.findByRole('dialog');
    const url = create.mock.results[0]!.value as string;
    unmount();
    expect(revoke).toHaveBeenCalledWith(url);
  });

  it('links to the PDF in a new tab instead of framing it at 48rem and below', async () => {
    setNarrow(true);
    render(<FilePreviewDialog file={pdf()} open onOpenChange={() => {}} />);
    const link = await screen.findByRole('link', { name: 'Open in a new tab' });
    const url = create.mock.results.at(-1)!.value as string;
    expect(link).toHaveAttribute('href', url);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener');
    expect(screen.queryByTitle('Preview of cv.pdf')).toBeNull();
  });

  it('shows plain text and Markdown as text, with no object URL', async () => {
    const notes = new File(['# Notes\n\n- one'], 'notes.md', { type: '' });
    render(<FilePreviewDialog file={notes} open onOpenChange={() => {}} />);
    const region = await screen.findByRole('region', { name: 'Contents of notes.md' });
    await waitFor(() => expect(region.textContent).toBe('# Notes\n\n- one'));
    expect(region).toHaveAttribute('tabindex', '0');
    expect(create).not.toHaveBeenCalled();
    await expectNoA11yViolations(document.body);
  });

  it('shows an image in an img named after the file', async () => {
    const image = new File(['<svg/>'], 'chart.svg', { type: 'image/svg+xml' });
    render(<FilePreviewDialog file={image} open onOpenChange={() => {}} />);
    const img = await screen.findByRole('img', { name: 'chart.svg' });
    expect(img).toHaveAttribute('src', create.mock.results[0]!.value as string);
  });

  it('frames nothing for other types', async () => {
    const docx = new File(['PK'], 'letter.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    render(<FilePreviewDialog file={docx} open onOpenChange={() => {}} />);
    expect(await screen.findByText('There is no preview for DOCX files.')).toBeInTheDocument();
    expect(create).not.toHaveBeenCalled();
    expect(document.querySelector('iframe')).toBeNull();
  });
});
