/**
 * The word-diff engine: lines first (Myers, `diffLines`), then `diffWordsWithSpace` inside each run of changed lines,
 * as job-radar's `lib/diff/inline-diff.ts` does. A run that changed mostly, or is large, falls back to whole lines.
 * No CodeMirror here, so a plain Textarea + WordDiff can use it too.
 */
import { diffLines, diffWordsWithSpace } from 'diff';
import type { WordDiffPart } from '../WordDiff/WordDiff';

/** Above this share of changed characters, a run of changed lines shows as whole lines. */
export const WORD_DIFF_MAX_CHANGE = 0.6;
/** Above this many characters (both sides), a run of changed lines shows as whole lines without a word pass. */
export const WORD_DIFF_MAX_CHARS = 4000;

/** The changed lines of one run as word parts, or as whole lines when a word diff wouldn't help. */
function hunk(a: string, b: string): WordDiffPart[] {
  if (a && b && a.length + b.length <= WORD_DIFF_MAX_CHARS) {
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
