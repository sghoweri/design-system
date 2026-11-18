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
 * Protokit's logo for a header: the Proton mark as the lowercase p of "protokit". The ring is the name's x-height and
 * sits on its baseline like an o; the stem runs down as the p's descender. The box is the word's ink, from the k's
 * top to the p's foot, so a header that centres it centres the word. 32px by default (the mark's size), or
 * `--proto-protokit-logo-size`; the electron is not drawn under 32px. Stem, ring and name take the inherited colour,
 * the nucleus and electron the accent.
 *
 * @since 0.2.0
 * @cssprop [--proto-protokit-logo-size=2rem] - The logo's size; the electron is not drawn under 32px.
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
