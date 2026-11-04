import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../../utils/cx';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'em';

export interface IconProps extends Omit<ComponentPropsWithRef<'svg'>, 'children'> {
  /** `xs` 12, `sm` 14, `md` 16 (default), `lg` 20, `xl` 24, or `em` to follow the surrounding font size. */
  size?: IconSize | undefined;
  /** Gives the icon an accessible name (`role="img"`). Without it the icon is decorative and hidden from assistive tech. */
  title?: string | undefined;
  /** The glyph: `<path>`, `<circle>` … on a 16×16 grid, stroke `currentColor`. */
  children: ReactNode;
}

/** Props of a shipped icon such as `PlayIcon`: everything `Icon` takes except the glyph. */
export type IconGlyphProps = Omit<IconProps, 'children'>;

/**
 * The frame every icon renders in: a 16×16 outline in `currentColor`, sized by `size`, decorative unless
 * `title` is given. Use the shipped `<Name>Icon` components, or wrap your own paths.
 */
export function Icon({ size = 'md', title, className, children, ...rest }: IconProps) {
  return (
    <svg
      className={cx('sc-icon', className)}
      data-size={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      aria-label={title}
      {...rest}
    >
      {children}
    </svg>
  );
}
