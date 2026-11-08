import { Field } from '@base-ui/react/field';
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/cx';
import type * as CodeMirror from './codemirror';
import type { EditorHandle, EditorOptions, TextEditorLanguage } from './codemirror';

export type { TextEditorLanguage };

export interface TextEditorProps {
  /** Required. The visible label. */
  label: ReactNode;
  /** Help text under the editor, wired with `aria-describedby`. */
  description?: ReactNode | undefined;
  /** The error message. When given the editor is invalid and the message is announced. */
  error?: ReactNode | undefined;
  /** The text. Controlled: feed `onValueChange`'s value back. */
  value: string;
  onValueChange: (value: string) => void;
  /** The text to compare against, such as the saved version. With a base, changes show inline; without, no diff. */
  base?: string | undefined;
  /**
   * Syntax highlighting, loaded per language. `markdown` and `text` (default) keep the phone's autocorrect,
   * capitals and spellcheck; `yaml` and `json` turn them off.
   */
  language?: TextEditorLanguage | undefined;
  /**
   * Keep showing changes while the editor has focus, updated 300ms after the last keystroke. Default false: the
   * diff hides while you type, so nothing moves under the caret, and shows again on blur.
   */
  liveDiff?: boolean | undefined;
  disabled?: boolean | undefined;
  /** Focusable and selectable, not editable. The phone's keyboard stays down. */
  readOnly?: boolean | undefined;
  /** Minimum visible lines; the editor grows with its content. Default 8. */
  rows?: number | undefined;
  /** The editable element's id (the Textarea's before CodeMirror loads). */
  id?: string | undefined;
  /** Class on the wrapper. */
  className?: string | undefined;
}

type CodeMirrorModule = typeof CodeMirror;
// The only path to CodeMirror: a dynamic import, so it lands in its own chunk and never in the server render.
const load = (): Promise<CodeMirrorModule> => import('./codemirror');

const isProse = (language: TextEditorLanguage) => language === 'markdown' || language === 'text';

/**
 * A code and text editor on CodeMirror 6, with inline word diffs against `base`. Client-only: the server and the
 * first client render show a code `<textarea>` in the same field chrome, and CodeMirror replaces it once its chunk
 * has loaded, keeping focus and the selection.
 */
export function TextEditor({
  label,
  description,
  error,
  value,
  onValueChange,
  base,
  language = 'text',
  liveDiff = false,
  disabled = false,
  readOnly = false,
  rows = 8,
  id: idProp,
  className,
}: TextEditorProps) {
  const [module, setModule] = useState<CodeMirrorModule | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<EditorHandle | null>(null);
  // The Textarea's focus and selection at the moment of the swap.
  const handoffRef = useRef<[number, number] | null>(null);
  const onChangeRef = useRef(onValueChange);
  useLayoutEffect(() => {
    onChangeRef.current = onValueChange;
  });
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  const invalid = error != null;
  const describedBy = [description != null && descriptionId, invalid && errorId].filter(Boolean).join(' ');
  const options: EditorOptions = {
    value,
    base,
    liveDiff,
    language,
    disabled,
    readOnly,
    invalid,
    attributes: {
      id,
      'aria-labelledby': labelId,
      ...(describedBy ? { 'aria-describedby': describedBy } : {}),
    },
  };
  const optionsRef = useRef(options);
  useLayoutEffect(() => {
    optionsRef.current = options;
  });

  useEffect(() => {
    let live = true;
    void load().then((m) => {
      if (!live) return;
      const ta = textareaRef.current;
      if (ta && document.activeElement === ta) handoffRef.current = [ta.selectionStart, ta.selectionEnd];
      setModule(() => m);
    });
    return () => {
      live = false;
    };
  }, []);

  useLayoutEffect(() => {
    if (!module || !hostRef.current) return;
    const handle = module.mountEditor(hostRef.current, optionsRef.current, (v) => onChangeRef.current(v));
    handleRef.current = handle;
    if (handoffRef.current) handle.focus(...handoffRef.current);
    handoffRef.current = null;
    return () => {
      handle.destroy();
      handleRef.current = null;
    };
  }, [module]);

  useLayoutEffect(() => {
    handleRef.current?.update(options);
  });

  const prose = isProse(language);
  return (
    <Field.Root
      className={cx('sc-field', className)}
      disabled={disabled}
      invalid={invalid}
      data-size="md"
      data-editor={module ? 'codemirror' : 'fallback'}
    >
      {/* A <label> can't point at a contenteditable, so once CodeMirror is in, a click focuses it by hand. */}
      <Field.Label
        id={labelId}
        htmlFor={id}
        className="sc-field__label"
        onClick={() => handleRef.current?.focus()}
      >
        {label}
      </Field.Label>
      {module ? (
        <div ref={hostRef} style={{ '--_rows': rows } as CSSProperties} />
      ) : (
        <Field.Control
          id={id}
          render={
            <textarea
              ref={textareaRef}
              // Grows to its content like the editor (text-editor.css), so the swap moves the layout only by the diff.
              rows={Math.max(rows, value.split('\n').length)}
              style={{ '--_rows': rows } as CSSProperties}
              readOnly={readOnly}
              spellCheck={prose}
              autoCorrect={prose ? 'on' : 'off'}
              autoCapitalize={prose ? 'sentences' : 'off'}
            />
          }
          className="sc-input sc-textarea"
          data-variant="code"
          data-resize="none"
          value={value}
          onValueChange={(v) => onValueChange(v)}
        />
      )}
      {description != null ? (
        <Field.Description id={descriptionId} className="sc-field__description">
          {description}
        </Field.Description>
      ) : null}
      {invalid ? (
        <Field.Error id={errorId} className="sc-field__error" match>
          {error}
        </Field.Error>
      ) : null}
    </Field.Root>
  );
}
