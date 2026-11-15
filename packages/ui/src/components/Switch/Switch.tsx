import { Switch as BaseSwitch } from '@base-ui/react/switch';
import { useId, type ReactNode } from 'react';
import { cx } from '../../utils/cx';

export interface SwitchProps extends Omit<
  BaseSwitch.Root.Props,
  'className' | 'onCheckedChange' | 'render' | 'children'
> {
  /** Required. The visible label; clicking it flips the switch. */
  label: ReactNode;
  /** Help text under the label, wired with `aria-describedby`. */
  description?: ReactNode | undefined;
  /** Called with the next checked state. */
  onCheckedChange?: ((checked: boolean) => void) | undefined;
  /** `end` (default) puts the switch before the label; `start` puts the label first and the switch at the row's end. */
  labelPosition?: 'start' | 'end' | undefined;
  className?: string | undefined;
}

/** A labelled on/off switch for settings that apply at once. Built on Base UI's Switch. */
export function Switch({
  label,
  description,
  onCheckedChange,
  labelPosition = 'end',
  className,
  disabled,
  ...rest
}: SwitchProps) {
  const descriptionId = useId();
  return (
    <div
      className={cx('c-proto-choice', className)}
      data-disabled={disabled || undefined}
      data-label-position={labelPosition}
    >
      <label className="c-proto-choice__control">
        <BaseSwitch.Root
          className="c-proto-switch"
          disabled={disabled}
          aria-describedby={description != null ? descriptionId : undefined}
          onCheckedChange={onCheckedChange ? (checked) => onCheckedChange(checked) : undefined}
          {...rest}
        >
          <BaseSwitch.Thumb className="c-proto-switch__thumb" />
        </BaseSwitch.Root>
        <span className="c-proto-choice__label">{label}</span>
      </label>
      {description != null ? (
        <span className="c-proto-choice__description" id={descriptionId}>
          {description}
        </span>
      ) : null}
    </div>
  );
}
