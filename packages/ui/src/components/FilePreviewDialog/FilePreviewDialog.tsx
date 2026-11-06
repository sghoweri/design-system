import { useEffect, useRef, useState } from 'react';
import { Dialog, type DialogContentProps } from '../Dialog/Dialog';
import { ExternalLinkIcon } from '../../icons/icons.gen';
import { fileTypeLabel, formatListSize, formatSize, previewKind } from '../FileInput/accept';
import { useMediaQuery } from '../../utils/useMediaQuery';

export interface FilePreviewDialogProps {
  /** The file to show. Kept while the dialog closes, so pass `null` only once it has. */
  file: File | null | undefined;
  /** Controlled open state. */
  open: boolean;
  /** Called when the dialog asks to close (Esc, the ×, the backdrop). */
  onOpenChange: (open: boolean) => void;
  /** Where focus goes on close. Default: the element that had focus when it opened. */
  finalFocus?: DialogContentProps['finalFocus'];
}

/** Text files longer than this show their beginning only. */
const TEXT_LIMIT = 1_000_000;
/** Below this width a PDF opens in a new tab instead of a frame (iOS Safari only draws page 1 in a frame). */
const NARROW = '(max-width: 48rem)';

/**
 * Shows a local file before it is uploaded: a PDF in the browser's own viewer, plain text and Markdown as
 * text, an image as an image. Any other type gets a short note and nothing else, because a blob URL runs
 * with the page's origin: only a PDF is ever framed, and it is re-typed `application/pdf` first, so an HTML
 * file named `.pdf` cannot run. The object URL exists only while the dialog is open.
 */
export function FilePreviewDialog({ file, open, onOpenChange, finalFocus }: FilePreviewDialogProps) {
  const kind = file ? previewKind(file) : null;
  const narrow = useMediaQuery(NARROW);
  const pdfInTab = kind === 'pdf' && narrow;
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        size="lg"
        className="sc-file-preview"
        data-kind={kind ?? 'none'}
        finalFocus={finalFocus}
      >
        <Dialog.Close />
        {file ? (
          <>
            <Dialog.Title>{file.name}</Dialog.Title>
            <Dialog.Description>
              {fileTypeLabel(file)}, {formatListSize(file.size)}
            </Dialog.Description>
            <Dialog.Body>
              <PreviewBody file={file} kind={kind} open={open} pdfInTab={pdfInTab} />
            </Dialog.Body>
          </>
        ) : (
          <Dialog.Title>Preview</Dialog.Title>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}

function PreviewBody({
  file,
  kind,
  open,
  pdfInTab,
}: {
  file: File;
  kind: ReturnType<typeof previewKind>;
  open: boolean;
  pdfInTab: boolean;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [text, setText] = useState<{ file: File; value: string } | null>(null);

  // The object URL lives exactly as long as the dialog is open on this file. It goes straight onto the
  // elements, so nothing renders with a revoked URL.
  useEffect(() => {
    if (!open || (kind !== 'pdf' && kind !== 'image')) return undefined;
    const url = URL.createObjectURL(kind === 'pdf' ? new Blob([file], { type: 'application/pdf' }) : file);
    if (frameRef.current) frameRef.current.src = url;
    if (imageRef.current) imageRef.current.src = url;
    if (linkRef.current) linkRef.current.href = url;
    return () => URL.revokeObjectURL(url);
  }, [open, file, kind, pdfInTab]);

  useEffect(() => {
    if (!open || kind !== 'text') return undefined;
    let cancelled = false;
    void file
      .slice(0, TEXT_LIMIT)
      .text()
      .then((value) => {
        if (!cancelled) setText({ file, value });
      });
    return () => {
      cancelled = true;
    };
  }, [open, file, kind]);

  if (kind === 'pdf') {
    const link = (
      // eslint-disable-next-line jsx-a11y/anchor-is-valid -- the effect above sets href to the object URL on mount
      <a
        ref={linkRef}
        className="sc-button"
        data-variant={pdfInTab ? 'primary' : 'secondary'}
        data-size="md"
        target="_blank"
        rel="noopener"
      >
        Open in a new tab
        <ExternalLinkIcon />
      </a>
    );
    return pdfInTab ? (
      <div className="sc-file-preview__tab">
        <p className="sc-file-preview__note">On a small screen the PDF reads best in its own tab.</p>
        {link}
      </div>
    ) : (
      <>
        <iframe ref={frameRef} className="sc-file-preview__frame" title={`Preview of ${file.name}`} />
        <div className="sc-file-preview__actions">{link}</div>
      </>
    );
  }
  if (kind === 'text') {
    const value = text?.file === file ? text.value : null;
    return (
      <>
        <pre
          className="sc-file-preview__text"
          role="region"
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrolling region takes focus so the keyboard can scroll it
          tabIndex={0}
          aria-label={`Contents of ${file.name}`}
          aria-busy={value == null || undefined}
        >
          {value}
        </pre>
        {file.size > TEXT_LIMIT ? (
          <p className="sc-file-preview__note">Showing the first {formatSize(TEXT_LIMIT)}.</p>
        ) : null}
      </>
    );
  }
  if (kind === 'image') {
    return <img ref={imageRef} className="sc-file-preview__image" alt={file.name} />;
  }
  return <p className="sc-file-preview__note">There is no preview for {fileTypeLabel(file)} files.</p>;
}
