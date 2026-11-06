import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type FocusEvent,
  type CSSProperties,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
} from 'react';
import { ChevronDownIcon, MoreHorizontalIcon } from '../../icons/icons.gen';
import { cx } from '../../utils/cx';
import { fitCount, inlineFlags, isOverflowing } from './fit';
import { placePanel } from './place';

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
  /**
   * Called when links start or stop collapsing into "More" (also `data-overflowing` on the `nav`), so a
   * header can make room, e.g. an action button going icon-only.
   */
  onOverflowChange?: ((overflowing: boolean) => void) | undefined;
  /**
   * Room in px the row must have beyond fitting every link before it stops reporting overflow. Set it to
   * the space your header gives back on overflow (the button label's width), so the two cannot oscillate.
   * Default 0.
   */
  overflowHysteresis?: number | undefined;
}

const defaultCountLabel = (n: number) => (n === 1 ? '1 link' : `${n} links`);
const defaultLink = ({ children, ...props }: PriorityNavLinkProps) => <a {...props}>{children}</a>;
const keyOf = (item: PriorityNavItem) => item.id ?? item.href;

/** CSS anchor positioning places the panel where it exists; elsewhere `placePanel` does, from JS. */
const supportsAnchor = () =>
  typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('anchor-name: --a');
/** The Popover API puts the panel in the top layer, above every ancestor's overflow clip. */
const supportsPopover = (el: HTMLElement) => typeof el.showPopover === 'function';

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
  /** Latched overflow signal (`isOverflowing`). */
  overflowing: boolean;
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
  onOverflowChange,
  overflowHysteresis = 0,
  className,
  style,
  ...rest
}: PriorityNavProps) {
  const signature = signatureOf(items);
  const current = items.findIndex((item) => item.current);
  const [fit, setFit] = useState<Fit>({ signature: null, current: -1, count: 0, overflowing: false });
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const moreRef = useRef<HTMLLIElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLUListElement>(null);
  const measured = useRef<Measured | null>(null);
  const currentRef = useRef(current);
  const fitRef = useRef(fit);
  const hysteresisRef = useRef(overflowHysteresis);
  const onOverflowRef = useRef(onOverflowChange);

  /** The split for the cached measurements: how many links stay inline, and the latched overflow flag. */
  const solve = (m: Measured, cur: number, was: boolean) => ({
    count: fitCount({ ...m, current: cur }),
    overflowing: isOverflowing({ ...m, was, hysteresis: hysteresisRef.current }),
  });

  // Until the items are measured (on the server, before hydration, after the items or the fonts change)
  // every link renders inline in a single line that clips (or scrolls without JS), and the toggle is laid
  // out invisibly so it can be measured too.
  const measuring = fit.signature !== signature;

  // Measure once per signature, then split. Reads first (all widths, the gap, the row), then one state
  // write; React re-renders before paint, so the measuring pass is never seen.
  useLayoutEffect(() => {
    currentRef.current = current;
    fitRef.current = fit;
    hysteresisRef.current = overflowHysteresis;
    onOverflowRef.current = onOverflowChange;
  });

  useLayoutEffect(() => {
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
    setFit({ signature, current, ...solve(m, current, fit.overflowing) });
  }, [measuring, signature, current, fit]);

  // One observer, on the row and on the "More" item. Its callback reads sizes from the entries (no layout
  // read): the row's width, and the toggle's width when it switches between "More" and icon-only (a
  // container query). It writes state only when the inline count or the overflow flag changes.
  useEffect(() => {
    const list = listRef.current;
    const more = moreRef.current;
    if (!list || !more || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const m = measured.current;
      if (!m) return;
      for (const entry of entries) {
        if (entry.target === list)
          m.available = entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
        else {
          // Hidden (no overflow) reports 0; keep the last real width.
          const width = entry.borderBoxSize?.[0]?.inlineSize ?? 0;
          if (width > 0) m.more = width;
        }
      }
      // Compare before calling setState: an unchanged split must not even schedule a render.
      const prev = fitRef.current;
      if (prev.signature === null) return;
      const next = solve(m, currentRef.current, prev.overflowing);
      if (prev.count !== next.count || prev.overflowing !== next.overflowing) setFit({ ...prev, ...next });
    });
    observer.observe(list);
    observer.observe(more);
    return () => observer.disconnect();
  }, []);

  // Tell the header when the overflow flag changes (not on mount: it starts false everywhere).
  const reported = useRef(false);
  useEffect(() => {
    if (reported.current === fit.overflowing) return;
    reported.current = fit.overflowing;
    onOverflowRef.current?.(fit.overflowing);
  }, [fit.overflowing]);

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

  // The panel lives in the top layer while open (popover="manual": opening, Escape, outside clicks and
  // focus stay ours, so behaviour is the same with or without the Popover API). It stays a DOM sibling of
  // the toggle, so Tab moves from the toggle into the links with no invoker wiring.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel || !supportsPopover(panel)) return;
    // Set on the client only, where the API exists: the server HTML and browsers without it keep `hidden`.
    if (!panel.hasAttribute('popover')) panel.setAttribute('popover', 'manual');
    const shown = panel.matches(':popover-open');
    if (expanded && !shown) panel.showPopover();
    else if (!expanded && shown) panel.hidePopover();
  }, [expanded]);

  // Without CSS anchor positioning: place the panel from JS on open, and again on resize or scroll while
  // open. Each pass reads (two rects, one computed style), then writes `left`/`top` once.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const toggle = toggleRef.current;
    if (!expanded || !panel || !toggle || supportsAnchor()) return;
    const place = () => {
      const anchor = toggle.getBoundingClientRect();
      const box = panel.getBoundingClientRect();
      const css = getComputedStyle(panel);
      const { left, top } = placePanel({
        anchor,
        panel: { width: box.width, height: box.height },
        viewport: { width: document.documentElement.clientWidth, height: window.innerHeight },
        gutter: parseFloat(css.getPropertyValue('--sc-spacing-md')) || 16,
        offset: parseFloat(css.getPropertyValue('--sc-spacing-2xs')) || 4,
        rtl: css.direction === 'rtl',
      });
      panel.style.left = `${left}px`;
      panel.style.top = `${top}px`;
    };
    place();
    window.addEventListener('resize', place, { passive: true });
    window.addEventListener('scroll', place, { passive: true, capture: true });
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, { capture: true });
      panel.style.left = '';
      panel.style.top = '';
    };
  }, [expanded]);

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
    <nav
      className={cx('sc-priority-nav', className)}
      data-measuring={measuring || undefined}
      data-overflowing={fit.overflowing || undefined}
      // A per-instance anchor name, so two navs on a page never anchor to each other's toggle.
      style={{ ...style, '--_anchor': `--sc-priority-nav${panelId.replace(/[^\w-]/g, '')}` } as CSSProperties}
      {...rest}
    >
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
            {/* Narrow navs (a container query) show only the ellipsis; the label stays in the name. */}
            <MoreHorizontalIcon className="sc-priority-nav__ellipsis" />
            <span className="sc-priority-nav__toggle-label">{moreLabel}</span>
            <span className="sc-visually-hidden">, {moreCountLabel(overflow.length)}</span>
            <ChevronDownIcon size="sm" className="sc-priority-nav__chevron" />
          </button>
          <ul ref={panelRef} id={panelId} className="sc-priority-nav__panel" hidden={!expanded}>
            {overflow.map((item) => (
              <li key={keyOf(item)}>{link(item, true)}</li>
            ))}
          </ul>
        </li>
      </ul>
    </nav>
  );
}
