// Story-only helpers; never imported by the package entry.
import type { ReactNode } from 'react';

/** Renders children on the dark theme's canvas, whatever the toolbar says. */
export function DarkTheme({ children }: { children: ReactNode }) {
  return (
    <div
      data-theme="dark"
      style={{
        padding: 'var(--sc-spacing-lg)',
        background: 'var(--sc-color-surface-canvas)',
        color: 'var(--sc-color-text-default)',
        borderRadius: 'var(--sc-radius-xl)',
      }}
    >
      {children}
    </div>
  );
}

/** Renders children under compact density. */
export function Compact({ children }: { children: ReactNode }) {
  return <div data-density="compact">{children}</div>;
}
