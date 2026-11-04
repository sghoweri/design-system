import { Field } from '@base-ui/react/field';
import type { ComponentPropsWithRef } from 'react';
import { FieldShell, type FieldProps } from '../Field/FieldShell';

export interface TextareaProps
  extends
    Omit<ComponentPropsWithRef<'textarea'>, 'name' | 'disabled' | 'required' | 'className'>,
    Omit<FieldProps, 'size'> {
  /** Visible lines. Default 3. */
  rows?: number | undefined;
  /** `vertical` (default) lets the user drag it taller; `none` fixes the height. */
  resize?: 'vertical' | 'none' | undefined;
  /** Called with the string value on every change, beside the native `onChange`. */
  onValueChange?: ((value: string) => void) | undefined;
}

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
  onValueChange,
  ...rest
}: TextareaProps) {
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
        render={<textarea rows={rows} {...rest} />}
        className="sc-input sc-textarea"
        data-resize={resize}
        required={required}
        onValueChange={onValueChange ? (value) => onValueChange(value) : undefined}
      />
    </FieldShell>
  );
}
