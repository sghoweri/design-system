import { Field } from '@base-ui/react/field';
import { useCallback, useLayoutEffect, useRef, type ComponentPropsWithRef, type CSSProperties } from 'react';
import { FieldShell, type FieldProps } from '../Field/FieldShell';

export type TextareaVariant = 'default' | 'code';

export interface TextareaProps
  extends
    Omit<ComponentPropsWithRef<'textarea'>, 'name' | 'disabled' | 'required' | 'className'>,
    Omit<FieldProps, 'size'> {
  /** Visible lines. Default 3. */
  rows?: number | undefined;
  /** `vertical` (default) lets the user drag it taller; `none` fixes the height. Ignored with `autoSize`. */
  resize?: 'vertical' | 'none' | undefined;
  /**
   * Grows and shrinks with its content, from `rows` lines up; no resize handle. CSS `field-sizing: content`
   * where the browser has it, else the height is set from `scrollHeight` on every change.
   */
  autoSize?: boolean | undefined;
  /**
   * `code` for Markdown, JSON and other source: monospace, `tab-size: 2`, spellcheck, autocorrect and
   * autocapitalize off. Add the native `wrap="off"` to keep long lines on one line and scroll sideways.
   */
  variant?: TextareaVariant | undefined;
  /** Called with the string value on every change, beside the native `onChange`. */
  onValueChange?: ((value: string) => void) | undefined;
}

const supportsFieldSizing = () =>
  typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('field-sizing', 'content');

/** A labelled multi-line text field. Renders a native `<textarea>` inside Base UI's Field. */
export function Textarea({
  label,
  hideLabel,
  description,
  error,
  invalid,
  required,
  disabled,
  name,
  className,
  rows = 3,
  resize = 'vertical',
  autoSize = false,
  variant = 'default',
  onValueChange,
  spellCheck,
  autoCorrect,
  autoCapitalize,
  ref,
  style,
  ...rest
}: TextareaProps) {
  const code = variant === 'code';
  const ownRef = useRef<HTMLTextAreaElement | null>(null);
  const setRef = useCallback(
    (el: HTMLTextAreaElement | null) => {
      ownRef.current = el;
      if (typeof ref === 'function') ref(el);
      else if (ref) ref.current = el;
    },
    [ref],
  );
  // Fallback for browsers without `field-sizing`: fit the height to the content after every render
  // (a controlled value) and every input (an uncontrolled one). Borders are added back: border-box.
  useLayoutEffect(() => {
    const el = ownRef.current;
    if (!autoSize || !el || supportsFieldSizing()) return;
    const fit = () => {
      el.style.blockSize = 'auto';
      el.style.blockSize = `${el.scrollHeight + el.offsetHeight - el.clientHeight}px`;
    };
    fit();
    el.addEventListener('input', fit);
    return () => {
      el.removeEventListener('input', fit);
      el.style.blockSize = '';
    };
  });
  return (
    <FieldShell
      label={label}
      hideLabel={hideLabel}
      description={description}
      error={error}
      invalid={invalid}
      required={required}
      disabled={disabled}
      name={name}
      className={className}
    >
      <Field.Control
        render={
          <textarea
            rows={rows}
            spellCheck={spellCheck ?? (code ? false : undefined)}
            autoCorrect={autoCorrect ?? (code ? 'off' : undefined)}
            autoCapitalize={autoCapitalize ?? (code ? 'off' : undefined)}
            ref={setRef}
            style={autoSize ? ({ ...style, '--_rows': rows } as CSSProperties) : style}
            {...rest}
          />
        }
        className="sc-input sc-textarea"
        data-resize={autoSize ? 'none' : resize}
        data-autosize={autoSize ? '' : undefined}
        data-variant={code ? 'code' : undefined}
        required={required}
        onValueChange={onValueChange ? (value) => onValueChange(value) : undefined}
      />
    </FieldShell>
  );
}
