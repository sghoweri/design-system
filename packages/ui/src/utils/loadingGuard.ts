import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react';

interface PressHandlers<T extends Element> {
  onClick?: ((event: MouseEvent<T>) => void) | undefined;
  onMouseDown?: ((event: MouseEvent<T>) => void) | undefined;
  onPointerDown?: ((event: PointerEvent<T>) => void) | undefined;
  onKeyDown?: ((event: KeyboardEvent<T>) => void) | undefined;
}

/**
 * While `loading`, a press does nothing: the caller's click, mousedown, pointerdown and keydown handlers don't run (so a
 * popup trigger merged in through `render`, which opens on press or on ArrowDown, stays shut), the click's default is
 * cancelled (no form submit; Enter and Space reach the button as a click) and the mousedown's default is cancelled
 * (focus and text selection stay where they were). Keydown keeps its default, so Tab still moves on. Every event still
 * bubbles, so an ancestor's outside-press dismissal or roving focus works as usual.
 */
export function guardPressWhileLoading<T extends Element>(
  loading: boolean,
  { onClick, onMouseDown, onPointerDown, onKeyDown }: PressHandlers<T>,
): Required<PressHandlers<T>> {
  return {
    onClick: (event) => {
      if (loading) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    },
    onMouseDown: (event) => {
      if (loading) {
        event.preventDefault();
        return;
      }
      onMouseDown?.(event);
    },
    onPointerDown: (event) => {
      if (loading) return;
      onPointerDown?.(event);
    },
    onKeyDown: (event) => {
      if (loading) return;
      onKeyDown?.(event);
    },
  };
}
