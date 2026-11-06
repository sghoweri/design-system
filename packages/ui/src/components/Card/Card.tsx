import { useRender } from '@base-ui/react/use-render';
import { cx } from '../../utils/cx';

export type CardVariant = 'outlined' | 'elevated' | 'filled' | 'plain';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';
export type CardElement = 'div' | 'article' | 'section' | 'nav' | 'li' | 'a' | 'button';

export interface CardProps extends useRender.ComponentProps<'div'> {
  /** `outlined` hairline (default), `elevated` floats, `filled` is an inset region, `plain` has no surface: a quiet list row that washes on hover and takes the accent wash and border when selected. */
  variant?: CardVariant | undefined;
  /** `none`, `sm` 12px, `md` 16px (default), `lg` 24px. */
  padding?: CardPadding | undefined;
  /** Hover lifts the card and the whole card is the target. Render it as `a` or `button` so it is a real control. */
  interactive?: boolean | undefined;
  /** Accent border with a 1px inset, for the active row or chosen option; on `plain`, the accent wash with a 1px accent border. Also recolours a Score inside. Visual only: pair it with `aria-pressed`, `aria-selected` or `aria-current`. */
  selected?: boolean | undefined;
  /** Element to render when `render` is not given. Use `nav` (with an `aria-label`) for a carded navigation landmark. */
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
