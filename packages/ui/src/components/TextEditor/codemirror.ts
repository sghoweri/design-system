// The lazily loaded half of TextEditor: everything that imports CodeMirror. Each language is its own chunk too.
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { Compartment, EditorState, type Extension } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { tags as t } from '@lezer/highlight';
import { setDiffFocus, wordDiff } from './wordDiff';

export type TextEditorLanguage = 'yaml' | 'json' | 'markdown' | 'text';

export interface EditorOptions {
  value: string;
  /** The text to diff against. No base, no diff. */
  base: string | undefined;
  /** Keep showing changes while focused, recomputed after a pause in typing. Off: hidden until blur. */
  liveDiff: boolean;
  language: TextEditorLanguage;
  disabled: boolean;
  readOnly: boolean;
  invalid: boolean;
  /** Attributes for the editable element: id and ARIA wiring from the React side. */
  attributes: Record<string, string>;
}

export interface EditorHandle {
  update(next: EditorOptions): void;
  /** Focuses the editor, optionally with a selection (from the Textarea it replaced). */
  focus(anchor?: number, head?: number): void;
  destroy(): void;
}

const languages: Record<Exclude<TextEditorLanguage, 'text'>, () => Promise<Extension>> = {
  yaml: () => import('@codemirror/lang-yaml').then((m) => m.yaml()),
  json: () => import('@codemirror/lang-json').then((m) => m.json()),
  markdown: () => import('./markdown').then((m) => m.markdown()),
};

/** Prose gets the phone's autocorrect, capitals and spellcheck; YAML and JSON don't (like Textarea variant="code"). */
const isProse = (language: TextEditorLanguage) => language === 'markdown' || language === 'text';

/** Touch screens: keep the caret line this far above the bottom of the viewport, clear of Safari's toolbar. */
const TOUCH_BOTTOM_MARGIN = 96;
const coarse = () => typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;

// One theme, all tokens: the box and its states match .sc-input.sc-textarea[data-variant='code'].
const theme = EditorView.theme({
  '&': {
    border: 'var(--sc-border-width-hairline) solid var(--sc-color-border-strong)',
    borderRadius: 'var(--sc-radius-md)',
    background: 'var(--sc-color-surface-default)',
    color: 'var(--sc-color-text-default)',
    transition:
      'border-color var(--sc-duration-fast) var(--sc-ease-standard), background-color var(--sc-duration-fast) var(--sc-ease-standard)',
  },
  '&:hover:not([data-disabled])': { borderColor: 'var(--sc-color-text-muted)' },
  '&[data-invalid]': { borderColor: 'var(--sc-color-danger-solid)' },
  '&.cm-focused': {
    outline: 'var(--sc-border-width-focus) solid var(--sc-color-border-focus)',
    outlineOffset: '0',
    borderColor: 'var(--sc-color-border-focus)',
  },
  '&[data-disabled]': {
    background: 'var(--sc-color-surface-sunken)',
    color: 'var(--sc-color-text-subtle)',
    cursor: 'not-allowed',
  },
  '&[data-disabled] .cm-content': { cursor: 'not-allowed' },
  '.cm-scroller': {
    fontFamily: 'var(--sc-font-family-mono)',
    lineHeight: 'var(--sc-font-line-height-normal)',
  },
  '.cm-content': {
    padding: 'var(--sc-spacing-xs) 0',
    fontFamily: 'var(--sc-font-family-mono)',
    fontSize: 'calc(var(--sc-font-size-sm) * 0.95)',
    lineHeight: 'var(--sc-font-line-height-normal)',
    minBlockSize: 'calc(var(--_rows, 3) * 1lh)',
    caretColor: 'var(--sc-color-text-default)',
  },
  '.cm-line, .cm-sc-removed-lines': { paddingInline: 'var(--sc-spacing-sm)' },
  // Touch: iOS zooms the page into a focused field under 16px (as in field.css). Room under the last line, so a tap
  // there isn't near Safari's collapsed toolbar, which takes taps at the bottom edge of the screen.
  '@media (pointer: coarse)': {
    '.cm-content': {
      fontSize: 'max(16px, calc(var(--sc-font-size-sm) * 0.95))',
      paddingBlockEnd: 'var(--sc-spacing-xl)',
    },
    '.cm-scroller': { scrollPaddingBlockEnd: `${TOUCH_BOTTOM_MARGIN}px` },
  },
});

const highlight = HighlightStyle.define([
  { tag: [t.propertyName, t.definition(t.propertyName)], color: 'var(--sc-color-accent-text)' },
  { tag: t.heading, color: 'var(--sc-color-accent-text)', fontWeight: 'var(--sc-font-weight-semibold)' },
  { tag: [t.string, t.special(t.string)], color: 'var(--sc-color-info-text)' },
  { tag: [t.number, t.bool, t.null, t.atom], color: 'var(--sc-color-warning-text)' },
  {
    tag: [t.comment, t.meta, t.punctuation, t.separator, t.processingInstruction],
    color: 'var(--sc-color-text-muted)',
  },
  { tag: [t.link, t.url], color: 'var(--sc-color-text-link)' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: t.strong, fontWeight: 'var(--sc-font-weight-semibold)' },
]);

const diffExtension = (o: EditorOptions) => (o.base != null ? wordDiff(o.base, { live: o.liveDiff }) : []);

/** Editable state, attributes on the editor and on the content: everything that follows the props but the diff. */
function stateExtension(o: EditorOptions): Extension {
  const flag = (on: boolean) => (on ? 'true' : 'false');
  return [
    EditorView.editable.of(!o.disabled),
    EditorState.readOnly.of(o.disabled || o.readOnly),
    EditorView.editorAttributes.of({
      ...(o.invalid ? { 'data-invalid': '' } : {}),
      ...(o.disabled ? { 'data-disabled': '' } : {}),
      ...(o.readOnly ? { 'data-readonly': '' } : {}),
    }),
    EditorView.contentAttributes.of({
      spellcheck: flag(isProse(o.language)),
      autocorrect: isProse(o.language) ? 'on' : 'off',
      autocapitalize: isProse(o.language) ? 'sentences' : 'off',
      ...(o.invalid ? { 'aria-invalid': 'true' } : {}),
      ...(o.disabled ? { 'aria-disabled': 'true' } : {}),
      // Read-only stays focusable and selectable; inputmode none keeps the phone's keyboard down.
      ...(o.readOnly ? { 'aria-readonly': 'true', inputmode: 'none' } : {}),
      ...o.attributes,
    }),
  ];
}
const stateKey = (o: EditorOptions) =>
  JSON.stringify([o.language, o.disabled, o.readOnly, o.invalid, o.attributes]);

/** Mounts a CodeMirror view in `parent`. `onChange` gets the full text after every document change. */
export function mountEditor(
  parent: HTMLElement,
  options: EditorOptions,
  onChange: (value: string) => void,
): EditorHandle {
  const diffSlot = new Compartment();
  const languageSlot = new Compartment();
  const stateSlot = new Compartment();
  let current = options;
  let destroyed = false;

  const loadLanguage = (language: TextEditorLanguage) => {
    if (language === 'text') return view.dispatch({ effects: languageSlot.reconfigure([]) });
    void languages[language]().then((extension) => {
      if (!destroyed && current.language === language)
        view.dispatch({ effects: languageSlot.reconfigure(extension) });
    });
  };

  const view = new EditorView({
    parent,
    state: EditorState.create({
      doc: options.value,
      extensions: [
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        EditorView.lineWrapping,
        EditorState.tabSize.of(2),
        EditorView.scrollMargins.of(() => (coarse() ? { bottom: TOUCH_BOTTOM_MARGIN } : null)),
        theme,
        syntaxHighlighting(highlight),
        // WordDiff's own classes, so the marks and widgets look like WordDiff family="mono".
        EditorView.contentAttributes.of({ class: 'sc-word-diff', 'data-family': 'mono' }),
        stateSlot.of(stateExtension(options)),
        languageSlot.of([]),
        diffSlot.of(diffExtension(options)),
        EditorView.updateListener.of((u) => {
          if (u.docChanged) onChange(u.state.doc.toString());
        }),
      ],
    }),
  });
  loadLanguage(options.language);

  return {
    update(next) {
      const prev = current;
      current = next;
      const effects = [];
      const diffAdded = next.base != null && prev.base == null;
      if (next.base !== prev.base || next.liveDiff !== prev.liveDiff)
        effects.push(diffSlot.reconfigure(diffExtension(next)));
      if (stateKey(next) !== stateKey(prev)) effects.push(stateSlot.reconfigure(stateExtension(next)));
      const doc = view.state.doc;
      const changes =
        next.value !== doc.toString() ? { from: 0, to: doc.length, insert: next.value } : undefined;
      if (effects.length || changes) view.dispatch(changes ? { effects, changes } : { effects });
      // A diff turned on while focused starts out believing it's blurred.
      if (diffAdded && view.hasFocus) view.dispatch({ effects: setDiffFocus.of(true) });
      if (next.language !== prev.language) loadLanguage(next.language);
    },
    focus(anchor, head) {
      if (current.disabled) return;
      if (anchor != null) {
        const max = view.state.doc.length;
        view.dispatch({ selection: { anchor: Math.min(anchor, max), head: Math.min(head ?? anchor, max) } });
      }
      view.focus();
    },
    destroy() {
      destroyed = true;
      view.destroy();
    },
  };
}
