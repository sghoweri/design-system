import {
  Children,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { Dialog } from '../Dialog/Dialog';
import { IconButton } from '../IconButton/IconButton';
import { CheckIcon, XIcon } from '../../icons/icons.gen';
import { cx } from '../../utils/cx';

/** Which way the flow moved: `forward` slides the new step in from the inline end, `back` from the start. */
export type FlowDirection = 'forward' | 'back';
/** Why the flow asked to close: Esc, or the × in the header. */
export type FlowCloseRequestReason = 'escape-key' | 'close-press';

interface FlowContextValue {
  announce: (message: string) => void;
}
const FlowContext = createContext<FlowContextValue>({ announce: () => {} });

type FramePhase = 'enter' | 'exit' | undefined;
const FrameContext = createContext<FramePhase>(undefined);

/** Enter continues unless focus is somewhere Enter already means something. */
const ENTER_IGNORES =
  'textarea, button, a[href], summary, select, [contenteditable], [role="combobox"], [data-flow-keys="local"]';
/** The arrow keys move between steps only when focus is not in a control that uses them. */
const ARROW_IGNORES =
  'input, textarea, select, button, a[href], summary, [contenteditable], [role="radiogroup"], [role="slider"], [role="listbox"], [role="tablist"], [role="menu"], [role="grid"], [role="combobox"], [data-flow-keys="local"]';

export interface FullScreenFlowRootProps {
  /** Whether the flow is showing. Default `true`, for a flow that lives on its own route. */
  open?: boolean | undefined;
  /**
   * Esc and the header's × call this instead of closing. Show a leave confirmation (a nested `Dialog`),
   * then close by setting `open` to `false` or by navigating away. A press on the backdrop does nothing.
   */
  onRequestClose: (reason: FlowCloseRequestReason) => void;
  /** Enter (outside buttons, links, textareas and `[data-flow-keys="local"]`) and the forward arrow key call this. */
  onNext?: (() => void) | undefined;
  /** The back arrow key (outside form controls) calls this. */
  onBack?: (() => void) | undefined;
  /** A decorative layer behind everything, such as an illustration. Hidden from assistive tech. */
  decoration?: ReactNode | undefined;
  className?: string | undefined;
  /** `Header`, `Body` and `Footer`, in that order. */
  children?: ReactNode | undefined;
}

/**
 * A full-screen modal for a multi-step task, on `Dialog variant="fullscreen"`: focus is trapped, the page
 * behind is inert, and Esc goes to `onRequestClose`. Holds the polite live region that `Step` announces into.
 */
function Root({
  open = true,
  onRequestClose,
  onNext,
  onBack,
  decoration,
  className,
  children,
}: FullScreenFlowRootProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Clear first, then set after a beat, so the same words twice in a row are read twice.
  const announce = useCallback((next: string) => {
    setMessage('');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(next), 30);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  const context = useMemo(() => ({ announce }), [announce]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    if (event.nativeEvent.isComposing) return;
    const target = event.target as Element;
    // A nested dialog or popup is portalled out of the popup; its keys are its own.
    if (!event.currentTarget.contains(target)) return;
    if (event.key === 'Enter') {
      if (!onNext || target.closest(ENTER_IGNORES)) return;
      event.preventDefault();
      onNext();
      return;
    }
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    if (target.closest(ARROW_IGNORES)) return;
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const forward = (event.key === 'ArrowRight') !== rtl;
    const handler = forward ? onNext : onBack;
    if (!handler) return;
    event.preventDefault();
    handler();
  };

  return (
    <Dialog.Root
      open={open}
      onRequestClose={(reason) => {
        if (reason !== 'outside-press') onRequestClose(reason);
      }}
    >
      <Dialog.Content
        ref={popupRef}
        variant="fullscreen"
        className={cx('sc-flow', className)}
        initialFocus={() => popupRef.current?.querySelector<HTMLElement>('.sc-flow__step-title') ?? true}
        onKeyDown={handleKeyDown}
      >
        <FlowContext.Provider value={context}>
          {decoration ? (
            <div className="sc-flow__decoration" aria-hidden="true">
              {decoration}
            </div>
          ) : null}
          {children}
          <div className="sc-visually-hidden" aria-live="polite" aria-atomic="true">
            {message}
          </div>
        </FlowContext.Provider>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export interface FullScreenFlowHeaderProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  /** The flow's name ("Set up your search"). Labels the dialog. */
  title: ReactNode;
  /** A small mark before the title. Decorative. */
  logo?: ReactNode | undefined;
  /** Shown instead of `title` below 760px, where the progress drops to its own row: "4 of 10 · Roles". */
  compactTitle?: ReactNode | undefined;
  /** A status after the progress, such as a "Saved" tick. */
  status?: ReactNode | undefined;
  /** Name of the × button, which calls `onRequestClose('close-press')`. Default "Close". */
  closeLabel?: string | undefined;
  /** Usually a `FullScreenFlow.Progress`. */
  children?: ReactNode | undefined;
}

/** The top bar: logo and title, progress in the middle, a status, and the ×. Pinned; it never scrolls. */
function Header({
  title,
  logo,
  compactTitle,
  status,
  closeLabel = 'Close',
  className,
  children,
  ...rest
}: FullScreenFlowHeaderProps) {
  return (
    <div className={cx('sc-flow__header', className)} {...rest}>
      <div className="sc-flow__heading" data-compact={compactTitle ? '' : undefined}>
        {logo ? (
          <span className="sc-flow__logo" aria-hidden="true">
            {logo}
          </span>
        ) : null}
        <Dialog.Title className="sc-flow__title">{title}</Dialog.Title>
        {compactTitle ? <span className="sc-flow__compact-title">{compactTitle}</span> : null}
      </div>
      {children}
      {status ? <div className="sc-flow__status">{status}</div> : null}
      <Dialog.Close
        className="sc-flow__close"
        render={<IconButton label={closeLabel} aria-keyshortcuts="Escape" />}
      >
        <XIcon size="lg" />
      </Dialog.Close>
    </div>
  );
}

/** A chapter of the flow and how many numbered steps it holds. */
export interface FlowChapter {
  label: string;
  steps: number;
}

export interface FullScreenFlowProgressProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** The chapters in order. Each draws one segment, as wide as its share of the steps. */
  chapters: readonly FlowChapter[];
  /**
   * The current step, counted from 1 across every chapter. `0` is before the first (a welcome screen);
   * anything past the total fills every segment. The current step counts as half done.
   */
  step: number;
  /** One line above the segments: "Step 4 of 10 · Roles · about 5 min left". Hidden below 760px. */
  label?: ReactNode | undefined;
  /** Name of the list of segments. Default "Progress". */
  listLabel?: string | undefined;
}

/** Segmented progress, one segment per chapter; the chapter holding the current step has `aria-current="step"`. */
function Progress({
  chapters,
  step,
  label,
  listLabel = 'Progress',
  className,
  ...rest
}: FullScreenFlowProgressProps) {
  const starts = chapters.reduce<number[]>(
    (acc, chapter, i) => [...acc, i === 0 ? 0 : acc[i - 1]! + chapters[i - 1]!.steps],
    [],
  );
  return (
    <div className={cx('sc-flow__progress', className)} {...rest}>
      {label ? <div className="sc-flow__progress-label">{label}</div> : null}
      <ol className="sc-flow__segments" aria-label={listLabel}>
        {chapters.map((chapter, i) => {
          const from = starts[i]!;
          const current = step > from && step <= from + chapter.steps;
          const done = Math.min(chapter.steps, Math.max(0, step - 1 - from)) + (current ? 0.5 : 0);
          const percent = chapter.steps > 0 ? Math.min(100, (done / chapter.steps) * 100) : 0;
          return (
            <li
              key={chapter.label}
              className="sc-flow__segment"
              style={{ flexGrow: chapter.steps }}
              aria-current={current ? 'step' : undefined}
            >
              <span className="sc-flow__segment-fill" style={{ inlineSize: `${percent}%` }} />
              <span className="sc-visually-hidden">{chapter.label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export type FullScreenFlowBodyProps = ComponentPropsWithRef<'div'>;

/** Between header and footer: a `Rail` (from 1000px) beside the `Viewport`. */
function Body({ className, ...rest }: FullScreenFlowBodyProps) {
  return <div className={cx('sc-flow__body', className)} {...rest} />;
}

export interface FullScreenFlowRailProps extends ComponentPropsWithRef<'nav'> {
  /** A note under the steps, such as where answers can be changed later. Hidden on short screens. */
  footer?: ReactNode | undefined;
}

/** Every step by chapter, shown from 1000px. Holds `RailGroup`s of `RailItem`s. Named "Steps" unless `aria-label` says otherwise. */
function Rail({
  'aria-label': ariaLabel = 'Steps',
  footer,
  className,
  children,
  ...rest
}: FullScreenFlowRailProps) {
  return (
    <nav className={cx('sc-flow__rail', className)} aria-label={ariaLabel} {...rest}>
      {children}
      {footer ? <div className="sc-flow__rail-note">{footer}</div> : null}
    </nav>
  );
}

export interface FullScreenFlowRailGroupProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  /** The chapter name. */
  label: ReactNode;
}

/** One chapter in the rail: its name over a list of `RailItem`s. */
function RailGroup({ label, className, children, ...rest }: FullScreenFlowRailGroupProps) {
  const id = useId();
  return (
    <div className={cx('sc-flow__rail-group', className)} {...rest}>
      <span className="sc-flow__rail-label" id={id}>
        {label}
      </span>
      <ol className="sc-flow__rail-list" aria-labelledby={id}>
        {children}
      </ol>
    </div>
  );
}

export interface FullScreenFlowRailItemProps extends ComponentPropsWithRef<'button'> {
  /** The step on screen: `aria-current="step"` and the accent wash. */
  current?: boolean | undefined;
  /** Shows a check and adds `doneLabel` for assistive tech. */
  done?: boolean | undefined;
  /** Read after the label when `done`. Default "done". */
  doneLabel?: string | undefined;
  /** A small icon at the end of the row, e.g. "drafted for you". Give it a `title` if it carries meaning. */
  adornment?: ReactNode | undefined;
}

/** A step in the rail. A button: disable the steps not reached yet. */
function RailItem({
  current = false,
  done = false,
  doneLabel = 'done',
  adornment,
  type = 'button',
  className,
  children,
  ...rest
}: FullScreenFlowRailItemProps) {
  return (
    <li className="sc-flow__rail-entry">
      <button
        type={type}
        className={cx('sc-flow__rail-item', className)}
        aria-current={current ? 'step' : undefined}
        data-done={done || undefined}
        {...rest}
      >
        <span className="sc-flow__rail-mark" aria-hidden="true">
          {done ? <CheckIcon size="sm" /> : null}
        </span>
        <span className="sc-flow__rail-text">
          {children}
          {done ? <span className="sc-visually-hidden">, {doneLabel}</span> : null}
        </span>
        {adornment ? <span className="sc-flow__rail-adornment">{adornment}</span> : null}
      </button>
    </li>
  );
}

interface Frame {
  key: string;
  element: ReactElement;
  direction: FlowDirection;
}

export interface FullScreenFlowViewportProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'ref'> {
  /** Which way this change goes. Set it with the step: `back` when the person went back. Default `forward`. */
  direction?: FlowDirection | undefined;
  /** Exactly one `FullScreenFlow.Step`, keyed by step: `<FullScreenFlow.Step key={step.id} …>`. */
  children: ReactElement;
}

/**
 * The scrolling area that shows one step. When the child's `key` changes, the old step slides out and the
 * new one slides in (by `direction`; a short crossfade under reduced motion), the area scrolls to the top,
 * and the new step's title takes focus and is announced.
 */
function Viewport({ direction = 'forward', className, children, ...rest }: FullScreenFlowViewportProps) {
  const element = Children.only(children);
  const key = String(element.key ?? '');
  const [state, setState] = useState<{ current: Frame; leaving: Frame | null; moved: boolean }>({
    current: { key, element, direction },
    leaving: null,
    moved: false,
  });
  // Derived during render (React's "store information from previous renders"): the step that is leaving
  // keeps the props it last rendered with, and stays mounted under its own key while it animates out.
  if (state.current.key !== key) {
    setState({
      current: { key, element, direction },
      leaving: { ...state.current, direction },
      moved: true,
    });
  } else if (state.current.element !== element) {
    setState((s) => ({ ...s, current: { ...s.current, element } }));
  }
  const finishExit = useCallback((leftKey: string) => {
    setState((s) => (s.leaving?.key === leftKey ? { ...s, leaving: null } : s));
  }, []);

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state.moved && ref.current) ref.current.scrollTop = 0;
  }, [key, state.moved]);

  const frames: Array<{ frame: Frame; phase: FramePhase }> = [];
  if (state.leaving && state.leaving.key !== key) frames.push({ frame: state.leaving, phase: 'exit' });
  frames.push({
    frame: { key, element, direction: state.current.direction },
    phase: state.moved ? 'enter' : undefined,
  });

  return (
    <div ref={ref} className={cx('sc-flow__viewport', className)} {...rest}>
      {frames.map(({ frame, phase }) => (
        <FrameView
          key={frame.key}
          frameKey={frame.key}
          phase={phase}
          direction={frame.direction}
          onExited={finishExit}
        >
          {frame.element}
        </FrameView>
      ))}
    </div>
  );
}

function FrameView({
  frameKey,
  phase,
  direction,
  onExited,
  children,
}: {
  frameKey: string;
  phase: FramePhase;
  direction: FlowDirection;
  onExited: (key: string) => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (phase !== 'exit') return;
    let cancelled = false;
    const el = ref.current;
    // CSS runs the motion (tokens, reduced motion); wait for it. Where nothing animates, leave at once.
    const animations = el && typeof el.getAnimations === 'function' ? el.getAnimations() : [];
    const done = () => {
      if (!cancelled) onExited(frameKey);
    };
    Promise.all(animations.map((a) => a.finished)).then(done, done);
    return () => {
      cancelled = true;
    };
  }, [phase, frameKey, onExited]);
  return (
    <div
      ref={ref}
      className="sc-flow__frame"
      data-phase={phase}
      data-direction={direction}
      inert={phase === 'exit'}
    >
      <FrameContext.Provider value={phase}>{children}</FrameContext.Provider>
    </div>
  );
}

export interface FullScreenFlowStepProps extends Omit<ComponentPropsWithRef<'section'>, 'title'> {
  /** The step's heading, an `<h2>` that takes focus (`tabindex="-1"`) when the step arrives. */
  title: ReactNode;
  /** A short line above the title: "Your search · Step 4 of 10". */
  eyebrow?: ReactNode | undefined;
  /** Why this step is asked, under the title. */
  description?: ReactNode | undefined;
  /** What the live region says when the step arrives: "Step 4 of 10, Roles". Defaults to `title` when it is a string. */
  announcement?: string | undefined;
}

/** One step: eyebrow, title, description, then its content. Render it inside `Viewport` with a `key`. */
function Step({
  title,
  eyebrow,
  description,
  announcement,
  className,
  children,
  ...rest
}: FullScreenFlowStepProps) {
  const id = useId();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const phase = useContext(FrameContext);
  const { announce } = useContext(FlowContext);
  const message = announcement ?? (typeof title === 'string' ? title : undefined);
  // The latest message and announcer, read when the step arrives. A ref rather than React's useEffectEvent, which
  // the React canary bundled with Next 15 exports only as experimental_useEffectEvent (the import breaks next build).
  const latest = useRef({ message, announce });
  useEffect(() => {
    latest.current = { message, announce };
  });
  useEffect(() => {
    if (phase !== 'enter') return;
    titleRef.current?.focus({ preventScroll: true });
    if (latest.current.message) latest.current.announce(latest.current.message);
  }, [phase]);
  return (
    <section className={cx('sc-flow__step', className)} aria-labelledby={id} {...rest}>
      <div className="sc-flow__step-head">
        {eyebrow ? <p className="sc-flow__eyebrow">{eyebrow}</p> : null}
        <h2 className="sc-flow__step-title" id={id} ref={titleRef} tabIndex={-1}>
          {title}
        </h2>
        {description ? <div className="sc-flow__step-description">{description}</div> : null}
      </div>
      {children}
    </section>
  );
}

export interface FullScreenFlowFooterProps extends ComponentPropsWithRef<'div'> {
  /** At the inline start: a Back button. */
  back?: ReactNode | undefined;
  /** Before the actions, from 760px: "Press Enter to continue". */
  hint?: ReactNode | undefined;
  /** The primary action, at the inline end; stretches below 520px. */
  children?: ReactNode | undefined;
}

/** The pinned bottom bar. Buttons in it are at least 44px tall and wide, and it clears the home indicator. */
function Footer({ back, hint, className, children, ...rest }: FullScreenFlowFooterProps) {
  return (
    <div className={cx('sc-flow__footer', className)} {...rest}>
      {back ? <div className="sc-flow__footer-back">{back}</div> : null}
      {hint ? <div className="sc-flow__footer-hint">{hint}</div> : null}
      <div className="sc-flow__footer-actions">{children}</div>
    </div>
  );
}

/**
 * A full-screen, multi-step flow (onboarding, setup) on `Dialog variant="fullscreen"`:
 * `Root` › `Header` (with `Progress`) · `Body` (`Rail` › `RailGroup` › `RailItem`, and `Viewport` › `Step`) · `Footer`.
 * The app owns the state (which step, which direction); this owns the surface, motion, focus and announcements.
 */
export const FullScreenFlow = {
  Root,
  Header,
  Progress,
  Body,
  Rail,
  RailGroup,
  RailItem,
  Viewport,
  Step,
  Footer,
};
