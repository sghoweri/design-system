import { createElement, type ComponentPropsWithRef, type CSSProperties, type ReactElement } from 'react';
import type { TextTone } from '../Heading/Heading';
import { cx } from '../../utils/cx';

export type TextSize = 'xs' | 'sm' | 'md' | 'lg';
export type TextWeight = 'regular' | 'medium' | 'semibold';
export type TextAlign = 'start' | 'center' | 'end';
export type TextElement =
  | 'p'
  | 'span'
  | 'div'
  | 'label'
  | 'li'
  | 'dt'
  | 'dd'
  | 'strong'
  | 'em'
  | 'small'
  | 'time'
  | 'figcaption'
  | 'legend';

export interface TextProps extends ComponentPropsWithRef<'p'> {
  /** Element to render. Default `p`; `span` inside other text. */
  as?: TextElement | undefined;
  /** `xs` 12 captions, `sm` 14 UI text (default), `md` body copy, `lg` lede. */
  size?: TextSize | undefined;
  /** Colour. `muted` for metadata, `subtle` for placeholders, status tones for inline status. */
  tone?: TextTone | undefined;
  weight?: TextWeight | undefined;
  align?: TextAlign | undefined;
  /** `true` keeps one line with an ellipsis; a number clamps to that many lines. */
  truncate?: boolean | number | undefined;
  /** Tabular figures, for numbers that line up in columns. */
  numeric?: boolean | undefined;
}

/** Running text and labels from the type scale. Parents own spacing: Text has no margins. */
export function Text({
  as = 'p',
  size = 'sm',
  tone = 'default',
  weight = 'regular',
  align,
  truncate = false,
  numeric = false,
  className,
  style,
  ...rest
}: TextProps): ReactElement {
  const clamp = typeof truncate === 'number' ? truncate : undefined;
  return createElement(as, {
    className: cx('sc-text', className),
    'data-size': size,
    'data-tone': tone,
    'data-weight': weight,
    'data-align': align,
    'data-truncate': truncate === true ? '' : clamp !== undefined ? 'clamp' : undefined,
    'data-numeric': numeric || undefined,
    style: clamp !== undefined ? ({ ...style, '--sc-text-lines': clamp } as CSSProperties) : style,
    ...rest,
  });
}
