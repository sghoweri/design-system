/**
 * Inline word diffs inside CodeMirror 6 (job-radar docs/design/word-diff-editor.md, option (b), phase 2).
 *
 * The current document is diffed against a `base` string (`diffParts`), and the parts become decorations:
 * - added text is a mark (`<ins class="sc-word-diff__added">`) over the document range, between visually hidden
 *   "[added: " and "]", as WordDiff reads;
 * - each removed run is a widget, so it isn't part of the document: the caret steps over it, and it can't be edited
 *   or copied. Inside a line it's an inline `<del>` at the position it was removed from. A run that holds a line
 *   break is a block of `<del>` lines above the line it was removed from, so it never breaks a line in two.
 * The classes are WordDiff's, and the content carries `class="sc-word-diff" data-family="mono"`, so it looks the
 * same as WordDiff from `@salemcobalt/ui/styles.css`. Not `@codemirror/merge` (see the design doc).
 *
 * With `live` off (the default) the diff hides while the editor has focus, so nothing moves under the caret, and
 * shows again on blur. With `live` on it stays, mapped through each edit, and recomputes `DEBOUNCE_MS` after the
 * last one.
 */
import {
  Facet,
  StateEffect,
  StateField,
  type EditorState,
  type Extension,
  type Range,
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

const hidden = (text: string) =>
  Object.assign(document.createElement('span'), { className: 'sc-visually-hidden', textContent: text });

class RemovedWidget extends WidgetType {
  constructor(
    readonly text: string,
    readonly block: boolean,
    readonly label: string,
  ) {
    super();
  }
  override eq(other: RemovedWidget) {
    return other.text === this.text && other.block === this.block && other.label === this.label;
  }
  toDOM() {
    // Like WordDiff's Change: edge whitespace outside the <del>, so the tint hugs the words.
    const [, lead = '', core = '', trail = ''] = edges.exec(this.text) ?? [];
    const wrap = document.createElement(this.block ? 'div' : 'span');
    wrap.className = this.block ? 'cm-sc-removed-lines' : 'cm-sc-removed';
    const del = document.createElement('del');
    del.className = 'sc-word-diff__removed';
    del.append(hidden(`[${this.label}: `), core, hidden(']'));
    wrap.append(lead, del, trail);
    return wrap;
  }
}

/** Visually hidden "[added: " / "]" around an added mark, for screen readers. */
class LabelWidget extends WidgetType {
  constructor(readonly text: string) {
    super();
  }
  override eq(other: LabelWidget) {
    return other.text === this.text;
  }
  toDOM() {
    return hidden(this.text);
  }
}

export interface DiffLabels {
  /** Screen reader word around added text: "[added: …]". Default "added". */
  added?: string | undefined;
  /** Screen reader word around removed text: "[removed: …]". Default "removed". */
  removed?: string | undefined;
}

const addedMark = Decoration.mark({ tagName: 'ins', class: 'sc-word-diff__added' });

/** The decorations for `doc` against `base`: added marks with their labels, and removed widgets, sorted. */
export function diffDecorations(doc: Text, base: string, labels: DiffLabels = {}): DecorationSet {
  const { added = 'added', removed = 'removed' } = labels;
  const ranges: Range<Decoration>[] = [];
  let pos = 0;
  for (const part of diffParts(base, doc.toString())) {
    const [, lead = '', core = ''] = edges.exec(part.text) ?? [];
    if (part.kind === 'same') pos += part.text.length;
    else if (part.kind === 'added') {
      if (core) {
        const from = pos + lead.length;
        const to = from + core.length;
        ranges.push(
          Decoration.widget({ widget: new LabelWidget(`[${added}: `), side: -1, kind: 'label' }).range(from),
          addedMark.range(from, to),
          Decoration.widget({ widget: new LabelWidget(']'), side: 1, kind: 'label' }).range(to),
        );
      }
      pos += part.text.length;
    } else if (core) {
      if (!part.text.includes('\n')) {
        const widget = new RemovedWidget(part.text, false, removed);
        ranges.push(Decoration.widget({ widget, side: -1, kind: 'removed' }).range(pos));
      } else {
        // A run with a line break is whole lines next to the line it was removed from: below it when removed from
        // its end, above it otherwise. Never inline, so it can't break a line in two.
        const line = doc.lineAt(pos);
        const below = pos === line.to && line.to > line.from;
        const widget = new RemovedWidget(part.text.replace(/^\n+|\n+$/g, ''), true, removed);
        ranges.push(
          Decoration.widget({ widget, side: below ? 1 : -1, block: true, kind: 'removed' }).range(
            below ? line.to : line.from,
          ),
        );
      }
    }
  }
  return Decoration.set(ranges, true);
}

interface DiffConfig {
  base: string;
  live: boolean;
  labels: DiffLabels;
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
  combine: (values) => values[0] ?? { base: '', live: false, labels: {} },
});
/** The editor gained (true) or lost focus. Exported so tests can focus a bare EditorState. */
export const setDiffFocus = StateEffect.define<boolean>();
const refresh = StateEffect.define<null>();

const compute = (state: EditorState, focused: boolean): DiffState => {
  const { base, labels } = state.facet(config);
  return { decorations: diffDecorations(state.doc, base, labels), focused, stale: false };
};

const diffField = StateField.define<DiffState>({
  create: (state) => compute(state, false),
  update(value, tr) {
    let focused = value.focused;
    let refreshed = false;
    for (const e of tr.effects) {
      if (e.is(setDiffFocus)) focused = e.value;
      if (e.is(refresh)) refreshed = true;
    }
    const next = tr.state.facet(config);
    // Not live: nothing moves under the caret while typing. The diff shows again on blur.
    if (focused && !next.live) return { decorations: Decoration.none, focused, stale: false };
    const configChanged = next !== tr.startState.facet(config);
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
 * Shows the document's changes against `base` inline. Reconfigure it (in a Compartment) to change the base, `live`
 * or the labels; a new configuration recomputes at once.
 */
export function wordDiff(base: string, options: { live?: boolean; labels?: DiffLabels } = {}): Extension {
  return [
    config.of({ base, live: options.live ?? false, labels: options.labels ?? {} }),
    diffField,
    debounce,
    EditorView.focusChangeEffect.of((_state, focusing) => setDiffFocus.of(focusing)),
    theme,
  ];
}

/** Test seam: the decorations in `state`, or none when the extension isn't on. */
export const wordDiffDecorations = (state: EditorState): DecorationSet =>
  state.field(diffField, false)?.decorations ?? Decoration.none;
