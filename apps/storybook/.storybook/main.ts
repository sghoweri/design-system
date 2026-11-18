import type { StorybookConfig } from '@storybook/react-vite';
// The manifest generator's docgen settings, so controls offer the props the docs site lists (docs/adr/0010).
import { parserOptions } from '../../../packages/ui/scripts/docgen.mjs';

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: ['../../../packages/ui/src/**/*.mdx', '../../../packages/ui/src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  core: { disableTelemetry: true },
  typescript: {
    // react-docgen-typescript reads the types (inherited props, unions through aliases); react-docgen, the
    // default, reads only the AST. The filter drops the DOM attributes every element has.
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      ...parserOptions,
      tsconfigPath: new URL('../../../packages/ui/tsconfig.json', import.meta.url).pathname,
      // The plugin's globs resolve from the Storybook app; its default (`**/**.tsx`) never reaches the package.
      include: [new URL('../../../packages/ui/src/**/*.tsx', import.meta.url).pathname],
      exclude: ['**/*.stories.tsx', '**/*.test.tsx'],
    },
  },
  viteFinal: (cfg) => ({
    ...cfg,
    resolve: {
      ...cfg.resolve,
      alias: {
        ...cfg.resolve?.alias,
        '@protokit/ui': new URL('../../../packages/ui/src/index.ts', import.meta.url).pathname,
      },
    },
  }),
};
export default config;
