import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { ChipRemove, type ChipSize, type ChipTone } from './Chip';
import { XIcon } from '../../icons/icons.gen';
import { cx } from '../../utils/cx';

export interface EditableChipProps extends Omit<ComponentPropsWithRef<'span'>, 'children' | 'onChange'> {
  /** The chip text, and where the field starts when editing. */
  value: string;
  /**
   * Called with the saved text, whitespace collapsed and trimmed, only when it changed. Saving it empty
   * calls `onRemove` instead (or cancels without one).
   */
  onValueChange: (value: string) => void;
  /** Required. The field's accessible name while editing: "Edit job title". */
  editLabel: string;
  /** Accessible name of the chip's text, the button that starts editing. Default `Edit “{value}”`. */
  editButtonLabel?: string | undefined;
  /**
   * Checks a save before it happens. Return a message to refuse it: the field stays open, invalid, with the
   * message as its error (announced). Return nothing to accept.
   */
  validate?: ((value: string) => ReactNode) | undefined;
  /** Adds a labelled ×; Backspace or Delete on the chip removes it too. Focus after removal is yours. */
  onRemove?: (() => void) | undefined;
  /** Accessible name of the ×. Default "Remove" and the value. */
  removeLabel?: string | undefined;
  /** Accessible name of the clear button shown while editing. Default "Clear". */
  clearLabel?: string | undefined;
  /** A 14px icon before the text. Decorative. */
  icon?: ReactNode | undefined;
  tone?: ChipTone | undefined;
  size?: ChipSize | undefined;
  disabled?: boolean | undefined;
}

const tidy = (text: string) => text.replace(/\s+/g, ' ').trim();

/**
 * A chip whose text edits where it sits: what you see is what you edit. The text is a button; click, Enter or
 * F2 turns the same chip into a field the width of its text, with the caret at the end and a clear button at the
 * far end. Enter or leaving the field saves, Escape cancels; Enter and Escape put focus back on the chip. On a
 * touch screen the text is 16px while editing, so the browser doesn't zoom. A refused save (`validate`) marks the
 * chip invalid and announces the message under it. Key the chip by something stable, not its text, so it keeps
 * its focus across a save.
 */
export function EditableChip({
  value,
  onValueChange,
  editLabel,
  editButtonLabel,
  validate,
  onRemove,
  removeLabel,
  clearLabel = 'Clear',
  icon,
  tone = 'neutral',
  size = 'md',
  disabled = false,
  className,
  ...rest
}: EditableChipProps) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);
  const [error, setError] = useState<ReactNode>(null);
  const button = useRef<HTMLButtonElement>(null);
  const field = useRef<HTMLInputElement>(null);
  // Set when Enter or Escape closes the field, so focus goes back to the chip; a save on blur leaves it be.
  const refocus = useRef(false);
  // Set once saved or cancelled, so the blur that follows doesn't save again.
  const done = useRef(false);
  const errorId = useId();

  useEffect(() => {
    if (editing) {
      // The caret goes at the end: an edit is more often a tweak than a retype.
      const el = field.current;
      el?.focus();
      el?.setSelectionRange(el.value.length, el.value.length);
      return;
    }
    if (!refocus.current) return;
    refocus.current = false;
    button.current?.focus();
  }, [editing]);

  const start = () => {
    setText(value);
    setError(null);
    done.current = false;
    setEditing(true);
  };
  const close = (returnFocus: boolean) => {
    refocus.current = returnFocus;
    setEditing(false);
  };
  const save = (viaKey: boolean) => {
    if (done.current) return;
    const next = tidy(text);
    const message = next !== '' && next !== tidy(value) ? validate?.(next) : null;
    if (message !== null && message !== undefined && message !== false && message !== '') {
      setError(message);
      return;
    }
    done.current = true;
    if (next === '') {
      if (onRemove) {
        setEditing(false);
        onRemove();
        return;
      }
    } else if (next !== value) {
      onValueChange(next);
    }
    close(viaKey);
  };

  const shared = {
    'data-tone': tone,
    'data-size': size,
    'data-disabled': disabled || undefined,
  };
  const iconEl = icon ? (
    <span className="sc-chip__icon" aria-hidden="true">
      {icon}
    </span>
  ) : null;

  if (editing) {
    return (
      <span className={cx('sc-chip-editor', className)} data-editing="">
        <span className="sc-chip" {...shared} data-editing="" data-invalid={error ? '' : undefined}>
          {iconEl}
          <span className="sc-chip__field" data-value={text}>
            <input
              ref={field}
              className="sc-chip__input"
              aria-label={editLabel}
              aria-invalid={error ? true : undefined}
              aria-describedby={errorId}
              value={text}
              size={1}
              autoComplete="off"
              enterKeyHint="done"
              onChange={(event) => {
                setText(event.target.value);
                setError(null);
              }}
              onKeyDown={(event) => {
                if (event.nativeEvent.isComposing) return;
                if (event.key === 'Enter') {
                  event.preventDefault();
                  save(true);
                } else if (event.key === 'Escape') {
                  event.preventDefault();
                  event.stopPropagation();
                  done.current = true;
                  close(true);
                }
              }}
              onBlur={() => save(false)}
            />
          </span>
          {text !== '' ? (
            // Pointer only: from the keyboard, select-all and delete clears, and Tab means "done".
            <button
              type="button"
              className="sc-chip__clear"
              aria-label={clearLabel}
              tabIndex={-1}
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => {
                setText('');
                setError(null);
                field.current?.focus();
              }}
            >
              <XIcon size="xs" />
            </button>
          ) : null}
        </span>
        <span id={errorId} className="sc-chip-editor__error" aria-live="polite">
          {error}
        </span>
      </span>
    );
  }

  const handleKey = (event: KeyboardEvent<HTMLElement>) => {
    if (disabled) return;
    if (onRemove && (event.key === 'Backspace' || event.key === 'Delete')) {
      event.preventDefault();
      onRemove();
    }
  };
  return (
    <span
      className={cx('sc-chip', className)}
      {...shared}
      data-removable={onRemove ? '' : undefined}
      data-editable=""
      {...rest}
    >
      <button
        ref={button}
        type="button"
        className="sc-chip__action"
        aria-label={editButtonLabel ?? `Edit “${value}”`}
        disabled={disabled}
        onClick={start}
        onKeyDown={(event) => {
          // Enter is taken here rather than through the native click, so its keypress can't land in the field.
          if (event.key === 'Enter' || event.key === 'F2') {
            event.preventDefault();
            start();
            return;
          }
          handleKey(event);
        }}
      >
        {iconEl}
        <span className="sc-chip__label">{value}</span>
      </button>
      {onRemove ? (
        <ChipRemove
          label={removeLabel ?? `Remove ${value}`}
          disabled={disabled}
          onRemove={onRemove}
          onKeyDown={handleKey}
        />
      ) : null}
    </span>
  );
}
