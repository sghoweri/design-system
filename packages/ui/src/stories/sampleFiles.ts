// Story-only sample files with real contents, so previews show something. No personal data.
const LAST_MODIFIED = 1_762_300_000_000;

/** A small, valid PDF: one page per entry, each a heading and a few lines of Helvetica (ASCII only). */
export function samplePdf(name: string, pages: { heading: string; lines: string[] }[]): File {
  const escape = (text: string) => text.replace(/[\\()]/g, (ch) => `\\${ch}`);
  const objects: string[] = [];
  const pageIds = pages.map((_, i) => 4 + i * 2);
  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`;
  objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
  pages.forEach((page, i) => {
    const stream = [
      'BT /F1 22 Tf 72 720 Td',
      `(${escape(page.heading)}) Tj`,
      '/F1 12 Tf 0 -36 Td 18 TL',
      ...page.lines.map((line) => `(${escape(line)}) Tj T*`),
      'ET',
    ].join('\n');
    objects[pageIds[i]!] =
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] ' +
      `/Resources << /Font << /F1 3 0 R >> >> /Contents ${pageIds[i]! + 1} 0 R >>`;
    objects[pageIds[i]! + 1] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });
  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  for (let id = 1; id < objects.length; id++) {
    offsets[id] = pdf.length;
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objects.length; id++) pdf += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new File([pdf], name, { type: 'application/pdf', lastModified: LAST_MODIFIED });
}

export function sampleText(name: string, text: string, type = 'text/plain'): File {
  return new File([text], name, { type, lastModified: LAST_MODIFIED });
}

/** A file whose bytes don't matter, only its name, type and size. */
export function sampleBytes(name: string, type: string, bytes: number): File {
  return new File([new Uint8Array(bytes)], name, { type, lastModified: LAST_MODIFIED });
}

/** A small SVG drawing, as an image file. */
export function sampleImage(name = 'diagram.svg'): File {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="270" viewBox="0 0 480 270">' +
    '<rect width="480" height="270" fill="#eef2ff"/>' +
    '<rect x="40" y="60" width="120" height="150" rx="12" fill="#6366f1"/>' +
    '<rect x="180" y="100" width="120" height="110" rx="12" fill="#818cf8"/>' +
    '<rect x="320" y="30" width="120" height="180" rx="12" fill="#a5b4fc"/></svg>';
  return new File([svg], name, { type: 'image/svg+xml', lastModified: LAST_MODIFIED });
}

export const sampleResumePdf = () =>
  samplePdf('sample-resume.pdf', [
    {
      heading: 'Sample Resume',
      lines: [
        'Senior Frontend Engineer',
        '',
        'Experience',
        '- Design system lead: tokens, components, docs',
        '- Web components and React across several products',
        '',
        'Skills',
        'TypeScript, CSS architecture, accessibility, testing',
      ],
    },
    {
      heading: 'Page 2',
      lines: ['Projects', '- Example project one', '- Example project two'],
    },
  ]);

export const sampleNotesMd = () =>
  sampleText(
    'interview-notes.md',
    [
      '# Interview notes',
      '',
      '## Questions to ask',
      '',
      '- How does the team review design-system changes?',
      '- What does a typical release look like?',
      '',
      '## Follow-ups',
      '',
      '1. Send the portfolio link.',
      '2. Share the accessibility audit sample.',
      '',
    ].join('\n'),
    'text/markdown',
  );

export const sampleCoverTxt = () =>
  sampleText(
    'cover-letter.txt',
    [
      'Dear hiring team,',
      '',
      'This is a sample cover letter used to show the plain-text preview.',
      'Long lines wrap inside the preview instead of widening the dialog, so a paragraph written on a single line still reads comfortably on a phone.',
      '',
      'Kind regards,',
      'A. Candidate',
      '',
    ].join('\n'),
  );
