import type { ComponentPropsWithRef } from 'react';
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
}

export type ReasonListItemProps = ComponentPropsWithRef<'li'>;

/**
 * A list of reasons with a marker shape per tone, so the meaning is never colour alone. Name the list with a
 * heading ("Why it fits", "Watch for") and point `aria-labelledby` at it: the heading says what the marker means.
 */
function ReasonListRoot({ tone, size = 'md', divider = false, className, ...rest }: ReasonListProps) {
  return (
    <ul
      className={cx('sc-reason-list', className)}
      data-tone={tone}
      data-size={size}
      data-divider={divider || undefined}
      {...rest}
    />
  );
}

/** One reason. `<strong>` inside picks out the key words in the default text colour. */
function ReasonListItem({ className, ...rest }: ReasonListItemProps) {
  return <li className={cx('sc-reason-list__item', className)} {...rest} />;
}

export const ReasonList = Object.assign(ReasonListRoot, { Item: ReasonListItem });
