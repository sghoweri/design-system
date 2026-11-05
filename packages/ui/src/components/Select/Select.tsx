import { Select as BaseSelect } from '@base-ui/react/select';
import { useState, type KeyboardEvent, type ReactNode } from 'react';
import { FieldShell, type FieldProps } from '../Field/FieldShell';
import { CheckIcon, ChevronDownIcon, XIcon } from '../../icons/icons.gen';

export interface SelectOption<Value extends string = string> {
  value: Value;
  label: ReactNode;
  disabled?: boolean | undefined;
}

export interface SelectGroup<Value extends string = string> {
  /** Heading shown above the group's options. */
  label: ReactNode;
  options: SelectOption<Value>[];
}

export interface SelectProps<Value extends string = string> extends FieldProps {
  /** Flat options, or groups of options with a heading. */
  options: Array<SelectOption<Value> | SelectGroup<Value>>;
  /** Controlled value; `null` for none, which shows `placeholder`. No sentinel option needed. */
  value?: Value | null | undefined;
  /** Initial value when uncontrolled; `null` (default) for none. */
  defaultValue?: Value | null | undefined;
  /** Called with the chosen value, or `null` when the field is cleared. */
  onValueChange?: ((value: Value | null) => void) | undefined;
  /** Shown in the trigger while nothing is chosen. */
  placeholder?: ReactNode | undefined;
  /**
   * Shows an × beside the chevron while a value is chosen; pressing it, or Backspace/Delete on the
   * focused trigger, sets the value to `null` and calls `onValueChange(null)`.
   */
  clearable?: boolean | undefined;
  /** Accessible name of the clear button. Default "Clear". */
  clearLabel?: string | undefined;
  /** Prevents choosing a different option. */
  readOnly?: boolean | undefined;
  /** Stretches the trigger to the container. */
  fullWidth?: boolean | undefined;
  id?: string | undefined;
}

function isGroup<V extends string>(entry: SelectOption<V> | SelectGroup<V>): entry is SelectGroup<V> {
  return 'options' in entry;
}

function Option<V extends string>({ option }: { option: SelectOption<V> }) {
  return (
    <BaseSelect.Item value={option.value} disabled={option.disabled} className="sc-select__item">
      <BaseSelect.ItemIndicator className="sc-select__indicator">
        <CheckIcon size="sm" />
      </BaseSelect.ItemIndicator>
      <BaseSelect.ItemText className="sc-select__item-text">{option.label}</BaseSelect.ItemText>
    </BaseSelect.Item>
  );
}

/**
 * A labelled single-choice dropdown. Built on Base UI's Select so the list is styled and keyboard
 * complete; submits like a native select through `name`.
 */
export function Select<Value extends string = string>({
  label,
  hideLabel,
  description,
  error,
  invalid,
  required,
  disabled,
  name,
  size = 'md',
  className,
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = 'Choose…',
  clearable = false,
  clearLabel = 'Clear',
  readOnly,
  fullWidth = false,
  id,
}: SelectProps<Value>) {
  const items = options.flatMap((entry) => (isGroup(entry) ? entry.options : [entry]));
  const [internal, setInternal] = useState<Value | null>(defaultValue ?? null);
  const controlled = value !== undefined;
  const current = controlled ? value : internal;
  const setValue = (next: Value | null) => {
    if (!controlled) setInternal(next);
    onValueChange?.(next);
  };
  const canClear = clearable && current != null && !disabled && !readOnly;
  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (canClear && (event.key === 'Backspace' || event.key === 'Delete')) {
      event.preventDefault();
      setValue(null);
    }
  };
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
      size={size}
      className={className}
    >
      <BaseSelect.Root<Value | null>
        items={items}
        value={current}
        onValueChange={(next) => setValue(next)}
        disabled={disabled}
        required={required}
        readOnly={readOnly}
      >
        <span className="sc-select__wrap" data-full-width={fullWidth || undefined}>
          <BaseSelect.Trigger
            id={id}
            className="sc-select"
            data-size={size}
            data-full-width={fullWidth || undefined}
            data-clearable={canClear || undefined}
            onKeyDown={onTriggerKeyDown}
          >
            <BaseSelect.Value className="sc-select__value" placeholder={placeholder} />
            <BaseSelect.Icon className="sc-select__icon">
              <ChevronDownIcon />
            </BaseSelect.Icon>
          </BaseSelect.Trigger>
          {canClear ? (
            <button
              type="button"
              className="sc-select__clear"
              aria-label={clearLabel}
              onClick={() => setValue(null)}
            >
              <XIcon size="sm" />
            </button>
          ) : null}
        </span>
        <BaseSelect.Portal>
          <BaseSelect.Positioner
            className="sc-select__positioner"
            sideOffset={4}
            alignItemWithTrigger={false}
          >
            <BaseSelect.Popup className="sc-select__popup">
              <BaseSelect.List>
                {options.map((entry, i) =>
                  isGroup(entry) ? (
                    <BaseSelect.Group key={i} className="sc-select__group">
                      <BaseSelect.GroupLabel className="sc-select__group-label">
                        {entry.label}
                      </BaseSelect.GroupLabel>
                      {entry.options.map((option) => (
                        <Option key={option.value} option={option} />
                      ))}
                    </BaseSelect.Group>
                  ) : (
                    <Option key={entry.value} option={entry} />
                  ),
                )}
              </BaseSelect.List>
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </BaseSelect.Portal>
      </BaseSelect.Root>
    </FieldShell>
  );
}
