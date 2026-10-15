import type { Decorator, Preview } from '@storybook/react-vite';
import { useEffect } from 'react';
import type React from 'react';
import '@salemcobalt/tokens/css';
import '../../../packages/ui/src/styles/preview.css';

function ThemeSync({
  theme,
  density,
  children,
}: {
  theme: string;
  density: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
    if (density === 'compact') root.setAttribute('data-density', 'compact');
    else root.removeAttribute('data-density');
  }, [theme, density]);
  return <>{children}</>;
}

const withTheme: Decorator = (Story, context) => (
  <ThemeSync theme={context.globals['theme'] as string} density={context.globals['density'] as string}>
    <Story />
  </ThemeSync>
);

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: 'Color theme',
      toolbar: { title: 'Theme', icon: 'mirror', items: ['light', 'dark', 'system'], dynamicTitle: true },
    },
    density: {
      description: 'Density',
      toolbar: { title: 'Density', icon: 'component', items: ['comfortable', 'compact'], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: 'light', density: 'comfortable' },
  parameters: {
    a11y: { test: 'error' },
    controls: { matchers: { color: /(background|color)$/i } },
    backgrounds: { disable: true },
    layout: 'padded',
    options: { storySort: { order: ['Foundations', 'Layout', 'Components'] } },
  },
};
export default preview;
