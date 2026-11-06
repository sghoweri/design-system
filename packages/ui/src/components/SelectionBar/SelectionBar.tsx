import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Button } from '../Button/Button';
import { Toolbar } from '../Toolbar/Toolbar';
import { cx } from '../../utils/cx';

export interface SelectionBarProps {
  /** How many rows are selected. The bar shows from 1 and leaves at 0. */
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
  className?: string | undefined;
}

const defaultCountLabel = (count: number) => `${count} selected`;
/** Matches `--sc-duration-base` in selection-bar.css: the bar stays mounted this long to fade out. */
const LEAVE_MS = 200;

/**
 * A floating bar for bulk actions on selected rows, centred at the bottom of the viewport: the count, the actions
 * and Clear, as one Toolbar (one tab stop, arrow keys inside). A polite status region announces the count as it
 * changes. Put it after the table, at the end of the scrolling content: while it shows, it leaves a spacer as
 * tall as itself there, so the last rows can scroll clear of it. When it leaves while holding focus (an action
 * cleared the selection), focus goes back to where it came from, usually the last row checkbox.
 */
export function SelectionBar({
  count,
  onClear,
  children,
  'aria-label': ariaLabel = 'Bulk actions',
  countLabel = defaultCountLabel,
  clearLabel = 'Clear',
  clearedMessage = 'Selection cleared',
  className,
}: SelectionBarProps) {
  const open = count > 0;
  // Nothing is announced on load; "cleared" only after there was a selection.
  const [hadSelection, setHadSelection] = useState(open);
  if (open && !hadSelection) setHadSelection(true);
  const message = open ? countLabel(count) : hadSelection ? clearedMessage : '';

  // Stay mounted for the fade-out, still showing the last count.
  const [rendered, setRendered] = useState(open);
  const [shownCount, setShownCount] = useState(count);
  if (open && !rendered) setRendered(true);
  if (open && shownCount !== count) setShownCount(count);
  useEffect(() => {
    if (open || !rendered) return;
    const timer = setTimeout(() => setRendered(false), LEAVE_MS);
    return () => clearTimeout(timer);
  }, [open, rendered]);

  const barRef = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const bar = barRef.current;
    if (open || !bar?.contains(bar.ownerDocument.activeElement)) return;
    if (returnTo.current?.isConnected) returnTo.current.focus();
  }, [open]);

  // The spacer follows the bar's height (it wraps on narrow screens).
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const bar = barRef.current;
    if (!rendered || !bar || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => setHeight(entry!.borderBoxSize[0]?.blockSize ?? 0));
    observer.observe(bar);
    return () => observer.disconnect();
  }, [rendered]);

  return (
    <>
      <span role="status" className="sc-visually-hidden">
        {message}
      </span>
      {rendered ? (
        <>
          {open ? (
            <div
              className="sc-selection-bar__spacer"
              style={{ '--sc-selection-bar-height': `${height}px` } as CSSProperties}
              aria-hidden="true"
            />
          ) : null}
          <div
            ref={barRef}
            className={cx('sc-selection-bar', className)}
            data-open={open || undefined}
            onFocus={(event) => {
              const from = event.relatedTarget;
              if (from instanceof HTMLElement && !event.currentTarget.contains(from)) returnTo.current = from;
            }}
          >
            <Toolbar.Root aria-label={ariaLabel} className="sc-selection-bar__toolbar">
              <span className="sc-selection-bar__count">{countLabel(shownCount)}</span>
              <Toolbar.Separator />
              {children}
              <Toolbar.Spacer />
              <Toolbar.Button render={<Button variant="ghost" size="sm" />} onClick={onClear}>
                {clearLabel}
              </Toolbar.Button>
            </Toolbar.Root>
          </div>
        </>
      ) : null}
    </>
  );
}
