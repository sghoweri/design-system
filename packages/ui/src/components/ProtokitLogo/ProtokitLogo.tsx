import type { ComponentPropsWithRef } from 'react';
import { cx } from '../../utils/cx';
import { ProtokitMark, type ProtokitMarkMotion } from '../ProtokitMark/ProtokitMark';

export interface ProtokitLogoProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  /** The accessible name (`role="img"`). Default "Protokit". */
  label?: string | undefined;
  /** When the electron circles: `always` (default, the header) or `hover`, as on `ProtokitMark`. */
  motion?: ProtokitMarkMotion | undefined;
}

/**
 * Protokit's logo for a header: the Proton mark as the P of the name, then "rotokit". The name's cap height is the
 * P's (48 of the mark's 64 units) and it sits on the stem's foot, so the two read as one word. 32px tall by default,
 * or `--proto-protokit-logo-size`; the electron is not drawn under 32px. Stem, ring and name take the inherited
 * colour, the nucleus and electron the accent.
 */
export function ProtokitLogo({
  label = 'Protokit',
  motion = 'always',
  className,
  ...rest
}: ProtokitLogoProps) {
  return (
    <span
      className={cx('c-proto-protokit-logo', className)}
      role="img"
      aria-label={label}
      translate="no"
      {...rest}
    >
      <span className="c-proto-protokit-logo__p" aria-hidden="true">
        <ProtokitMark className="c-proto-protokit-logo__mark" motion={motion} aria-hidden="true" />
      </span>
      <span className="c-proto-protokit-logo__name" aria-hidden="true">
        rotokit
      </span>
    </span>
  );
}
