import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { Textarea } from '../Textarea/Textarea';
import { cx } from '../../utils/cx';
import type * as CodeMirror from './codemirror';
import type { EditorHandle, EditorOptions, TextEditorLanguage } from './codemirror';

export type { TextEditorLanguage };
export type TextEditorView = 'edit' | 'inline';

export interface TextEditorProps {
  /** Required. The visible label. */
  label: ReactNode;
  /** Help text under the editor, wired with `aria-describedby`. */
  description?: ReactNode | undefined;
  /** The text. Controlled: pass `onValueChange` and feed the value back. */
  value: string;
  onValueChange: (value: string) => void;
  /** Syntax highlighting. `markdown` and `text` keep the phone's autocorrect and capitals; `yaml` and `json` turn them off. */
  language?: TextEditorLanguage | undefined;
  /** The text to compare against, such as the saved version. */
  base?: string | undefined;
  /** `edit` (default) or `inline`: changes against `base` shown in place, removed words struck through. */
  view?: TextEditorView | undefined;
  /** Minimum visible lines; the editor grows with its content. Default 8. */
  rows?: number | undefined;
  /** Class on the wrapper. */
  className?: string | undefined;
}

type CodeMirrorModule = typeof CodeMirror;
// The only path to CodeMirror: a dynamic import, so it lands in its own chunk and never in the server render.
const load = (): Promise<CodeMirrorModule> => import('./codemirror');

/**
 * A code and text editor on CodeMirror 6, with inline word diffs against `base`. Client-only: it renders a plain
 * code Textarea until CodeMirror has loaded, then swaps, keeping focus and the selection. Lab component
 * (`@salemcobalt/ui/editor`) for the iPhone check.
 */
export function TextEditor({
  label,
  description,
  value,
  onValueChange,
  language = 'text',
  base,
  view = 'edit',
  rows = 8,
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
  const labelId = useId();
  const descriptionId = useId();
  const options: EditorOptions = {
    value,
    base,
    diff: view === 'inline',
    language,
    attributes: {
      'aria-labelledby': labelId,
      ...(description != null ? { 'aria-describedby': descriptionId } : {}),
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

  if (!module) {
    return (
      <Textarea
        ref={textareaRef}
        className={className}
        label={label}
        description={description}
        value={value}
        onValueChange={onValueChange}
        rows={rows}
        variant="code"
        {...(language === 'markdown' || language === 'text'
          ? { spellCheck: true, autoCorrect: 'on', autoCapitalize: 'sentences' }
          : {})}
        data-editor="fallback"
      />
    );
  }
  return (
    <div className={cx('sc-field', className)} data-editor="codemirror">
      <span id={labelId} className="sc-field__label">
        {label}
      </span>
      <div ref={hostRef} style={{ '--_rows': rows } as CSSProperties} />
      {description != null ? (
        <p id={descriptionId} className="sc-field__description">
          {description}
        </p>
      ) : null}
    </div>
  );
}
