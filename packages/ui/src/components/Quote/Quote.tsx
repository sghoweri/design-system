import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../../utils/cx';

export interface QuoteProps extends ComponentPropsWithRef<'figure'> {
  /** Who said it, shown as a small overline before the words: "You". */
  label: ReactNode;
  /** The quoted words. Phrasing content: the quote renders inline after the label. */
  children: ReactNode;
}

/**
 * Someone's own words echoed back on the accent wash, with who said them: the instruction you gave above the
 * rewrite it produced. A `<figure>` whose `<figcaption>` is the label and whose `<blockquote>` is the text, so the
 * attribution is part of the semantics, not just the styling.
 */
export function Quote({ label, className, children, ...rest }: QuoteProps) {
  return (
    <figure className={cx('sc-quote', className)} {...rest}>
      <figcaption className="sc-quote__label">{label}</figcaption>
      <blockquote className="sc-quote__text">{children}</blockquote>
    </figure>
  );
}
