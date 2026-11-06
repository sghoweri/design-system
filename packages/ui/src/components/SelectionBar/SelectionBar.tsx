import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '../Button/Button';
import { Toolbar } from '../Toolbar/Toolbar';
import { cx } from '../../utils/cx';

export interface SelectionBarProps {
  /** How many rows are selected. The bar shows from 1 and hides at 0. */
  count: number;
  /** Clears the selection (the Clear button). */
  onClear: () => void;
  /** The actions, each a `Toolbar.Button`: `<Toolbar.Button render={<Button size="sm" variant="secondary" />}>Close 3</Toolbar.Button>`. */
  children?: ReactNode | undefined;
  /** Names the toolbar. Default "Bulk actions". */
  'aria-label'?: string | undefined;
  /** The count text, visible and announced. Default `${count} selected`. */
  countLabel?: ((count: number) => string) | undefined;
  /** Default "Clear". */
  clearLabel?: string | undefined;
  /** Announced when the selection goes back to none. Default "Selection cleared". */
  clearedMessage?: string | undefined;
  /** The edge it sticks to inside the scrolling container. Default `bottom`. */
  side?: 'top' | 'bottom' | undefined;
  className?: string | undefined;
}

const defaultCountLabel = (count: number) => `${count} selected`;

/**
 * A sticky bar for bulk actions on selected rows: the count, the actions and Clear, as one Toolbar (one tab
 * stop, arrow keys inside). A polite status region announces the count as it changes. When the bar hides
 * (an action cleared the selection) while it holds focus, focus goes back to where it came from, usually the
 * last row checkbox.
 */
export function SelectionBar({
  count,
  onClear,
  children,
  'aria-label': ariaLabel = 'Bulk actions',
  countLabel = defaultCountLabel,
  clearLabel = 'Clear',
  clearedMessage = 'Selection cleared',
  side = 'bottom',
  className,
}: SelectionBarProps) {
  // Nothing is announced on load; "cleared" only after there was a selection.
  const [hadSelection, setHadSelection] = useState(count > 0);
  if (count > 0 && !hadSelection) setHadSelection(true);
  const message = count > 0 ? countLabel(count) : hadSelection ? clearedMessage : '';

  // Focus return: remember where focus came from when it entered the bar, and whether the bar held focus at
  // the moment it was removed (a ref cleanup runs before React takes the node out of the document).
  const returnTo = useRef<HTMLElement | null>(null);
  const hadFocus = useRef(false);
  const barRef = useCallback((node: HTMLDivElement | null) => {
    return () => {
      hadFocus.current = node?.contains(node.ownerDocument.activeElement) ?? false;
    };
  }, []);
  useEffect(() => {
    if (count > 0 || !hadFocus.current) return;
    hadFocus.current = false;
    if (returnTo.current?.isConnected) returnTo.current.focus();
  }, [count]);

  return (
    <>
      <span role="status" className="sc-visually-hidden">
        {message}
      </span>
      {count > 0 ? (
        <div
          className={cx('sc-selection-bar', className)}
          data-side={side}
          ref={barRef}
          onFocus={(event) => {
            const from = event.relatedTarget;
            if (from instanceof HTMLElement && !event.currentTarget.contains(from)) returnTo.current = from;
          }}
        >
          <Toolbar.Root aria-label={ariaLabel} className="sc-selection-bar__toolbar">
            <span className="sc-selection-bar__count">{countLabel(count)}</span>
            <Toolbar.Separator />
            {children}
            <Toolbar.Spacer />
            <Toolbar.Button render={<Button variant="ghost" size="sm" />} onClick={onClear}>
              {clearLabel}
            </Toolbar.Button>
          </Toolbar.Root>
        </div>
      ) : null}
    </>
  );
}
