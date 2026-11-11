import { useSyncExternalStore } from 'react';

/** Base UI's own default `collisionPadding`: the room a popup keeps from the viewport's edge. */
const EDGE = 5;

export interface SafeAreaPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

const NONE: SafeAreaPadding = { top: EDGE, right: EDGE, bottom: EDGE, left: EDGE };
let current = NONE;
const listeners = new Set<() => void>();

/** Reads `env(safe-area-inset-*)`, which script can only see through a computed style. */
function measure(): void {
  const probe = document.createElement('div');
  probe.setAttribute('data-sc-safe-area-probe', '');
  probe.style.cssText =
    'position:fixed;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) ' +
    'env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';
  document.body.appendChild(probe);
  const style = getComputedStyle(probe);
  const px = (value: string) => EDGE + (parseFloat(value) || 0);
  const next = {
    top: px(style.paddingTop),
    right: px(style.paddingRight),
    bottom: px(style.paddingBottom),
    left: px(style.paddingLeft),
  };
  probe.remove();
  if (
    next.top === current.top &&
    next.right === current.right &&
    next.bottom === current.bottom &&
    next.left === current.left
  ) {
    return;
  }
  current = next;
  listeners.forEach((listener) => listener());
}

function subscribe(onChange: () => void): () => void {
  if (listeners.size === 0) window.addEventListener('resize', measure);
  listeners.add(onChange);
  measure();
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0) window.removeEventListener('resize', measure);
  };
}

/**
 * The `collisionPadding` for a popup positioner: Base UI's 5px from each edge, plus the screen's safe-area inset
 * there. With `viewport-fit=cover` a phone reports its notch or Dynamic Island, rounded corners and home indicator
 * as insets, and a popup shifted or flipped against an edge stays clear of them. Otherwise every inset is 0. One
 * resize listener is shared by every caller; the server and the first render use the plain 5px.
 */
export function useSafeAreaPadding(): SafeAreaPadding {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => NONE,
  );
}
