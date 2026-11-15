import { useId, type ComponentPropsWithRef } from 'react';
import type { IconSize } from '../Icon/Icon';
import { cx } from '../../utils/cx';

export type LogoSize = IconSize;

export interface LogoProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  /**
   * The mark's size: the Icon sizes (`xs` 12, `sm` 14, `md` 16, `lg` 20, `xl` 24), or `em` to follow the font
   * size. Default `lg`, the nav size. At `md` and below the mark switches to its 16px drawing (a heavier handle,
   * no bristle cuts). For a one-off size, set `--sc-logo-size` (any length) on the element.
   */
  size?: LogoSize | undefined;
  /** Shows the name beside the mark in the surrounding font. The visible text is then the accessible name. */
  wordmark?: boolean | undefined;
  /** The accessible name of the mark alone (`role="img"`). Default "Job Sweep". Ignored with `wordmark`. */
  label?: string | undefined;
}

/** The product name the wordmark shows. */
const NAME = 'Job Sweep';

/** Sizes drawn with the 16px glyph. */
const SMALL: ReadonlySet<LogoSize> = new Set<LogoSize>(['xs', 'sm', 'md']);

/**
 * The Job Sweep logo: the "Tile cut-out" mark, a rounded accent square with the broom knocked out, optionally
 * followed by the name. The tile is `--sc-color-accent-default` (light and dark), `CanvasText` in forced colours;
 * the broom is a mask, so whatever is behind the logo shows through it. Inline SVG with a per-instance mask id.
 * See `BroomIcon` for the status broom; the two are different drawings on purpose.
 */
export function Logo({ size = 'lg', wordmark = false, label = NAME, className, ...rest }: LogoProps) {
  const mask = `sc-logo-${useId().replace(/[^\w-]/g, '')}`;
  const small = SMALL.has(size);
  return (
    <span
      className={cx('sc-logo', className)}
      data-size={size}
      role={wordmark ? undefined : 'img'}
      aria-label={wordmark ? undefined : label}
      {...rest}
    >
      <svg className="sc-logo__mark" viewBox="0 0 24 24" focusable="false" aria-hidden="true">
        <mask id={mask}>
          <path fill="#fff" d="M0 0h24v24H0z" />
          <g
            transform="translate(.5 -.5) rotate(45 12 12)"
            stroke="#000"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {small ? (
              <>
                <path strokeWidth="3" d="M12 2.5v8" />
                <path strokeWidth="1.5" d="M9.5 11h5l3.5 9h-12z" />
              </>
            ) : (
              <>
                <path strokeWidth="2.4" d="M12 2.5v8" />
                <path fill="#000" strokeWidth="1.5" d="M9.75 11h4.5l3.2 9H6.55z" />
                <path stroke="#fff" strokeWidth="1.3" d="M10.3 21l.7-5.5M13.7 21l-.7-5.5" />
              </>
            )}
          </g>
        </mask>
        <rect width="24" height="24" rx="5.5" fill="currentColor" mask={`url(#${mask})`} />
      </svg>
      {wordmark ? <span className="sc-logo__wordmark">{NAME}</span> : null}
    </span>
  );
}
