import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Profiler } from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { PriorityNav, type PriorityNavItem } from './PriorityNav';
import { expectNoA11yViolations } from '../../../test/axe';

// jsdom has no layout. Each item is 8px per character + 24px; "More" is 72px; the gap is 0 (no CSS).
// Inbox 64 · Applications 120 · Sweeps 72 · Files 64 · Learning 88 · Settings 88 = 496.
const LABELS = ['Inbox', 'Applications', 'Sweeps', 'Files', 'Learning', 'Settings'];
const items = (current?: string): PriorityNavItem[] =>
  LABELS.map((label) => ({ href: `/${label.toLowerCase()}`, label, current: label === current }));

let rowWidth = 1000;
let anchorSupported = true;
let observers: Array<{ cb: ResizeObserverCallback; target: Element | null; targets: Element[] }> = [];

/** Records its targets; `resize` reports the row (the first target), `resizeMore` the "More" item. */
class FakeResizeObserver {
  private entry: { cb: ResizeObserverCallback; target: Element | null; targets: Element[] };
  constructor(cb: ResizeObserverCallback) {
    this.entry = { cb, target: null, targets: [] };
    observers.push(this.entry);
  }
  observe(target: Element) {
    this.entry.target ??= target;
    this.entry.targets.push(target);
  }
  unobserve() {}
  disconnect() {
    observers = observers.filter((o) => o !== this.entry);
  }
}

/** Resizes the row and delivers one observer callback, as the browser would. */
function resize(width: number) {
  rowWidth = width;
  act(() => {
    for (const { cb, target } of observers) {
      if (!target) continue;
      const entry = {
        target,
        contentBoxSize: [{ inlineSize: width, blockSize: 32 }],
        contentRect: { width },
      };
      cb([entry as unknown as ResizeObserverEntry], {} as ResizeObserver);
    }
  });
}

/** Reports a new width for the "More" item, as when the container query switches it to icon-only. */
function resizeMore(width: number) {
  act(() => {
    for (const { cb, targets } of observers) {
      const target = targets.find((t) => t.classList.contains('sc-priority-nav__more'));
      if (!target) continue;
      const entry = { target, borderBoxSize: [{ inlineSize: width, blockSize: 32 }] };
      cb([entry as unknown as ResizeObserverEntry], {} as ResizeObserver);
    }
  });
}

beforeEach(() => {
  rowWidth = 1000;
  observers = [];
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  // jsdom answers `true` to every CSS.supports query; behave like a browser with anchor positioning.
  anchorSupported = true;
  vi.stubGlobal('CSS', { supports: (q: string) => anchorSupported && q.includes('anchor') });
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    let width = 0;
    if (this.classList.contains('sc-priority-nav__item')) width = 8 * (this.textContent ?? '').length + 24;
    if (this.classList.contains('sc-priority-nav__more')) width = 72;
    return {
      width,
      height: 32,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: width,
      bottom: 32,
      toJSON() {},
    } as DOMRect;
  });
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
    return this.classList.contains('sc-priority-nav__list') ? rowWidth : 0;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const nav = () => screen.getByRole('navigation', { name: 'Main' });
const inlineLinks = () =>
  Array.from(nav().querySelectorAll(':scope > ul > .sc-priority-nav__item a'), (a) => a.textContent);
const toggle = () => screen.getByRole('button', { name: /^More/ });
const panel = () => document.getElementById(toggle().getAttribute('aria-controls')!)!;

describe('PriorityNav', () => {
  it('is a labelled navigation landmark with a list of links and the current page marked', async () => {
    const { container } = render(<PriorityNav aria-label="Main" items={items('Sweeps')} />);
    expect(nav()).toHaveClass('sc-priority-nav');
    expect(within(nav()).getAllByRole('listitem').length).toBeGreaterThanOrEqual(6);
    expect(screen.getByRole('link', { name: 'Sweeps' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Inbox' })).not.toHaveAttribute('aria-current');
    expect(inlineLinks()).toEqual(LABELS);
    // Everything fits: no toggle in the accessibility tree.
    expect(screen.queryByRole('button')).toBeNull();
    expect(nav()).not.toHaveAttribute('data-measuring');
    await expectNoA11yViolations(container);
  });

  it('server-renders every link inline, measuring, with the toggle and panel hidden, and hydrates without warnings', async () => {
    const ui = <PriorityNav aria-label="Main" items={items('Inbox')} />;
    const html = renderToString(ui);
    for (const label of LABELS) expect(html).toContain(`>${label}</span></a>`);
    expect(html).toContain('data-measuring="true"');
    expect(html).toMatch(/class="sc-priority-nav__more" hidden=""/);
    expect(html).toMatch(/class="sc-priority-nav__panel" hidden=""/);
    expect(html).not.toContain('popover');
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);
    rowWidth = 300;
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const root = await act(async () => hydrateRoot(container, ui));
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
    // Measured on hydration: the split happened before the browser could paint.
    expect(container.querySelector('nav')).not.toHaveAttribute('data-measuring');
    expect(container.querySelectorAll('nav > ul > .sc-priority-nav__item')).toHaveLength(2);
    act(() => root.unmount());
    container.remove();
  });

  it('collapses what does not fit into "More", announcing the count', async () => {
    rowWidth = 300;
    const { container } = render(<PriorityNav aria-label="Main" items={items()} />);
    expect(inlineLinks()).toEqual(['Inbox', 'Applications']);
    expect(toggle()).toHaveAccessibleName('More, 4 links');
    expect(toggle()).toHaveTextContent(/^More, 4 links$/);
    expect(toggle().querySelector('.sc-visually-hidden')).toHaveTextContent(', 4 links');
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
    expect(panel()).not.toBeVisible();
    expect(screen.queryByRole('link', { name: 'Sweeps' })).toBeNull();
    await expectNoA11yViolations(container);
  });

  it('opens with Enter, tabs naturally into the panel, and Escape closes and returns focus', async () => {
    const user = userEvent.setup();
    rowWidth = 300;
    render(<PriorityNav aria-label="Main" items={items()} />);
    await user.tab();
    expect(screen.getByRole('link', { name: 'Inbox' })).toHaveFocus();
    await user.tab();
    await user.tab();
    expect(toggle()).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(toggle()).toHaveAttribute('aria-expanded', 'true');
    expect(panel()).toBeVisible();
    expect(
      within(panel())
        .getAllByRole('link')
        .map((a) => a.textContent),
    ).toEqual(['Sweeps', 'Files', 'Learning', 'Settings']);
    await user.tab();
    expect(screen.getByRole('link', { name: 'Sweeps' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
    expect(toggle()).toHaveFocus();
    // Space toggles too.
    await user.keyboard(' ');
    expect(toggle()).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard(' ');
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes when focus leaves the panel, on a click outside, and after choosing a link', async () => {
    const user = userEvent.setup();
    rowWidth = 300;
    render(
      <>
        <PriorityNav aria-label="Main" items={items()} />
        <button type="button">After</button>
      </>,
    );
    await user.click(toggle());
    expect(toggle()).toHaveAttribute('aria-expanded', 'true');
    await user.tab(); // Sweeps
    await user.tab(); // Files
    await user.tab(); // Learning
    await user.tab(); // Settings
    await user.tab(); // out
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle());
    await user.click(document.body);
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle());
    const files = screen.getByRole('link', { name: 'Files' });
    files.addEventListener('click', (e) => e.preventDefault());
    await user.click(files);
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps the current page inline when it would overflow, swapping out the last non-current link', () => {
    rowWidth = 300;
    render(<PriorityNav aria-label="Main" items={items('Settings')} />);
    // Without a current page the row is Inbox, Applications; Settings takes Applications' place.
    expect(inlineLinks()).toEqual(['Inbox', 'Settings']);
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('aria-current', 'page');
    expect(toggle()).toHaveAccessibleName('More, 4 links');
    // At phone width everything but the current page collapses.
    resize(170);
    expect(inlineLinks()).toEqual(['Settings']);
    expect(toggle()).toHaveAccessibleName('More, 5 links');
  });

  it('follows the current page when it changes, without measuring again', () => {
    rowWidth = 300;
    const { rerender } = render(<PriorityNav aria-label="Main" items={items('Inbox')} />);
    expect(inlineLinks()).toEqual(['Inbox', 'Applications']);
    const measure = vi.mocked(HTMLElement.prototype.getBoundingClientRect);
    measure.mockClear();
    rerender(<PriorityNav aria-label="Main" items={items('Learning')} />);
    expect(inlineLinks()).toEqual(['Inbox', 'Learning']);
    expect(measure).not.toHaveBeenCalled();
  });

  it('re-renders only when the number of inline links changes, and grows back', () => {
    rowWidth = 300;
    const onRender = vi.fn();
    render(
      <Profiler id="nav" onRender={onRender}>
        <PriorityNav aria-label="Main" items={items()} />
      </Profiler>,
    );
    onRender.mockClear();
    resize(310);
    resize(320);
    expect(onRender).not.toHaveBeenCalled();
    resize(330);
    expect(onRender).toHaveBeenCalledTimes(1);
    expect(inlineLinks()).toEqual(['Inbox', 'Applications', 'Sweeps']);
    resize(496);
    expect(inlineLinks()).toEqual(LABELS);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('measures again when the items change, and renders links through renderLink', () => {
    rowWidth = 300;
    const { rerender } = render(<PriorityNav aria-label="Main" items={items()} />);
    expect(inlineLinks()).toEqual(['Inbox', 'Applications']);
    const shorter = items().map((item) =>
      item.label === 'Applications' ? { ...item, label: 'Apps' } : item,
    );
    rerender(
      <PriorityNav
        aria-label="Main"
        items={shorter}
        moreLabel="Plus"
        moreCountLabel={(n) => `${n} autres`}
        renderLink={({ children, ...props }) => (
          <a {...props} data-router="yes">
            {children}
          </a>
        )}
      />,
    );
    // 72 + 64 + 56 + 72 = 264, + 64 = 328 > 300.
    expect(inlineLinks()).toEqual(['Inbox', 'Apps', 'Sweeps']);
    expect(screen.getByRole('button', { name: 'Plus, 3 autres' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Inbox' })).toHaveAttribute('data-router', 'yes');
  });

  it('puts the open panel in the top layer with the Popover API, keeping the disclosure semantics', async () => {
    const user = userEvent.setup();
    const open = new Set<Element>();
    const show = vi.fn(function (this: HTMLElement) {
      open.add(this);
    });
    const hide = vi.fn(function (this: HTMLElement) {
      open.delete(this);
    });
    Object.assign(HTMLElement.prototype, { showPopover: show, hidePopover: hide });
    const matches = Element.prototype.matches;
    vi.spyOn(Element.prototype, 'matches').mockImplementation(function (this: Element, selector: string) {
      return selector === ':popover-open' ? open.has(this) : matches.call(this, selector);
    });
    try {
      rowWidth = 300;
      render(<PriorityNav aria-label="Main" items={items()} />);
      expect(panel()).not.toHaveAttribute('role');
      await user.click(toggle());
      expect(panel()).toHaveAttribute('popover', 'manual');
      expect(show).toHaveBeenCalledTimes(1);
      expect(open.has(panel())).toBe(true);
      expect(toggle()).toHaveAttribute('aria-expanded', 'true');
      // The panel stays the toggle's next sibling in the DOM, so Tab goes from the toggle into its links
      // (jsdom hides any [popover], so the Tab itself is covered by the tests without the API).
      expect(toggle().nextElementSibling).toBe(panel());
      expect(toggle()).toHaveFocus();
      await user.keyboard('{Escape}');
      expect(hide).toHaveBeenCalledTimes(1);
      expect(open.size).toBe(0);
      expect(toggle()).toHaveFocus();
      await user.click(toggle());
      await user.click(document.body);
      expect(hide).toHaveBeenCalledTimes(2);
      expect(toggle()).toHaveAttribute('aria-expanded', 'false');
    } finally {
      delete (HTMLElement.prototype as Partial<HTMLElement>).showPopover;
      delete (HTMLElement.prototype as Partial<HTMLElement>).hidePopover;
    }
  });

  it('gives each instance its own anchor name', () => {
    rowWidth = 300;
    render(
      <>
        <PriorityNav aria-label="Main" items={items()} />
        <PriorityNav aria-label="Sections" items={items()} />
      </>,
    );
    const names = screen.getAllByRole('navigation').map((nav) => nav.style.getPropertyValue('--_anchor'));
    expect(names[0]).toMatch(/^--sc-priority-nav[\w-]+$/);
    expect(names[1]).toMatch(/^--sc-priority-nav[\w-]+$/);
    expect(names[0]).not.toBe(names[1]);
  });

  it('without CSS anchor positioning, places the panel from JS while open and on resize', async () => {
    const user = userEvent.setup();
    anchorSupported = false;
    rowWidth = 300;
    render(<PriorityNav aria-label="Main" items={items()} />);
    await user.click(toggle());
    // The toggle's stubbed rect is 0×32 at the origin; the gutter and offset fall back to 16 and 4.
    expect(panel().style.left).toBe('16px');
    expect(panel().style.top).toBe('36px');
    const rect = vi.mocked(HTMLElement.prototype.getBoundingClientRect);
    rect.mockClear();
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    // One pass: the toggle's rect and the panel's rect, nothing else.
    expect(rect).toHaveBeenCalledTimes(2);
    await user.keyboard('{Escape}');
    expect(panel().style.left).toBe('');
    expect(panel().style.top).toBe('');
  });

  it('reports overflow with data-overflowing and onOverflowChange, with hysteresis', () => {
    const onOverflowChange = vi.fn();
    render(
      <PriorityNav
        aria-label="Main"
        items={items()}
        onOverflowChange={onOverflowChange}
        overflowHysteresis={80}
      />,
    );
    expect(nav()).not.toHaveAttribute('data-overflowing');
    expect(onOverflowChange).not.toHaveBeenCalled();
    resize(400);
    expect(nav()).toHaveAttribute('data-overflowing', 'true');
    expect(onOverflowChange).toHaveBeenLastCalledWith(true);
    // The header made room: all 496px of links fit in 520, but not with 80 to spare, so the flag holds.
    resize(520);
    expect(inlineLinks()).toEqual(LABELS);
    expect(nav()).toHaveAttribute('data-overflowing', 'true');
    expect(onOverflowChange).toHaveBeenCalledTimes(1);
    // Every link plus 80px to spare: the flag clears.
    resize(576);
    expect(nav()).not.toHaveAttribute('data-overflowing');
    expect(onOverflowChange).toHaveBeenLastCalledWith(false);
    expect(onOverflowChange).toHaveBeenCalledTimes(2);
  });

  it('uses the toggle’s current width: an icon-only More frees room for a link', () => {
    rowWidth = 300;
    render(<PriorityNav aria-label="Main" items={items()} />);
    // 72 (More) + 64 + 120 = 256; + 72 = 328 > 300.
    expect(inlineLinks()).toEqual(['Inbox', 'Applications']);
    // Icon-only More is 32 wide: 32 + 64 + 120 + 72 = 288 fits.
    resizeMore(32);
    expect(inlineLinks()).toEqual(['Inbox', 'Applications', 'Sweeps']);
    expect(toggle()).toHaveAccessibleName('More, 3 links');
    expect(toggle().querySelector('.sc-priority-nav__toggle-label')).toHaveTextContent('More');
    expect(toggle().querySelector('.sc-priority-nav__ellipsis')).toHaveAttribute('aria-hidden', 'true');
    // Hidden (0) reports are ignored.
    resizeMore(0);
    expect(inlineLinks()).toEqual(['Inbox', 'Applications', 'Sweeps']);
  });
});
