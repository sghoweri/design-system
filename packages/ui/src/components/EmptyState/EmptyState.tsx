import { createElement, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cx } from '../../utils/cx';

export type EmptyStateSize = 'sm' | 'md';
export type EmptyStateElement = 'div' | 'section' | 'li';

export interface EmptyStateProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  /** Required. What is empty, as a short statement: "No applications yet". */
  title: ReactNode;
  /** One sentence on why, or what to do: "Postings you apply to show up here." */
  description?: ReactNode | undefined;
  /** A 24px icon in a muted circle above the title. Decorative. */
  icon?: ReactNode | undefined;
  /** The actions, usually one primary Button and at most one secondary. Rendered in an Inline. */
  children?: ReactNode | undefined;
  /** `md` (default) for a whole view or panel, `sm` inside a Card or a table body. */
  size?: EmptyStateSize | undefined;
  /** Element to render. Default `div`. */
  as?: EmptyStateElement | undefined;
}

/**
 * Centred placeholder for a view with nothing in it: an icon, a title, a sentence and the action that
 * fills it. Say what is missing and the next step; never apologise.
 */
export function EmptyState({
  title,
  description,
  icon,
  children,
  size = 'md',
  as = 'div',
  className,
  ...rest
}: EmptyStateProps) {
  return createElement(
    as,
    { className: cx('sc-empty-state', className), 'data-size': size, ...rest },
    icon ? (
      <span className="sc-empty-state__icon" aria-hidden="true">
        {icon}
      </span>
    ) : null,
    <p className="sc-empty-state__title">{title}</p>,
    description != null ? <p className="sc-empty-state__description">{description}</p> : null,
    children != null ? <div className="sc-empty-state__actions">{children}</div> : null,
  );
}
