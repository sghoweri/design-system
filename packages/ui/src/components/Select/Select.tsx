import { Select as BaseSelect } from '@base-ui/react/select';
import type { ReactNode } from 'react';
import { FieldShell, type FieldProps } from '../Field/FieldShell';
import { CheckIcon, ChevronDownIcon } from '../../icons/icons.gen';

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
  /** Controlled value; `null` for none. */
  value?: Value | null | undefined;
  /** Initial value when uncontrolled. */
  defaultValue?: Value | null | undefined;
  /** Called with the chosen value. */
  onValueChange?: ((value: Value | null) => void) | undefined;
  /** Shown in the trigger while nothing is chosen. */
  placeholder?: ReactNode | undefined;
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
  readOnly,
  fullWidth = false,
  id,
}: SelectProps<Value>) {
  const items = options.flatMap((entry) => (isGroup(entry) ? entry.options : [entry]));
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
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange ? (next) => onValueChange(next) : undefined}
        disabled={disabled}
        required={required}
        readOnly={readOnly}
      >
        <BaseSelect.Trigger
          id={id}
          className="sc-select"
          data-size={size}
          data-full-width={fullWidth || undefined}
        >
          <BaseSelect.Value className="sc-select__value" placeholder={placeholder} />
          <BaseSelect.Icon className="sc-select__icon">
            <ChevronDownIcon />
          </BaseSelect.Icon>
        </BaseSelect.Trigger>
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
