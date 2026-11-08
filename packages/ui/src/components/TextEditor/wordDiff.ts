/**
 * Inline word diffs inside CodeMirror 6 (job-radar docs/design/word-diff-editor.md, option (b), phase 2 lab).
 *
 * The current document is diffed against a `base` string (`diffParts`), and the parts become decorations:
 * - added text is a mark (`<ins class="sc-word-diff__added">`) over the document range;
 * - each removed run is a widget at the position it was removed from: inline `<del>` inside a line, or a block of
 *   `<del>` lines when whole lines went. Widgets are not part of the document, so the caret steps over them and
 *   they can't be edited.
 * The classes are WordDiff's, and the content carries `class="sc-word-diff" data-family="mono"`, so it looks the
 * same as WordDiff from `@salemcobalt/ui/styles.css`. Not `@codemirror/merge` (see the design doc).
 */
import { Facet, StateField, type EditorState, type Extension, type Text } from '@codemirror/state';
import { Decoration, EditorView, WidgetType, type DecorationSet } from '@codemirror/view';
import { diffParts } from './diffParts';

const edges = /^(\s*)([\s\S]*?)(\s*)$/;

class RemovedWidget extends WidgetType {
  constructor(
    readonly text: string,
    readonly block: boolean,
  ) {
    super();
  }
  override eq(other: RemovedWidget) {
    return other.text === this.text && other.block === this.block;
  }
  toDOM() {
    // Like WordDiff's Change: edge whitespace outside the <del>, so the tint hugs the words.
    const [, lead = '', core = '', trail = ''] = edges.exec(this.text) ?? [];
    const wrap = document.createElement(this.block ? 'div' : 'span');
    wrap.className = this.block ? 'cm-sc-removed-lines' : 'cm-sc-removed';
    const del = document.createElement('del');
    del.className = 'sc-word-diff__removed';
    const hidden = (t: string) =>
      Object.assign(document.createElement('span'), { className: 'sc-visually-hidden', textContent: t });
    del.append(hidden('[removed: '), core, hidden(']'));
    wrap.append(lead, del, trail);
    return wrap;
  }
}

const added = Decoration.mark({ tagName: 'ins', class: 'sc-word-diff__added' });

/** The decorations for `doc` against `base`: added marks and removed widgets, sorted. */
export function diffDecorations(doc: Text, base: string): DecorationSet {
  const ranges = [];
  let pos = 0;
  for (const part of diffParts(base, doc.toString())) {
    const [, lead = '', core = ''] = edges.exec(part.text) ?? [];
    if (part.kind === 'same') pos += part.text.length;
    else if (part.kind === 'added') {
      if (core) ranges.push(added.range(pos + lead.length, pos + lead.length + core.length));
      pos += part.text.length;
    } else if (core) {
      // Whole lines removed at a line start: a block above that line. Anything else: inline, before the caret.
      const block = part.text.endsWith('\n') && (pos === 0 || doc.sliceString(pos - 1, pos) === '\n');
      const widget = new RemovedWidget(block ? part.text.slice(0, -1) : part.text, block);
      ranges.push(Decoration.widget({ widget, side: -1, block }).range(pos));
    }
  }
  return Decoration.set(ranges, true);
}

const baseFacet = Facet.define<string, string>({ combine: (values) => values[0] ?? '' });

const diffField = StateField.define<DecorationSet>({
  create: (state) => diffDecorations(state.doc, state.facet(baseFacet)),
  update(value, tr) {
    const base = tr.state.facet(baseFacet);
    if (!tr.docChanged && base === tr.startState.facet(baseFacet)) return value;
    // Prototype: the whole diff on every change. Fine for the lab's files; the app version should defer it.
    return diffDecorations(tr.state.doc, base);
  },
  // Block widgets have to come from state, not a view plugin.
  provide: (field) => EditorView.decorations.from(field),
});

const theme = EditorView.theme({
  '.cm-sc-removed-lines': { paddingInline: 'var(--sc-spacing-sm)', whiteSpace: 'pre-wrap' },
});

/** Shows the document's changes against `base` inline. Reconfigure it (in a Compartment) to change the base. */
export function wordDiff(base: string): Extension {
  return [baseFacet.of(base), diffField, theme];
}

/** Test seam: the decorations in `state`, or none when the extension isn't on. */
export const wordDiffDecorations = (state: EditorState): DecorationSet =>
  state.field(diffField, false) ?? Decoration.none;
