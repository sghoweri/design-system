import { Field } from '@base-ui/react/field';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { FieldShell, type FieldProps } from '../Field/FieldShell';

export interface InputProps
  extends
    Omit<ComponentPropsWithRef<'input'>, 'size' | 'name' | 'disabled' | 'required' | 'className'>,
    FieldProps {
  /** A 16px icon inside the start edge, for search and URL fields. Decorative. */
  iconStart?: ReactNode | undefined;
  /** A 16px icon inside the end edge. Decorative; use an `IconButton` outside the field for an action. */
  iconEnd?: ReactNode | undefined;
  /** Called with the string value on every change, beside the native `onChange`. */
  onValueChange?: ((value: string) => void) | undefined;
}

/** A labelled single-line text field. Renders a native `<input>` inside Base UI's Field. */
export function Input({
  label,
  hideLabel,
  description,
  error,
  invalid,
  required,
  disabled,
  name,
  size,
  className,
  iconStart,
  iconEnd,
  onValueChange,
  ...rest
}: InputProps) {
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
      <span
        className="sc-input-wrap"
        data-icon-start={iconStart ? '' : undefined}
        data-icon-end={iconEnd ? '' : undefined}
      >
        {iconStart ? (
          <span className="sc-input__icon" data-side="start" aria-hidden="true">
            {iconStart}
          </span>
        ) : null}
        <Field.Control
          className="sc-input"
          required={required}
          onValueChange={onValueChange ? (value) => onValueChange(value) : undefined}
          {...rest}
        />
        {iconEnd ? (
          <span className="sc-input__icon" data-side="end" aria-hidden="true">
            {iconEnd}
          </span>
        ) : null}
      </span>
    </FieldShell>
  );
}
