/**
 * Swipe down to dismiss a `Dialog variant="sheet"` docked to the bottom edge (below 640px).
 *
 * A drag may start on the handle, or anywhere in the top `zone` px of the sheet outside `Dialog.Body` and
 * outside controls (buttons, links, fields). It never starts inside `Dialog.Body`, scrolled or not: the
 * body keeps native scrolling, and a touch the browser takes for a scroll ends in `pointercancel`, which
 * springs the sheet back. A release dismisses by pressing the handle, which is a `Dialog.Close`, so a
 * swipe goes wherever a press on the handle goes: `onOpenChange(false)`, or `onRequestClose('close-press')`
 * when the Root has it.
 */
export const SHEET_SWIPE = {
  /** Height in px, from the sheet's top edge, where a drag may start: the handle and the header. */
  zone: 64,
  /** Movement in px before a press becomes a drag, so taps stay taps. */
  slop: 6,
  /** Fraction of the sheet's height past which a release dismisses. */
  distance: 0.3,
  /** Release speed in px/ms: this fast downward dismisses at any distance, this fast upward keeps it open. */
  velocity: 0.5,
  /** Only samples this recent (ms) before the release count toward its speed. */
  window: 100,
} as const;

export type DragIntent = 'pending' | 'drag' | 'cancel';

/** Whether a press that has moved by (`dx`, `dy`) is still undecided, a downward drag, or something else. */
export function dragIntent(dx: number, dy: number, slop: number = SHEET_SWIPE.slop): DragIntent {
  if (Math.abs(dx) < slop && Math.abs(dy) < slop) return 'pending';
  return dy > 0 && dy >= Math.abs(dx) ? 'drag' : 'cancel';
}

export interface SwipeSample {
  /** Event time in ms. */
  t: number;
  /** `clientY` in px. */
  y: number;
}

/**
 * Speed in px/ms (positive is downward) over the samples within `window` ms of the last one. The last
 * sample is the release itself, so a finger that stops before lifting reads as 0.
 */
export function releaseVelocity(
  samples: readonly SwipeSample[],
  window: number = SHEET_SWIPE.window,
): number {
  const last = samples[samples.length - 1];
  if (!last) return 0;
  const first = samples.find((s) => last.t - s.t <= window) ?? last;
  const dt = last.t - first.t;
  return dt > 0 ? (last.y - first.y) / dt : 0;
}

export interface SwipeRelease {
  /** How far the sheet has moved down, in px. */
  offset: number;
  /** The sheet's height in px. */
  height: number;
  /** Release speed in px/ms, positive downward. */
  velocity: number;
}

/** Dismiss on a quick downward flick, or past `distance` of the height unless flicked back up. */
export function shouldDismissSheet({ offset, height, velocity }: SwipeRelease): boolean {
  if (offset <= 0 || height <= 0) return false;
  if (velocity >= SHEET_SWIPE.velocity) return true;
  if (velocity <= -SHEET_SWIPE.velocity) return false;
  return offset >= height * SHEET_SWIPE.distance;
}

const IGNORE = 'a,button,input,select,textarea,label,[role="button"],[contenteditable]';

/**
 * Wires the gesture onto the handle's parent, the popup. Returns the cleanup. Does nothing while the handle
 * is hidden (wide viewports, where the sheet is a centred dialog).
 */
export function attachSheetSwipe(handle: HTMLElement): () => void {
  const popup = handle.parentElement;
  if (!popup) return () => {};

  let press: { id: number; x: number; y: number } | null = null;
  let dragging = false;
  let height = 0;
  let samples: SwipeSample[] = [];
  let suppressClick = false;

  const startsDrag = (e: PointerEvent) => {
    if (!e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return false;
    if (handle.getClientRects().length === 0) return false;
    const target = e.target instanceof Element ? e.target : null;
    if (!target || handle.contains(target)) return true;
    if (target.closest(IGNORE) || target.closest('.sc-dialog__body')) return false;
    return e.clientY - popup.getBoundingClientRect().top <= SHEET_SWIPE.zone;
  };

  const settle = () => {
    delete popup.dataset.swiping;
    popup.style.removeProperty('transform');
  };

  const onDown = (e: PointerEvent) => {
    if (press || !startsDrag(e)) return;
    press = { id: e.pointerId, x: e.clientX, y: e.clientY };
    samples = [{ t: e.timeStamp, y: e.clientY }];
  };

  const onMove = (e: PointerEvent) => {
    if (!press || e.pointerId !== press.id) return;
    const dy = e.clientY - press.y;
    if (!dragging) {
      const intent = dragIntent(e.clientX - press.x, dy);
      if (intent === 'pending') return;
      if (intent === 'cancel') {
        press = null;
        return;
      }
      dragging = true;
      height = popup.getBoundingClientRect().height;
      popup.dataset.swiping = '';
      popup.setPointerCapture?.(e.pointerId);
      window.getSelection()?.removeAllRanges();
    }
    e.preventDefault();
    samples.push({ t: e.timeStamp, y: e.clientY });
    if (samples.length > 32) samples = samples.slice(-16);
    popup.style.transform = `translateY(${Math.max(0, dy)}px)`;
  };

  const end = (e: PointerEvent, cancelled: boolean) => {
    if (!press || e.pointerId !== press.id) return;
    const startY = press.y;
    const wasDragging = dragging;
    press = null;
    dragging = false;
    if (!wasDragging) return;
    // The click that follows a drag is not a press on whatever sits under the pointer.
    window.setTimeout(() => {
      suppressClick = false;
    }, 0);
    if (cancelled) {
      suppressClick = true;
      settle();
      return;
    }
    samples.push({ t: e.timeStamp, y: e.clientY });
    const release = {
      offset: Math.max(0, e.clientY - startY),
      height,
      velocity: releaseVelocity(samples),
    };
    if (shouldDismissSheet(release)) {
      // Keep the offset: the exit transition slides the rest of the way from here.
      delete popup.dataset.swiping;
      handle.click();
      suppressClick = true;
      // `onRequestClose` may have kept it open (a "Discard changes?" step): spring back.
      window.requestAnimationFrame(() => {
        if (popup.isConnected && popup.hasAttribute('data-open')) settle();
      });
    } else {
      suppressClick = true;
      settle();
    }
  };
  const onUp = (e: PointerEvent) => end(e, false);
  const onCancel = (e: PointerEvent) => end(e, true);

  const onClick = (e: MouseEvent) => {
    if (!suppressClick) return;
    suppressClick = false;
    e.preventDefault();
    e.stopPropagation();
  };

  popup.addEventListener('pointerdown', onDown);
  popup.addEventListener('pointermove', onMove);
  popup.addEventListener('pointerup', onUp);
  popup.addEventListener('pointercancel', onCancel);
  popup.addEventListener('click', onClick, true);
  return () => {
    popup.removeEventListener('pointerdown', onDown);
    popup.removeEventListener('pointermove', onMove);
    popup.removeEventListener('pointerup', onUp);
    popup.removeEventListener('pointercancel', onCancel);
    popup.removeEventListener('click', onClick, true);
    settle();
  };
}
