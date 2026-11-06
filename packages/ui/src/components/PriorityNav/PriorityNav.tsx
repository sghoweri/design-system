import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type FocusEvent,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
} from 'react';
import { ChevronDownIcon } from '../../icons/icons.gen';
import { cx } from '../../utils/cx';
import { fitCount, inlineFlags } from './fit';

export interface PriorityNavItem {
  /** Where the link goes. */
  href: string;
  /** The visible text. A string (or number) is part of the width cache key; see `PriorityNav`. */
  label: ReactNode;
  /** A stable key. Defaults to `href`. */
  id?: string | undefined;
  /** The page being shown: `aria-current="page"`, and the link never collapses into "More". */
  current?: boolean | undefined;
}

/** What `renderLink` receives: spread it onto your link component. */
export interface PriorityNavLinkProps {
  href: string;
  className: string;
  'aria-current': 'page' | undefined;
  onClick: MouseEventHandler<HTMLAnchorElement> | undefined;
  children: ReactNode;
}

export interface PriorityNavProps extends Omit<ComponentPropsWithRef<'nav'>, 'children'> {
  /** Names the landmark: "Main". */
  'aria-label': string;
  /** The links, in priority order: the first ones stay inline longest. */
  items: readonly PriorityNavItem[];
  /** Visible text of the overflow toggle. Default "More". */
  moreLabel?: string | undefined;
  /** Appended to the toggle's accessible name only: "More, 3 links". Default `n link(s)`. */
  moreCountLabel?: ((hidden: number) => string) | undefined;
  /** Renders each link. Default a plain `<a>`; pass a router link: `(props) => <Link {...props} />`. */
  renderLink?: ((props: PriorityNavLinkProps, item: PriorityNavItem) => ReactElement) | undefined;
}

const defaultCountLabel = (n: number) => (n === 1 ? '1 link' : `${n} links`);
const defaultLink = ({ children, ...props }: PriorityNavLinkProps) => <a {...props}>{children}</a>;
const keyOf = (item: PriorityNavItem) => item.id ?? item.href;

/** Widths are re-measured when this changes: the keys and any string labels, in order. */
function signatureOf(items: readonly PriorityNavItem[]): string {
  return items
    .map((item) => {
      const text = typeof item.label === 'string' || typeof item.label === 'number' ? item.label : '';
      return `${keyOf(item)}\u0001${text}`;
    })
    .join('\u0002');
}

interface Fit {
  /** The item signature these numbers were measured for; `null` until the first measurement. */
  signature: string | null;
  /** The current index `count` was computed with. */
  current: number;
  /** How many non-current items are inline (`fitCount`). */
  count: number;
}

interface Measured {
  widths: number[];
  more: number;
  gap: number;
  available: number;
}

/**
 * Priority+ navigation: a row of primary links that keeps the ones that fit inline and collapses the rest
 * into a "More" disclosure at the end of the row. The current page is never collapsed. Follows the
 * WAI-ARIA APG disclosure navigation pattern (links in a list, a real button with `aria-expanded`), not
 * `role="menu"`. Server-renders every link inline, so it works before hydration and without JavaScript;
 * see docs/adr/0005-priority-nav.md.
 */
export function PriorityNav({
  items,
  moreLabel = 'More',
  moreCountLabel = defaultCountLabel,
  renderLink = defaultLink,
  className,
  ...rest
}: PriorityNavProps) {
  const signature = signatureOf(items);
  const current = items.findIndex((item) => item.current);
  const [fit, setFit] = useState<Fit>({ signature: null, current: -1, count: 0 });
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const moreRef = useRef<HTMLLIElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const measured = useRef<Measured | null>(null);
  const currentRef = useRef(current);
  const fitRef = useRef(fit);

  // Until the items are measured (on the server, before hydration, after the items or the fonts change)
  // every link renders inline in a single line that clips (or scrolls without JS), and the toggle is laid
  // out invisibly so it can be measured too.
  const measuring = fit.signature !== signature;

  // Measure once per signature, then split. Reads first (all widths, the gap, the row), then one state
  // write; React re-renders before paint, so the measuring pass is never seen.
  useLayoutEffect(() => {
    currentRef.current = current;
    fitRef.current = fit;
    const list = listRef.current;
    const more = moreRef.current;
    if (!list || !more) return;
    if (measuring) {
      const widths = Array.from(
        list.querySelectorAll<HTMLElement>(':scope > .sc-priority-nav__item'),
        (el) => el.getBoundingClientRect().width,
      );
      measured.current = {
        widths,
        more: more.getBoundingClientRect().width,
        gap: parseFloat(getComputedStyle(list).columnGap) || 0,
        available: list.clientWidth,
      };
    } else if (fit.current === current) return;
    const m = measured.current;
    if (!m) return;
    setFit({ signature, current, count: fitCount({ ...m, current }) });
  }, [measuring, signature, current, fit]);

  // One observer on the row. Its callback reads the size from the entry (no layout read) and writes state
  // only when the number of inline links changes.
  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[entries.length - 1];
      const m = measured.current;
      if (!entry || !m) return;
      m.available = entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
      const count = fitCount({ ...m, current: currentRef.current });
      // Compare before calling setState: an unchanged count must not even schedule a render.
      const prev = fitRef.current;
      if (prev.signature !== null && prev.count !== count) setFit({ ...prev, count });
    });
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  // Web fonts change every width. If they are still loading at mount, measure again once they are ready.
  useEffect(() => {
    const fonts = typeof document === 'undefined' ? undefined : document.fonts;
    if (!fonts || fonts.status === 'loaded') return;
    let live = true;
    void fonts.ready.then(() => {
      if (live) setFit((prev) => ({ ...prev, signature: null }));
    });
    return () => {
      live = false;
    };
  }, []);

  const flags = measuring ? null : inlineFlags(items.length, current, fit.count);
  const overflow = flags ? items.filter((_, i) => !flags[i]) : [];
  const expanded = open && overflow.length > 0;

  // Click outside and Escape close the panel. Escape returns focus to the toggle.
  useEffect(() => {
    if (!expanded) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!moreRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const active = document.activeElement;
      setOpen(false);
      if (!active || active === document.body || moreRef.current?.contains(active))
        toggleRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [expanded]);

  // Focus leaving the "More" item (Tab past the last link) closes the panel, as in the APG example.
  const onBlur = (event: FocusEvent<HTMLLIElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
  };

  const link = (item: PriorityNavItem, inPanel: boolean) =>
    renderLink(
      {
        href: item.href,
        className: 'sc-priority-nav__link',
        'aria-current': item.current ? 'page' : undefined,
        onClick: inPanel ? () => setOpen(false) : undefined,
        children: <span className="sc-priority-nav__label">{item.label}</span>,
      },
      item,
    );

  return (
    <nav className={cx('sc-priority-nav', className)} data-measuring={measuring || undefined} {...rest}>
      <ul ref={listRef} className="sc-priority-nav__list">
        {items.map((item, i) =>
          flags && !flags[i] ? null : (
            <li key={keyOf(item)} className="sc-priority-nav__item" data-current={item.current || undefined}>
              {link(item, false)}
            </li>
          ),
        )}
        <li
          ref={moreRef}
          className="sc-priority-nav__more"
          hidden={measuring || overflow.length === 0}
          onBlur={onBlur}
        >
          <button
            ref={toggleRef}
            type="button"
            className="sc-priority-nav__toggle"
            aria-expanded={expanded}
            aria-controls={panelId}
            onClick={() => setOpen((o) => !o)}
          >
            {moreLabel}
            <span className="sc-visually-hidden">, {moreCountLabel(overflow.length)}</span>
            <ChevronDownIcon size="sm" className="sc-priority-nav__chevron" />
          </button>
          <ul id={panelId} className="sc-priority-nav__panel" hidden={!expanded}>
            {overflow.map((item) => (
              <li key={keyOf(item)}>{link(item, true)}</li>
            ))}
          </ul>
        </li>
      </ul>
    </nav>
  );
}
