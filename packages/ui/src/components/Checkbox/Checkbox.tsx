import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { useId, type ReactNode } from 'react';
import { CheckIcon, MinusIcon } from '../../icons/icons.gen';
import { cx } from '../../utils/cx';

export interface CheckboxProps extends Omit<
  BaseCheckbox.Root.Props,
  'className' | 'onCheckedChange' | 'render' | 'children'
> {
  /** Required. The visible label; clicking it toggles the box. */
  label: ReactNode;
  /** Help text under the label, wired with `aria-describedby`. */
  description?: ReactNode | undefined;
  /** Called with the next checked state. */
  onCheckedChange?: ((checked: boolean) => void) | undefined;
  className?: string | undefined;
}

/** A labelled checkbox. `indeterminate` shows a dash for "some of these". Built on Base UI's Checkbox. */
export function Checkbox({
  label,
  description,
  onCheckedChange,
  className,
  disabled,
  ...rest
}: CheckboxProps) {
  const descriptionId = useId();
  return (
    <div className={cx('sc-choice', className)} data-disabled={disabled || undefined}>
      <label className="sc-choice__control">
        <BaseCheckbox.Root
          className="sc-checkbox"
          disabled={disabled}
          aria-describedby={description != null ? descriptionId : undefined}
          onCheckedChange={onCheckedChange ? (checked) => onCheckedChange(checked) : undefined}
          {...rest}
        >
          <BaseCheckbox.Indicator className="sc-checkbox__indicator">
            <CheckIcon size="sm" className="sc-checkbox__check" />
            <MinusIcon size="sm" className="sc-checkbox__dash" />
          </BaseCheckbox.Indicator>
        </BaseCheckbox.Root>
        <span className="sc-choice__label">{label}</span>
      </label>
      {description != null ? (
        <span className="sc-choice__description" id={descriptionId}>
          {description}
        </span>
      ) : null}
    </div>
  );
}
