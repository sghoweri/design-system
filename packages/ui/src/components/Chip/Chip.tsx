import type { ComponentPropsWithRef, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { XIcon } from '../../icons/icons.gen';
import { cx } from '../../utils/cx';

export type ChipTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
export type ChipSize = 'sm' | 'md';

export interface ChipProps extends Omit<ComponentPropsWithRef<'span'>, 'onClick' | 'onRemove'> {
  /** The chip text. Keep it to a word or three. */
  children: ReactNode;
  /** A 14px icon before the text. Decorative. */
  icon?: ReactNode | undefined;
  /** Colour. `neutral` (default) for filters, a status tone when the chip is the status. */
  tone?: ChipTone | undefined;
  /** `md` 32px (default) or `sm` 24px inside table rows and Card headers. */
  size?: ChipSize | undefined;
  /** Filled and `aria-pressed`. Use with `onClick` for a toggling filter chip. */
  selected?: boolean | undefined;
  /** Makes the chip a `<button>` that toggles; `selected` is reflected as `aria-pressed`. */
  onClick?: ((event: MouseEvent<HTMLButtonElement>) => void) | undefined;
  /**
   * Adds a labelled × that calls this. Backspace or Delete on the focused chip (or on the ×) removes it
   * too. Focus is yours to manage after removal: move it to the next chip or the filter input.
   */
  onRemove?: (() => void) | undefined;
  /** Accessible name of the ×. Default "Remove" followed by the chip text when that text is a string. */
  removeLabel?: string | undefined;
  disabled?: boolean | undefined;
}

/**
 * A small pill: an applied filter, a tag, a selectable option in a row of a few. `onClick` makes it a
 * toggle button, `onRemove` adds the ×, and the two combine. Plain text otherwise.
 */
export function Chip({
  children,
  icon,
  tone = 'neutral',
  size = 'md',
  selected = false,
  onClick,
  onRemove,
  removeLabel,
  disabled = false,
  className,
  ...rest
}: ChipProps) {
  const interactive = onClick !== undefined;
  const removeName = removeLabel ?? (typeof children === 'string' ? `Remove ${children}` : 'Remove');
  const handleRemoveKey = (event: KeyboardEvent<HTMLElement>) => {
    if (onRemove && !disabled && (event.key === 'Backspace' || event.key === 'Delete')) {
      event.preventDefault();
      onRemove();
    }
  };
  const shared = {
    className: cx('sc-chip', className),
    'data-tone': tone,
    'data-size': size,
    'data-selected': selected || undefined,
    'data-removable': onRemove ? '' : undefined,
    'data-disabled': disabled || undefined,
  };
  const body = (
    <>
      {icon ? (
        <span className="sc-chip__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="sc-chip__label">{children}</span>
    </>
  );
  const remove = onRemove ? (
    <button
      type="button"
      className="sc-chip__remove"
      aria-label={removeName}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onRemove();
      }}
      onKeyDown={handleRemoveKey}
    >
      <XIcon size="xs" />
    </button>
  ) : null;

  if (interactive) {
    return (
      <span {...shared} {...rest}>
        <button
          type="button"
          className="sc-chip__action"
          aria-pressed={selected}
          disabled={disabled}
          onClick={onClick}
          onKeyDown={handleRemoveKey}
        >
          {body}
        </button>
        {remove}
      </span>
    );
  }
  return (
    <span {...shared} {...rest}>
      {body}
      {remove}
    </span>
  );
}
