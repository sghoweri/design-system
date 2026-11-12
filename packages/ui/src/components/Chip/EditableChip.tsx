import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { ChipRemove, type ChipSize, type ChipTone } from './Chip';
import { Textarea } from '../Textarea/Textarea';
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
  /** A 14px icon before the text. Decorative. */
  icon?: ReactNode | undefined;
  tone?: ChipTone | undefined;
  size?: ChipSize | undefined;
  disabled?: boolean | undefined;
}

const tidy = (text: string) => text.replace(/\s+/g, ' ').trim();

/**
 * A chip whose text can be edited in place. The text is a button: click, Enter or F2 swaps the chip for a
 * one-line field that grows as the text wraps. Enter or leaving the field saves, Escape cancels; Enter and
 * Escape put focus back on the chip. While editing, the root is `.sc-chip-editor` (`data-editing`), so a
 * wrapping list can give it the full row: `li:has(> .sc-chip-editor) { flex-basis: 100% }`. Key the chip by
 * something stable, not its text, so it keeps its focus across a save.
 */
export function EditableChip({
  value,
  onValueChange,
  editLabel,
  editButtonLabel,
  validate,
  onRemove,
  removeLabel,
  icon,
  tone = 'neutral',
  size = 'md',
  disabled = false,
  className,
  ...rest
}: EditableChipProps) {
  const [editing, setEditing] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  // Set when Enter or Escape closes the field, so focus goes back to the chip; a save on blur leaves it be.
  const refocus = useRef(false);
  useEffect(() => {
    if (editing || !refocus.current) return;
    refocus.current = false;
    button.current?.focus();
  }, [editing]);

  const close = (returnFocus: boolean) => {
    refocus.current = returnFocus;
    setEditing(false);
  };

  if (editing) {
    return (
      <ChipEditor
        className={className}
        label={editLabel}
        initial={value}
        validate={validate}
        onCancel={() => close(true)}
        onSave={(next, viaKey) => {
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
        }}
      />
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
      data-tone={tone}
      data-size={size}
      data-removable={onRemove ? '' : undefined}
      data-disabled={disabled || undefined}
      data-editable=""
      {...rest}
    >
      <button
        ref={button}
        type="button"
        className="sc-chip__action"
        aria-label={editButtonLabel ?? `Edit “${value}”`}
        disabled={disabled}
        onClick={() => setEditing(true)}
        onKeyDown={(event) => {
          // Enter is taken here rather than through the native click, so its keypress can't land in the field.
          if (event.key === 'Enter' || event.key === 'F2') {
            event.preventDefault();
            setEditing(true);
            return;
          }
          handleKey(event);
        }}
      >
        {icon ? (
          <span className="sc-chip__icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
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

function ChipEditor({
  className,
  label,
  initial,
  validate,
  onSave,
  onCancel,
}: {
  className?: string | undefined;
  label: string;
  initial: string;
  validate?: ((value: string) => ReactNode) | undefined;
  onSave: (value: string, viaKey: boolean) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState(initial);
  const [error, setError] = useState<ReactNode>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  // Set once saved or cancelled, so the blur that follows doesn't save again.
  const done = useRef(false);
  // The caret goes at the end: an edit is more often a tweak than a retype.
  useEffect(() => {
    const el = field.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, []);

  const save = (viaKey: boolean) => {
    if (done.current) return;
    const next = tidy(text);
    const message = next !== '' && next !== tidy(initial) ? validate?.(next) : null;
    if (message !== null && message !== undefined && message !== false && message !== '') {
      setError(message);
      return;
    }
    done.current = true;
    onSave(next, viaKey);
  };

  return (
    <div className={cx('sc-chip-editor', className)} data-editing="">
      <Textarea
        ref={field}
        label={label}
        hideLabel
        rows={1}
        autoSize
        value={text}
        error={error ?? undefined}
        onValueChange={(next) => {
          setText(next);
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
            onCancel();
          }
        }}
        onBlur={() => save(false)}
      />
    </div>
  );
}
