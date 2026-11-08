/**
 * The word-diff engine (job-radar docs/design/word-diff-editor.md, "Engine"): lines first (Myers, `diffLines`),
 * then each run of changed lines paired line by line, with `diffWordsWithSpace` on each pair. A pair that changed
 * mostly, or is large, shows as the whole line removed and added; lines left over on either side are whole lines.
 * Pairing per line keeps every word-level change inside one line, so a removed run never spans a line break.
 * No CodeMirror here, so a plain Textarea + WordDiff can use it too.
 */
import { diffLines, diffWordsWithSpace } from 'diff';
import type { WordDiffPart } from '../WordDiff/WordDiff';

/** Above this share of changed characters, a changed line shows as a whole line removed and added. */
export const WORD_DIFF_MAX_CHANGE = 0.6;
/** Above this many characters (both sides), a changed line shows whole, without a word pass. */
export const WORD_DIFF_MAX_CHARS = 4000;

/** One changed line against its replacement, as word parts, or whole when a word diff wouldn't help. */
function pair(a: string, b: string): WordDiffPart[] {
  if (a.length + b.length <= WORD_DIFF_MAX_CHARS) {
    const parts = diffWordsWithSpace(a, b).map((p): WordDiffPart => ({
      kind: p.added ? 'added' : p.removed ? 'removed' : 'same',
      text: p.value,
    }));
    const changed = parts.reduce((n, p) => n + (p.kind === 'same' ? 0 : p.text.length), 0);
    if (changed / (a.length + b.length) <= WORD_DIFF_MAX_CHANGE) return parts;
  }
  return [
    { kind: 'removed', text: a },
    { kind: 'added', text: b },
  ];
}

const lines = (text: string) => text.match(/[^\n]*\n|[^\n]+$/g) ?? [];

/** A run of changed lines: pairs first, then the lines left over on either side, whole. */
function hunk(a: string, b: string): WordDiffPart[] {
  const removed = lines(a);
  const added = lines(b);
  const n = Math.min(removed.length, added.length);
  const out: WordDiffPart[] = [];
  for (let i = 0; i < n; i++) out.push(...pair(removed[i]!, added[i]!));
  out.push({ kind: 'removed', text: removed.slice(n).join('') });
  out.push({ kind: 'added', text: added.slice(n).join('') });
  return out;
}

/** `base` → `text` as WordDiff parts. Joining the `same` and `added` texts gives `text` exactly. */
export function diffParts(base: string, text: string): WordDiffPart[] {
  const out: WordDiffPart[] = [];
  const push = ({ kind, text }: WordDiffPart) => {
    if (!text) return;
    const last = out.at(-1);
    if (last?.kind === kind) last.text += text;
    else out.push({ kind, text });
  };
  const changes = diffLines(base, text);
  for (let i = 0; i < changes.length;) {
    const c = changes[i]!;
    if (!c.added && !c.removed) {
      push({ kind: 'same', text: c.value });
      i++;
      continue;
    }
    let removed = '';
    let added = '';
    for (; i < changes.length && (changes[i]!.added || changes[i]!.removed); i++) {
      if (changes[i]!.added) added += changes[i]!.value;
      else removed += changes[i]!.value;
    }
    hunk(removed, added).forEach(push);
  }
  return out;
}
