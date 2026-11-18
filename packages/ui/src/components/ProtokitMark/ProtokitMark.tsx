import type { ComponentPropsWithRef } from 'react';
import type { IconSize } from '../Icon/Icon';
import { cx } from '../../utils/cx';

export type ProtokitMarkSize = IconSize;

/** Where the electron orbits: in the bowl's counter around the nucleus, or around the outside of the ring. */
export type ProtokitMarkOrbit = 'inside' | 'outside';

/** When the electron circles: while the link or button around the mark is hovered or focused, or all the time. */
export type ProtokitMarkMotion = 'hover' | 'always';

export interface ProtokitMarkProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  /**
   * The mark's size: the Icon sizes (`xs` 12, `sm` 14, `md` 16, `lg` 20, `xl` 24), or `em` to follow the font size.
   * Default `lg`. For any other size (the brand's 32 and 96), set `--proto-protokit-mark-size` on the element. Under
   * 24px the ring is drawn one unit heavier; under 32px the `orbit` electron is not drawn (it would smudge the nucleus).
   */
  size?: ProtokitMarkSize | undefined;
  /** The accessible name (`role="img"`). Default "Protokit". */
  label?: string | undefined;
  /**
   * The electron, `inside` by default, or `false` for the plain P (a favicon, an avatar, print). It is parked at half past one (45° above 3 o'clock), that circles the nucleus clockwise once every 6s
   * (`--proto-protokit-mark-orbit-duration`) while the link or button around the mark is hovered or keyboard-focused.
   * Leaving stops it where it is, and the next hover carries on from there. `inside` circles in the bowl's counter,
   * between the nucleus and the ring; `outside` circles just outside the ring and passes behind the stem. Under
   * `prefers-reduced-motion` it stays parked. Not drawn under 32px. Decorative; it changes nothing that is read.
   */
  orbit?: ProtokitMarkOrbit | false | undefined;
  /**
   * `hover` (default): the electron circles only while the link or button around the mark is hovered or focused.
   * `always`: it circles all the time, as in the header's `ProtokitLogo`. A loop that runs on its own for more than
   * 5s needs a way to pause it (WCAG 2.2.2); this one stops only under `prefers-reduced-motion`.
   */
  motion?: ProtokitMarkMotion | undefined;
}

/**
 * The electron at 0°. Inside: r 2 on an orbit of r 9, 1.5 units clear of the nucleus (5.5) and the ring's inner edge
 * (12.5). Outside: r 2.5 on an orbit of r 24.5, 2.5 units clear of the ring's outer edge (19.5), touching the top of
 * the 64 box at 90° and never leaving it.
 */
const ELECTRON = {
  inside: { cx: 44, r: 2 },
  outside: { cx: 59.5, r: 2.5 },
} as const satisfies Record<ProtokitMarkOrbit, { cx: number; r: number }>;

/**
 * Protokit's mark, "Proton": a monogram P whose bowl is a ring around an accent nucleus, so it reads as a letter
 * first and an atom second. The stem and ring are `currentColor`, inherited from the context (so a link's hover or
 * pressed colour reaches them), the nucleus and electron `--proto-color-accent-default`; all `CanvasText` in forced
 * colours. Not the Job Sweep `Logo`, which is that product's mark.
 *
 * @since 0.2.0
 * @cssprop [--proto-protokit-mark-size=var(--proto-size-icon-lg)] - The mark's size when no `size` fits.
 * @cssprop [--proto-protokit-mark-orbit-duration=6s] - How long one turn of the electron takes.
 */
export function ProtokitMark({
  size = 'lg',
  label = 'Protokit',
  orbit = 'inside',
  motion = 'hover',
  className,
  ...rest
}: ProtokitMarkProps) {
  return (
    <span
      className={cx('c-proto-protokit-mark', className)}
      data-size={size}
      data-orbit={orbit || undefined}
      data-motion={orbit && motion === 'always' ? 'always' : undefined}
      role="img"
      aria-label={label}
      {...rest}
    >
      {/* The electron is its own layer, under the drawing, so orbiting rotates one composited layer and never
          repaints the P, and the stem hides it as it passes behind. Its 0° is 3 o'clock; CSS parks it at 45° above. */}
      {orbit ? (
        <span className="c-proto-protokit-mark__orbit" aria-hidden="true">
          <svg viewBox="0 0 64 64" focusable="false">
            <circle className="c-proto-protokit-mark__electron" cy="27" {...ELECTRON[orbit]} />
          </svg>
        </span>
      ) : null}
      <svg
        className="c-proto-protokit-mark__drawing"
        viewBox="0 0 64 64"
        focusable="false"
        aria-hidden="true"
      >
        <rect x="12" y="8" width="7" height="48" rx="3.5" fill="currentColor" />
        <circle
          className="c-proto-protokit-mark__ring"
          cx="35"
          cy="27"
          r="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
        />
        <circle className="c-proto-protokit-mark__nucleus" cx="35" cy="27" r="5.5" />
      </svg>
    </span>
  );
}
