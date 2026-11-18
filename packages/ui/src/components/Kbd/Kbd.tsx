import { Children, Fragment, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cx } from '../../utils/cx';

export type KbdProps = ComponentPropsWithRef<'kbd'>;

/**
 * A single key, rendered like a keycap. One Kbd per key; group keys with `Kbd.Group`.
 *
 * @since 0.1.0
 */
function KbdBase({ className, ...rest }: KbdProps) {
  return <kbd className={cx('c-proto-kbd', className)} {...rest} />;
}

export interface KbdGroupProps extends ComponentPropsWithRef<'span'> {
  /** The readable combination, announced instead of the symbols: "Command K". */
  label: string;
  /** `plus` (default) draws a muted + between keys; `space` leaves a gap. */
  separator?: 'plus' | 'space' | undefined;
  children?: ReactNode | undefined;
}

/** Groups the keys of one shortcut. */
function KbdGroup({ label, separator = 'plus', className, children, ...rest }: KbdGroupProps) {
  const keys = Children.toArray(children);
  return (
    <span role="group" aria-label={label} className={cx('c-proto-kbd-group', className)} {...rest}>
      {keys.map((key, i) => (
        <Fragment key={i}>
          {i > 0 && separator === 'plus' ? (
            <span className="c-proto-kbd-group__sep" aria-hidden="true">
              +
            </span>
          ) : null}
          {key}
        </Fragment>
      ))}
    </span>
  );
}

export const Kbd = Object.assign(KbdBase, { Group: KbdGroup });
