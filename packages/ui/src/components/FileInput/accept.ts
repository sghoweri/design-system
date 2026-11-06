// Pure helpers for FileInput: parsing `accept` and sizes, matching files, and wording the messages.

/** Splits `accept` (a native accept string or a list) into lower-cased entries. */
export function parseAccept(accept: string | readonly string[] | undefined): string[] {
  if (accept == null) return [];
  const list = typeof accept === 'string' ? accept.split(',') : accept;
  return list.map((entry) => entry.trim().toLowerCase()).filter(Boolean);
}

/**
 * Matches a file the way the native `accept` attribute does: `.pdf` against the name, `image/*` against
 * the type's prefix, `application/pdf` exactly. An empty list accepts everything.
 */
export function matchesAccept(file: { name: string; type: string }, accept: readonly string[]): boolean {
  if (accept.length === 0) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept.some((entry) => {
    if (entry.startsWith('.')) return name.endsWith(entry);
    if (entry.endsWith('/*')) return type.startsWith(entry.slice(0, -1));
    return type === entry;
  });
}

const UNITS: Record<string, number> = { b: 1, kb: 1e3, mb: 1e6, gb: 1e9 };

/** Bytes from a number or a string such as `"10MB"` or `"500 KB"` (base 1000, like the file list). */
export function parseSize(size: number | string | undefined): number | undefined {
  if (size == null) return undefined;
  if (typeof size === 'number') return size;
  const match = /^\s*(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)\s*$/i.exec(size);
  if (!match) throw new Error(`FileInput: maxFileSize "${size}" is not a size like "10MB".`);
  return Math.round(Number(match[1]) * UNITS[match[2]!.toLowerCase()]!);
}

/** `1500000` → `1.5 MB`. Base 1000, at most one decimal, matching FilePond's own size line. */
export function formatSize(bytes: number): string {
  const [unit, base] =
    bytes >= 1e9 ? ['GB', 1e9] : bytes >= 1e6 ? ['MB', 1e6] : bytes >= 1e3 ? ['KB', 1e3] : ['bytes', 1];
  const value = bytes / base;
  return `${Number.isInteger(value) ? value : Number(value.toFixed(1))} ${unit}`;
}

const MIME_NAMES: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/json': 'JSON',
  'text/plain': 'plain text',
  'text/markdown': 'Markdown',
  'text/csv': 'CSV',
  'image/png': 'PNG',
  'image/jpeg': 'JPEG',
};

/** A short human list of the accepted types: `.pdf, .docx, text/plain` → `PDF, DOCX or plain text`. */
export function describeAccept(accept: readonly string[]): string {
  const names = accept.map((entry) => {
    if (entry.startsWith('.')) return entry.slice(1).toUpperCase();
    if (entry.endsWith('/*')) return `any ${entry.slice(0, -2)}`;
    return MIME_NAMES[entry] ?? entry.split('/').pop()!.toUpperCase();
  });
  const unique = [...new Set(names)];
  if (unique.length <= 1) return unique[0] ?? '';
  return `${unique.slice(0, -1).join(', ')} or ${unique.at(-1)}`;
}

export type FileRejectionReason = 'type' | 'size' | 'count';

export function rejectionMessage(
  reason: FileRejectionReason,
  detail: {
    name?: string | undefined;
    size?: number | undefined;
    acceptLabel?: string | undefined;
    maxFileSize?: number | undefined;
    maxFiles?: number | undefined;
  },
): string {
  switch (reason) {
    case 'type':
      return `${detail.name} is not an accepted file type. Use ${detail.acceptLabel}.`;
    case 'size':
      return `${detail.name} is ${formatSize(detail.size ?? 0)}, over the ${formatSize(detail.maxFileSize ?? 0)} limit.`;
    case 'count':
      return detail.maxFiles === 1
        ? 'Choose one file.'
        : `Up to ${detail.maxFiles} files. Remove one to add another.`;
  }
}

/** Escapes text for FilePond's `labelIdle`, which it sets as HTML. */
export function escapeHtml(text: string): string {
  return text.replace(
    /[&<>"']/g,
    (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!,
  );
}
