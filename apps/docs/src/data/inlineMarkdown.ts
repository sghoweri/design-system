// The manifest's descriptions are the components' JSDoc: Markdown, almost always inline (code spans, emphasis,
// links). Rendered at build time to HTML. Everything is escaped first, so only these constructs become markup.

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Inline Markdown to HTML: `code`, **strong**, *em*, [links](https://…). Paragraph breaks become `<br><br>`. */
export function inlineMarkdown(text: string | undefined): string {
  if (!text) return '';
  const codes: string[] = [];
  let html = escape(text).replace(/`([^`]+)`/g, (_, code: string) => {
    codes.push(code);
    return `\uE000${codes.length - 1}\uE000`;
  });
  html = html
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g, '<a href="$2">$1</a>')
    .replace(/\n{2,}/g, '<br><br>')
    .replace(/\n/g, ' ');
  return html.replace(/\uE000(\d+)\uE000/g, (_, i: string) => `<code>${codes[Number(i)]}</code>`);
}
