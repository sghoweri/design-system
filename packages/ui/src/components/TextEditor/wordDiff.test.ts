import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { diffParts } from './diffParts';
import { DEBOUNCE_MS, setDiffFocus, wordDiff, wordDiffDecorations } from './wordDiff';

interface Found {
  kind: 'added' | 'removed' | 'removed-lines';
  from: number;
  to: number;
  text: string;
}

/** The decorations in `state` as plain data: added marks with the text they cover, removed widgets with theirs. */
function decorations(state: EditorState): Found[] {
  const out: Found[] = [];
  wordDiffDecorations(state).between(0, state.doc.length, (from, to, deco) => {
    const widget = deco.spec.widget as { text: string; block: boolean } | undefined;
    if (widget) out.push({ kind: widget.block ? 'removed-lines' : 'removed', from, to, text: widget.text });
    else out.push({ kind: 'added', from, to, text: state.sliceDoc(from, to) });
  });
  return out;
}

const base =
  'enabled: true\nseniority_floor: manager\ntitles:\n  - Staff Frontend Engineer\n  - UI Platform Engineer\n';

describe('wordDiff', () => {
  it('maps a replaced word to a removed widget at the change, then an added mark over the new word', () => {
    const doc = base.replace('manager', 'senior');
    const state = EditorState.create({ doc, extensions: wordDiff(base) });
    const at = doc.indexOf('senior\n');
    expect(decorations(state)).toEqual([
      { kind: 'removed', from: at, to: at, text: 'manager' },
      { kind: 'added', from: at, to: at + 6, text: 'senior' },
    ]);
  });

  it('marks inserted words without their edge whitespace, and puts removed whole lines in a block', () => {
    const doc = base
      .replace('enabled: true\n', '')
      .replace('Staff Frontend Engineer', 'Staff Frontend Engineer (remote)');
    const state = EditorState.create({ doc, extensions: wordDiff(base) });
    const added = doc.indexOf('(remote)'); // the inserted ' (remote)', without its leading space
    expect(decorations(state)).toEqual([
      { kind: 'removed-lines', from: 0, to: 0, text: 'enabled: true' },
      { kind: 'added', from: added, to: added + 8, text: '(remote)' },
    ]);
  });

  it('shows nothing when the text matches the base, and follows edits', () => {
    let state = EditorState.create({ doc: base, extensions: wordDiff(base) });
    expect(decorations(state)).toEqual([]);
    state = state.update({
      changes: { from: 0, to: 'enabled: true'.length, insert: 'enabled: false' },
    }).state;
    expect(decorations(state)).toEqual([
      { kind: 'removed', from: 9, to: 9, text: 'true' },
      { kind: 'added', from: 9, to: 14, text: 'false' },
    ]);
  });

  it('falls back to whole lines when most of a run changed', () => {
    expect(diffParts('alpha beta\n', 'gamma delta\n')).toEqual([
      { kind: 'removed', text: 'alpha beta\n' },
      { kind: 'added', text: 'gamma delta\n' },
    ]);
  });

  it('keeps the document text exactly: same and added parts join to it', () => {
    const doc = 'enabled: false\nseniority_floor: senior\ntitles:\n  - Design Systems Lead';
    const joined = diffParts(base, doc)
      .filter((p) => p.kind !== 'removed')
      .map((p) => p.text)
      .join('');
    expect(joined).toBe(doc);
  });

  describe('liveDiff', () => {
    afterEach(() => vi.useRealTimers());
    const edited = base.replace('manager', 'senior');

    it('off (default): no decorations while focused, even while typing; the diff shows on blur', () => {
      let state = EditorState.create({ doc: edited, extensions: wordDiff(base) });
      expect(decorations(state)).toHaveLength(2);
      state = state.update({ effects: setDiffFocus.of(true) }).state;
      expect(decorations(state)).toEqual([]);
      state = state.update({ changes: { from: 0, insert: '# ' } }).state;
      expect(decorations(state)).toEqual([]);
      state = state.update({ effects: setDiffFocus.of(false) }).state;
      expect(decorations(state).map((d) => d.kind)).toEqual(['added', 'removed', 'added']);
    });

    it('on: decorations stay while focused, follow edits by position, and recompute after the pause', () => {
      vi.useFakeTimers();
      const view = new EditorView({
        doc: edited,
        extensions: wordDiff(base, { live: true }),
        parent: document.body,
      });
      view.dispatch({ effects: setDiffFocus.of(true) });
      expect(decorations(view.state)).toHaveLength(2);
      view.dispatch({ changes: { from: 0, insert: '# ' } });
      // Mapped, not recomputed: the old marks shifted by two, the new "# " not marked yet.
      const at = view.state.doc.toString().indexOf('senior\n');
      expect(decorations(view.state)).toEqual([
        { kind: 'removed', from: at, to: at, text: 'manager' },
        { kind: 'added', from: at, to: at + 6, text: 'senior' },
      ]);
      vi.advanceTimersByTime(DEBOUNCE_MS - 1);
      view.dispatch({ changes: { from: 2, insert: 'hi\n' } }); // typing again restarts the wait
      vi.advanceTimersByTime(DEBOUNCE_MS - 1);
      expect(decorations(view.state)).toHaveLength(2);
      vi.advanceTimersByTime(1);
      expect(decorations(view.state)).toEqual([
        { kind: 'added', from: 0, to: 4, text: '# hi' },
        { kind: 'removed', from: at + 3, to: at + 3, text: 'manager' },
        { kind: 'added', from: at + 3, to: at + 9, text: 'senior' },
      ]);
      view.destroy();
    });
  });
});
