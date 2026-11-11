// Popups keep Base UI's 5px from each edge plus the safe-area inset there. jsdom has no env(), so the test stands in
// for the computed padding the probe reads.
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useSafeAreaPadding } from './useSafeAreaPadding';

const insets = (top: number, right: number, bottom: number, left: number) => {
  const real = window.getComputedStyle.bind(window);
  return vi.spyOn(window, 'getComputedStyle').mockImplementation((el, pseudo) => {
    const style = real(el, pseudo);
    if (!el.hasAttribute('data-sc-safe-area-probe')) return style;
    return {
      ...style,
      paddingTop: `${top}px`,
      paddingRight: `${right}px`,
      paddingBottom: `${bottom}px`,
      paddingLeft: `${left}px`,
    } as CSSStyleDeclaration;
  });
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useSafeAreaPadding', () => {
  it('is Base UI’s 5px on every side where the screen has no insets', () => {
    insets(0, 0, 0, 0);
    const { result } = renderHook(() => useSafeAreaPadding());
    expect(result.current).toEqual({ top: 5, right: 5, bottom: 5, left: 5 });
  });

  it('adds each inset, follows a rotation, and leaves no probe behind', () => {
    insets(59, 0, 34, 0);
    const { result } = renderHook(() => useSafeAreaPadding());
    expect(result.current).toEqual({ top: 64, right: 5, bottom: 39, left: 5 });
    vi.restoreAllMocks();
    insets(0, 59, 21, 59);
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current).toEqual({ top: 5, right: 64, bottom: 26, left: 64 });
    expect(document.body.children.length).toBe(1); // renderHook's own container
  });
});
