import { createElement, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cx } from '../../utils/cx';

export type CalloutTone = 'accent' | 'neutral' | 'info' | 'success' | 'warning' | 'danger';
export type CalloutVariant = 'solid' | 'dashed';

export interface CalloutProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  /** Colour of the wash and border. Default `accent`: something to look at and decide on. */
  tone?: CalloutTone | undefined;
  /** `solid` (default) border, or `dashed` for something not yet real (a suggestion, a draft). */
  variant?: CalloutVariant | undefined;
  /** Short line above the body. */
  title?: ReactNode | undefined;
  /** Renders the title as `<h2>`–`<h6>` when it heads a section of the page; otherwise it is a paragraph. */
  headingLevel?: 2 | 3 | 4 | 5 | 6 | undefined;
  /** Buttons at the end, usually one primary and one ghost. Rendered in a wrapping row. */
  actions?: ReactNode | undefined;
}

/**
 * A block that asks for attention without interrupting: a proposal to accept, a suggestion to review. Unlike Banner
 * it has no live-region role, so nothing is announced on render; pass `role` yourself if it must be. A danger
 * Callout is still just a block: a pending suggestion that something failed has not happened yet.
 */
export function Callout({
  tone = 'accent',
  variant = 'solid',
  title,
  headingLevel,
  actions,
  className,
  children,
  ...rest
}: CalloutProps) {
  return (
    <div className={cx('sc-callout', className)} data-tone={tone} data-variant={variant} {...rest}>
      {title != null
        ? createElement(headingLevel ? `h${headingLevel}` : 'p', { className: 'sc-callout__title' }, title)
        : null}
      {children != null ? <div className="sc-callout__body">{children}</div> : null}
      {actions != null ? <div className="sc-callout__actions">{actions}</div> : null}
    </div>
  );
}
