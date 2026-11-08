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
import {
  Facet,
  StateEffect,
  StateField,
  type EditorState,
  type Extension,
  type Text,
} from '@codemirror/state';
import {
  Decoration,
  EditorView,
  ViewPlugin,
  WidgetType,
  type DecorationSet,
  type ViewUpdate,
} from '@codemirror/view';
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

interface DiffConfig {
  base: string;
  /** Show changes while the editor has focus, recomputed `DEBOUNCE_MS` after the last edit. */
  live: boolean;
}
interface DiffState {
  decorations: DecorationSet;
  focused: boolean;
  /** Mapped through edits since the last diff; the debounce will recompute. */
  stale: boolean;
}

/** Quiet time after the last edit before a live diff recomputes. */
export const DEBOUNCE_MS = 300;

const config = Facet.define<DiffConfig, DiffConfig>({
  combine: (values) => values[0] ?? { base: '', live: false },
});
/** The editor gained (true) or lost focus. Exported so tests can focus a bare EditorState. */
export const setDiffFocus = StateEffect.define<boolean>();
const refresh = StateEffect.define<null>();

const compute = (state: EditorState, focused: boolean): DiffState => ({
  decorations: diffDecorations(state.doc, state.facet(config).base),
  focused,
  stale: false,
});

const diffField = StateField.define<DiffState>({
  create: (state) => compute(state, false),
  update(value, tr) {
    let focused = value.focused;
    let refreshed = false;
    for (const e of tr.effects) {
      if (e.is(setDiffFocus)) focused = e.value;
      if (e.is(refresh)) refreshed = true;
    }
    const { base, live } = tr.state.facet(config);
    const prev = tr.startState.facet(config);
    // Not live: nothing moves under the caret while typing. The diff shows again on blur.
    if (focused && !live) return { decorations: Decoration.none, focused, stale: false };
    const configChanged = base !== prev.base || live !== prev.live;
    // Live and typing: keep the old marks where they were; the debounce recomputes.
    if (focused && tr.docChanged && !refreshed && !configChanged)
      return { decorations: value.decorations.map(tr.changes), focused, stale: true };
    if (refreshed || configChanged || tr.docChanged || focused !== value.focused)
      return compute(tr.state, focused);
    return value;
  },
  // Block widgets have to come from state, not a view plugin.
  provide: (field) => EditorView.decorations.from(field, (value) => value.decorations),
});

// Schedules the recompute of a stale (live) diff, restarting on every edit.
const debounce = ViewPlugin.fromClass(
  class {
    timer: ReturnType<typeof setTimeout> | undefined;
    constructor(readonly view: EditorView) {}
    update(u: ViewUpdate) {
      if (!u.docChanged || !u.state.field(diffField).stale) return;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.view.dispatch({ effects: refresh.of(null) }), DEBOUNCE_MS);
    }
    destroy() {
      clearTimeout(this.timer);
    }
  },
);

const theme = EditorView.theme({
  '.cm-sc-removed-lines': { paddingInline: 'var(--sc-spacing-sm)', whiteSpace: 'pre-wrap' },
});

/**
 * Shows the document's changes against `base` inline. Reconfigure it (in a Compartment) to change the base or
 * `live`. With `live` off (default), the diff hides while the editor has focus and comes back on blur.
 */
export function wordDiff(base: string, { live = false }: { live?: boolean } = {}): Extension {
  return [
    config.of({ base, live }),
    diffField,
    debounce,
    EditorView.focusChangeEffect.of((_state, focusing) => setDiffFocus.of(focusing)),
    theme,
  ];
}

/** Test seam: the decorations in `state`, or none when the extension isn't on. */
export const wordDiffDecorations = (state: EditorState): DecorationSet =>
  state.field(diffField, false)?.decorations ?? Decoration.none;
