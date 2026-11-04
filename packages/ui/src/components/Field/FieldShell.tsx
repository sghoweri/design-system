import { Field } from '@base-ui/react/field';
import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';

export type ControlSize = 'sm' | 'md' | 'lg';

/** Props shared by every labelled form control: Input, Textarea, Select. */
export interface FieldProps {
  /** Required. The visible label; use `hideLabel` to keep it for assistive tech only. */
  label: ReactNode;
  /** Visually hides the label (a search box with an icon, a table filter). */
  hideLabel?: boolean | undefined;
  /** Help text under the control, wired with `aria-describedby`. */
  description?: ReactNode | undefined;
  /** The error message. When given the control is invalid and the message is announced. */
  error?: ReactNode | undefined;
  /** Marks the control invalid without a message. */
  invalid?: boolean | undefined;
  /** Shows a mark after the label and sets the native `required`. */
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  /** Identifies the value when a form is submitted. */
  name?: string | undefined;
  /** Control height: 32, 40 (default) or 48px. Compact density shrinks each by one step. */
  size?: ControlSize | undefined;
  /** Class on the wrapper, not the control. */
  className?: string | undefined;
}

interface FieldShellProps extends FieldProps {
  children: ReactNode;
}

/** Internal: Field.Root with label, control slot, description and error in the right order and ARIA. */
export function FieldShell({
  label,
  hideLabel = false,
  description,
  error,
  invalid = false,
  required = false,
  disabled = false,
  name,
  size = 'md',
  className,
  children,
}: FieldShellProps) {
  return (
    <Field.Root
      className={cx('sc-field', className)}
      name={name}
      disabled={disabled}
      invalid={invalid || error != null}
      data-size={size}
    >
      <Field.Label className={cx('sc-field__label', hideLabel && 'sc-visually-hidden')}>
        {label}
        {required ? (
          <span className="sc-field__required" aria-hidden="true">
            *
          </span>
        ) : null}
      </Field.Label>
      {children}
      {description != null ? (
        <Field.Description className="sc-field__description">{description}</Field.Description>
      ) : null}
      {error != null ? (
        <Field.Error className="sc-field__error" match>
          {error}
        </Field.Error>
      ) : null}
    </Field.Root>
  );
}
