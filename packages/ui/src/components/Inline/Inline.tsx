import { createElement, type ComponentPropsWithRef, type ReactNode } from 'react';
import type { SpacingSize } from '../../types';
import { cx } from '../../utils/cx';

export type InlineAlign = 'center' | 'start' | 'end' | 'baseline' | 'stretch';
export type InlineJustify = 'start' | 'center' | 'end' | 'between';
export type InlineElement = 'div' | 'span' | 'ul' | 'nav';

export interface InlineProps extends ComponentPropsWithRef<'div'> {
  /** Gap from the spacing scale. Default `xs` (8px). */
  gap?: SpacingSize | undefined;
  /** Cross-axis alignment. Default `center`; use `baseline` when mixing text sizes. */
  align?: InlineAlign | undefined;
  /** Main-axis distribution. Default `start`. */
  justify?: InlineJustify | undefined;
  /** Wraps by default; `false` for toolbars that scroll. */
  wrap?: boolean | undefined;
  /** Element to render. */
  as?: InlineElement | undefined;
  children?: ReactNode | undefined;
}

/** Horizontal flex layout that wraps. For rows of buttons, badges, metadata and key combinations. */
export function Inline({
  gap = 'xs',
  align = 'center',
  justify = 'start',
  wrap = true,
  as = 'div',
  className,
  ...rest
}: InlineProps) {
  return createElement(as, {
    className: cx('sc-inline', className),
    'data-gap': gap,
    'data-align': align,
    'data-justify': justify,
    'data-nowrap': wrap ? undefined : '',
    ...rest,
  });
}
