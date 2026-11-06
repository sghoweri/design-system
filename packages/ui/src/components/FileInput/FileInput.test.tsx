import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { FileInput } from './FileInput';
import { describeAccept, formatSize, matchesAccept, parseAccept, parseSize } from './accept';
import { expectNoA11yViolations } from '../../../test/axe';

// FilePond waits 250ms after a browse and animates on its own frame loop, so waits get room.
const slow = { timeout: 4000 };

// jsdom has no layout, so FilePond never reveals its rows (they stay `visibility: hidden`) and Testing
// Library will not name what is inside them; rows are queried by their remove button's aria-label. The
// visible behaviour is covered in the browser (stories, docs/adr/0004).
// FilePond feature-detects a browser once, when its module loads (on the component's first mount).
// jsdom lacks a few of the APIs it checks for or calls; FilePond only needs them to exist.
beforeAll(() => {
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
  URL.createObjectURL ??= () => 'blob:stub';
  URL.revokeObjectURL ??= () => {};
  (window as unknown as { CSS: { supports: () => boolean } }).CSS ??= { supports: () => false };
});

const pdf = (name = 'resume.pdf', bytes = 1200) =>
  new File([new Uint8Array(bytes)], name, { type: 'application/pdf' });

/** Waits for FilePond to load and take over the drop zone; returns its file input. */
async function control(name: string | RegExp = 'Document') {
  return waitFor(() => {
    const input = screen.getByLabelText(name, { selector: 'input' });
    expect(input).toHaveClass('filepond--browser');
    return input as HTMLInputElement;
  });
}

describe('FileInput helpers', () => {
  it('matches files the way the native accept attribute does', () => {
    const accept = parseAccept('.PDF, text/plain, image/*');
    expect(accept).toEqual(['.pdf', 'text/plain', 'image/*']);
    expect(matchesAccept({ name: 'cv.pdf', type: '' }, accept)).toBe(true);
    expect(matchesAccept({ name: 'notes', type: 'text/plain' }, accept)).toBe(true);
    expect(matchesAccept({ name: 'a.png', type: 'image/png' }, accept)).toBe(true);
    expect(matchesAccept({ name: 'a.exe', type: 'application/x-msdownload' }, accept)).toBe(false);
    expect(matchesAccept({ name: 'anything', type: '' }, [])).toBe(true);
  });

  it('parses and formats sizes in base 1000, and names the accepted types', () => {
    expect(parseSize('10MB')).toBe(10_000_000);
    expect(parseSize('500 kb')).toBe(500_000);
    expect(parseSize(2048)).toBe(2048);
    expect(() => parseSize('ten megs')).toThrow(/not a size/);
    expect(formatSize(14_500_000)).toBe('14.5 MB');
    expect(formatSize(10_000_000)).toBe('10 MB');
    expect(formatSize(512)).toBe('512 bytes');
    expect(describeAccept(parseAccept('.pdf,.docx,text/plain'))).toBe('PDF, DOCX or plain text');
    expect(describeAccept(['image/*'])).toBe('any image');
  });
});

describe('FileInput', () => {
  it('server-renders a static drop zone without FilePond, then hydrates without warnings', async () => {
    const ui = <FileInput label="Document" description="PDF up to 10 MB." accept=".pdf" />;
    const html = renderToString(ui);
    expect(html).toContain('sc-file-input__placeholder');
    expect(html).not.toContain('filepond');
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const root = await act(async () => hydrateRoot(container, ui));
    await waitFor(() => expect(container.querySelector('.filepond--root')).not.toBeNull(), slow);
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
    act(() => root.unmount());
    container.remove();
  });

  it('labels FilePond’s file input with the field label, description, accept and required', async () => {
    const { container } = render(
      <FileInput label="Document" description="PDF up to 10 MB." accept=".pdf,.docx" required name="doc" />,
    );
    const input = await control(/Document/);
    expect(input).toHaveAttribute('type', 'file');
    expect(input).toHaveAttribute('accept', '.pdf,.docx');
    expect(input).toBeRequired();
    expect(input).not.toHaveAttribute('multiple');
    expect(input).toHaveAccessibleDescription(/PDF up to 10 MB\./);
    expect(screen.getByText('Document').closest('label')).toHaveAttribute('for', input.id);
    expect(container.querySelector('.sc-file-input__placeholder')).toBeNull();
    // One tab stop: FilePond's focusable "browse" text is made plain text.
    expect(container.querySelector('.filepond--label-action')).not.toHaveAttribute('tabindex');
    await expectNoA11yViolations(container);
  });

  it('hands accepted files to onFilesChange as plain File objects and lists them', async () => {
    const onFilesChange = vi.fn();
    const { container } = render(
      <FileInput label="Documents" multiple accept=".pdf" onFilesChange={onFilesChange} />,
    );
    const input = await control('Documents');
    expect(input).toHaveAttribute('multiple');
    const a = pdf('a.pdf');
    const b = pdf('b.pdf');
    await userEvent.upload(input, [a, b]);
    await waitFor(() => expect(onFilesChange).toHaveBeenLastCalledWith([a, b]), slow);
    expect(onFilesChange.mock.lastCall![0][0]).toBeInstanceOf(File);
    await waitFor(
      () => expect(document.querySelector('button[aria-label="Remove a.pdf"]')).not.toBeNull(),
      slow,
    );
    await expectNoA11yViolations(container);
  });

  it('rejects a file of the wrong type before it joins the list and shows why', async () => {
    const onFilesChange = vi.fn();
    render(<FileInput label="Document" accept=".pdf,.docx" onFilesChange={onFilesChange} />);
    const input = await control();
    await userEvent.upload(input, new File(['MZ'], 'setup.exe', { type: 'application/x-msdownload' }), {
      applyAccept: false,
    });
    const message = await screen.findByText(
      'setup.exe is not an accepted file type. Use PDF or DOCX.',
      {},
      slow,
    );
    expect(message).toHaveClass('sc-field__error');
    expect(message.parentElement).toHaveAttribute('aria-live', 'polite');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(/not an accepted file type/);
    expect(onFilesChange).not.toHaveBeenCalled();
  });

  it('rejects a file over maxFileSize and keeps the file already chosen', async () => {
    const onFilesChange = vi.fn();
    const kept = pdf('small.pdf', 100);
    render(<FileInput label="Document" maxFileSize="1KB" onFilesChange={onFilesChange} />);
    const input = await control();
    await userEvent.upload(input, kept);
    await waitFor(() => expect(onFilesChange).toHaveBeenLastCalledWith([kept]), slow);
    await userEvent.upload(input, pdf('big.pdf', 1500));
    expect(await screen.findByText('big.pdf is 1.5 KB, over the 1 KB limit.', {}, slow)).toBeInTheDocument();
    expect(onFilesChange).toHaveBeenLastCalledWith([kept]);
    // The next attempt clears the message; a valid file replaces the old one without `multiple`.
    const next = pdf('next.pdf', 200);
    await userEvent.upload(input, next);
    await waitFor(() => expect(onFilesChange).toHaveBeenLastCalledWith([next]), slow);
    expect(screen.queryByText(/over the 1 KB limit/)).toBeNull();
  });

  it('drops a rejected default file from the list and says so', async () => {
    const onFilesChange = vi.fn();
    const { container } = render(
      <FileInput
        label="Document"
        accept=".pdf"
        defaultFiles={[new File(['MZ'], 'setup.exe', { type: 'application/x-msdownload' })]}
        onFilesChange={onFilesChange}
      />,
    );
    expect(await screen.findByText(/setup\.exe is not an accepted file type/, {}, slow)).toBeInTheDocument();
    await waitFor(() => expect(onFilesChange).toHaveBeenLastCalledWith([]), slow);
    await waitFor(
      () =>
        expect(container.querySelector('.filepond--drop-label')).toHaveTextContent(
          'Drop a file here or browse',
        ),
      slow,
    );
  });

  it('follows a controlled files prop, including clearing it', async () => {
    const a = pdf('a.pdf');
    const { rerender } = render(
      <FileInput label="Documents" multiple files={[a]} onFilesChange={() => {}} />,
    );
    await control('Documents');
    await waitFor(
      () => expect(document.querySelector('button[aria-label="Remove a.pdf"]')).not.toBeNull(),
      slow,
    );
    rerender(<FileInput label="Documents" multiple files={[]} onFilesChange={() => {}} />);
    await waitFor(() => expect(document.querySelector('button[aria-label="Remove a.pdf"]')).toBeNull(), slow);
  });

  it('shows a form error in the same slot', async () => {
    const { container } = render(<FileInput label="Document" error="Choose a document." />);
    const input = await control();
    expect(screen.getByText('Choose a document.')).toHaveClass('sc-field__error');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(/Choose a document\./);
    await expectNoA11yViolations(container);
  });

  it('disables: FilePond removes its file input, so nothing is focusable and the label has no target', async () => {
    const onFilesChange = vi.fn();
    const { container } = render(
      <FileInput label="Document" disabled defaultFiles={[pdf()]} onFilesChange={onFilesChange} />,
    );
    await waitFor(
      () => expect(container.querySelector('.filepond--root')).toHaveAttribute('data-disabled'),
      slow,
    );
    expect(container.querySelector('.sc-file-input')).toHaveAttribute('data-disabled');
    expect(container.querySelector('.filepond--browser')).toBeNull();
    expect(screen.getByText('Document')).not.toHaveAttribute('for');
    await waitFor(
      () => expect(document.querySelector('button[aria-label="Remove resume.pdf"]')).toBeDisabled(),
      slow,
    );
    await expectNoA11yViolations(container);
  });
});
