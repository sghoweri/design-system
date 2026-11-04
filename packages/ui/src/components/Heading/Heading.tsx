import { createElement, type ComponentPropsWithRef } from 'react';
import { cx } from '../../utils/cx';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
export type HeadingElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span' | 'p';
export type TextTone = 'default' | 'muted' | 'subtle' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

export interface HeadingProps extends ComponentPropsWithRef<'h2'> {
  /** The outline level, rendered as `h1`–`h6`. Default 2. */
  level?: HeadingLevel | undefined;
  /** Visual size from the type scale, independent of the level. Defaults by level: 3xl, 2xl, xl, lg, md, sm. */
  size?: HeadingSize | undefined;
  /** Render a different element and keep the look; `div`/`span` for a card title that is not an outline entry. */
  as?: HeadingElement | undefined;
  /** Colour. Default is the text colour. */
  tone?: TextTone | undefined;
  /** One line with an ellipsis. */
  truncate?: boolean | undefined;
}

const sizeByLevel: Record<HeadingLevel, HeadingSize> = {
  1: '3xl',
  2: '2xl',
  3: 'xl',
  4: 'lg',
  5: 'md',
  6: 'sm',
};

/** A heading from the type scale. `level` is the semantics, `size` the look; they are set separately on purpose. */
export function Heading({
  level = 2,
  size,
  as,
  tone = 'default',
  truncate = false,
  className,
  ...rest
}: HeadingProps) {
  return createElement(as ?? `h${level}`, {
    className: cx('sc-heading', className),
    'data-size': size ?? sizeByLevel[level],
    'data-tone': tone,
    'data-truncate': truncate || undefined,
    ...rest,
  });
}
