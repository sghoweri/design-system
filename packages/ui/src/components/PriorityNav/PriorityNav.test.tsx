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
let observers: Array<{ cb: ResizeObserverCallback; target: Element | null }> = [];

class FakeResizeObserver {
  private entry: { cb: ResizeObserverCallback; target: Element | null };
  constructor(cb: ResizeObserverCallback) {
    this.entry = { cb, target: null };
    observers.push(this.entry);
  }
  observe(target: Element) {
    this.entry.target = target;
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

beforeEach(() => {
  rowWidth = 1000;
  observers = [];
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
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

  it('server-renders every link inline, measuring, with the toggle hidden, and hydrates without warnings', async () => {
    const ui = <PriorityNav aria-label="Main" items={items('Inbox')} />;
    const html = renderToString(ui);
    for (const label of LABELS) expect(html).toContain(`>${label}</span></a>`);
    expect(html).toContain('data-measuring="true"');
    expect(html).toMatch(/class="sc-priority-nav__more" hidden=""/);
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
});
