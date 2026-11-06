import type { ComponentPropsWithRef } from 'react';
import type { IconSize } from '../Icon/Icon';
import { cx } from '../../utils/cx';

export interface BroomIconProps extends Omit<ComponentPropsWithRef<'svg'>, 'children'> {
  /** Sweeps back and forth while dust drifts. With `prefers-reduced-motion` it holds still and shows the dust. */
  sweeping?: boolean | undefined;
  /** The Icon sizes (`lg` 20, the nav size, is the default), or `display` (72px, stroke 1.75px) for empty states and showcases. Inside an IconButton it fills the icon slot one step up, since it is drawn on a 24px grid. */
  size?: IconSize | 'display' | undefined;
  /** Gives the icon an accessible name (`role="img"`). Without it the icon is decorative and hidden from assistive tech. */
  title?: string | undefined;
}

/**
 * An animated broom on a 24×24 grid, for "a sweep is running". Inline SVG, because CSS cannot animate
 * inside a `<use>` clone. Strokes keep a fixed screen width at every size (`vector-effect: non-scaling-stroke`).
 * Decorative by default: say what is happening in the surrounding control's label ("Sweeps: running").
 */
export function BroomIcon({ sweeping = false, size = 'lg', title, className, ...rest }: BroomIconProps) {
  return (
    <svg
      className={cx('sc-icon', 'sc-broom', className)}
      data-size={size}
      data-sweeping={sweeping || undefined}
      viewBox="0 0 24 24"
      fill="none"
      focusable="false"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      aria-label={title}
      {...rest}
    >
      <g
        className="sc-broom__body"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16.1 10.48 L19.36 1.86 A0.87 0.87 0 0 1 20.98 2.47 L17.84 10.78" />
        <path d="M13.33 12 C14.23 10.67 16.73 9.87 18.17 11 C19.07 12.67 18.93 18.33 18.4 21.4 C16.07 22.4 11.07 22.07 6.4 18.07 C9.07 16.67 11.8 15 13.33 12 Z" />
        <path className="sc-broom__band" d="M13.47 12.13 L18.4 13.5 L18.33 14.1 L13.27 12.77 Z" />
        <path d="M12.87 13.73 L14.4 14.47 M16.2 15.27 L18.47 15.87" />
        <path d="M12.8 16.87 C11.86 18.24 10.75 19.38 9.57 20.23 M15.6 17.4 C15.22 18.96 14.6 20.44 13.77 21.71" />
      </g>
      <g className="sc-broom__dust" fill="none" stroke="currentColor">
        <circle cx="4.77" cy="13.53" r="0.5" />
        <circle cx="2.7" cy="15.53" r="0.87" />
        <circle cx="4.1" cy="18.27" r="0.5" />
      </g>
    </svg>
  );
}
