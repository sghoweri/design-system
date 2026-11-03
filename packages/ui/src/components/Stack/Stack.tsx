import { createElement, type ComponentPropsWithRef, type ReactNode } from 'react';
import type { SpacingSize } from '../../types';
import { cx } from '../../utils/cx';

export type StackAlign = 'stretch' | 'start' | 'center' | 'end';
export type StackJustify = 'start' | 'center' | 'end' | 'between';
export type StackElement = 'div' | 'section' | 'ul' | 'ol' | 'nav' | 'form';

export interface StackProps extends ComponentPropsWithRef<'div'> {
  /** Gap from the spacing scale. Default `sm` (12px). */
  gap?: SpacingSize | undefined;
  /** Cross-axis alignment. Default `stretch`. */
  align?: StackAlign | undefined;
  /** Main-axis distribution. Default `start`. */
  justify?: StackJustify | undefined;
  /** Element to render. Use `ul`/`ol` for lists so semantics survive the layout. */
  as?: StackElement | undefined;
  /** Lays out as `inline-flex`. */
  inline?: boolean | undefined;
  children?: ReactNode | undefined;
}

/** Vertical flex layout with a token gap. The only way children should be spaced vertically. */
export function Stack({
  gap = 'sm',
  align = 'stretch',
  justify = 'start',
  as = 'div',
  inline = false,
  className,
  ...rest
}: StackProps) {
  return createElement(as, {
    className: cx('sc-stack', className),
    'data-gap': gap,
    'data-align': align,
    'data-justify': justify,
    'data-inline': inline || undefined,
    ...rest,
  });
}
