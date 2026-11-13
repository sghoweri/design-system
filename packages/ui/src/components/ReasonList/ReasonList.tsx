import {
  Children,
  Fragment,
  isValidElement,
  type ComponentPropsWithoutRef,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react';
import { CircleCheckIcon } from '../../icons/icons.gen';
import { cx } from '../../utils/cx';

export type ReasonTone = 'for' | 'against' | 'gap';
export type ReasonListSize = 'sm' | 'md';

export interface ReasonListProps extends ComponentPropsWithRef<'ul'> {
  /** What every item in the list is: `for` (a filled square), `against` (a bar) or `gap` (a hollow circle). Shape and colour both carry it. */
  tone: ReasonTone;
  /** `md` 14px (default) for a detail view, `sm` 12px for the compact form inside a card. */
  size?: ReasonListSize | undefined;
  /** A dashed rule above the list, for the compact form under a card's title. */
  divider?: boolean | undefined;
  /**
   * What to say when the list has no items: "No cons flagged." Rendered as one muted `<p>` in place of the `<ul>`,
   * so a screen reader hears the heading and then the sentence, not an empty list. The list's `aria-labelledby`,
   * `aria-label` and `ref` are not carried over, so the sentence must say what is missing on its own. Without
   * `empty`, an empty list renders an empty `<ul>` as before.
   */
  empty?: ReactNode | undefined;
  /**
   * A decorative icon before the `empty` line. Defaults by tone: a check for `against` and `gap` (nothing against is
   * good news), none for `for`. `null` drops it.
   */
  emptyIcon?: ReactNode | undefined;
}

export type ReasonListItemProps = ComponentPropsWithRef<'li'>;

/** True when `children` holds anything to render, looking inside fragments; `false`, `null` and `''` don't count. */
function hasItems(children: ReactNode): boolean {
  return Children.toArray(children).some((child) =>
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
      ? hasItems(child.props.children)
      : child !== '',
  );
}

/**
 * A list of reasons with a marker shape per tone, so the meaning is never colour alone. Name the list with a
 * heading ("Why it fits", "Watch for") and point `aria-labelledby` at it: the heading says what the marker means.
 */
function ReasonListRoot({
  tone,
  size = 'md',
  divider = false,
  empty,
  emptyIcon,
  className,
  children,
  ...rest
}: ReasonListProps) {
  if (empty != null && !hasItems(children)) {
    // A name on a <p> is prohibited (ARIA paragraph role); the heading that named the list is read just before.
    // The rest (id, style, data-*, handlers) carries over; handlers typed for the <ul> run on the <p>.
    const { ref: _ref, 'aria-label': _label, 'aria-labelledby': _labelledBy, ...other } = rest;
    const p = other as ComponentPropsWithoutRef<'p'>;
    const icon = emptyIcon === undefined ? tone === 'for' ? null : <CircleCheckIcon size="em" /> : emptyIcon;
    return (
      <p
        className={cx('sc-reason-list__empty', className)}
        data-tone={tone}
        data-size={size}
        data-divider={divider || undefined}
        {...p}
      >
        {icon ? (
          <span className="sc-reason-list__empty-icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        {/* One flex item, so inline markup in `empty` stays in one run of text. */}
        <span>{empty}</span>
      </p>
    );
  }
  return (
    <ul
      className={cx('sc-reason-list', className)}
      data-tone={tone}
      data-size={size}
      data-divider={divider || undefined}
      {...rest}
    >
      {children}
    </ul>
  );
}

/** One reason. `<strong>` inside picks out the key words in the default text colour. */
function ReasonListItem({ className, ...rest }: ReasonListItemProps) {
  return <li className={cx('sc-reason-list__item', className)} {...rest} />;
}

export const ReasonList = Object.assign(ReasonListRoot, { Item: ReasonListItem });
