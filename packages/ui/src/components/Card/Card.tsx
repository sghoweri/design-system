import { useRender } from '@base-ui/react/use-render';
import { cx } from '../../utils/cx';

export type CardVariant = 'outlined' | 'elevated' | 'filled';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';
export type CardElement = 'div' | 'article' | 'section' | 'li' | 'a' | 'button';

export interface CardProps extends useRender.ComponentProps<'div'> {
  /** `outlined` hairline (default), `elevated` floats, `filled` is an inset region. */
  variant?: CardVariant | undefined;
  /** `none`, `sm` 12px, `md` 16px (default), `lg` 24px. */
  padding?: CardPadding | undefined;
  /** Hover lifts the card and the whole card is the target. Render it as `a` or `button` so it is a real control. */
  interactive?: boolean | undefined;
  /** Accent border with a 1px inset, for the active row or chosen option. */
  selected?: boolean | undefined;
  /** Element to render when `render` is not given. */
  as?: CardElement | undefined;
}

/** A bordered surface that groups related content. Compose the inside with Stack and Inline. */
export function Card({
  variant = 'outlined',
  padding = 'md',
  interactive = false,
  selected = false,
  as = 'div',
  render,
  className,
  ref,
  ...rest
}: CardProps) {
  return useRender({
    render,
    ref,
    defaultTagName: as,
    props: {
      className: cx('sc-card', className),
      'data-variant': variant,
      'data-padding': padding,
      'data-interactive': interactive || undefined,
      'data-selected': selected || undefined,
      ...rest,
    },
  });
}
