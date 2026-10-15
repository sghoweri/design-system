import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: ['../../../packages/ui/src/**/*.mdx', '../../../packages/ui/src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  core: { disableTelemetry: true },
  viteFinal: (cfg) => ({
    ...cfg,
    resolve: {
      ...cfg.resolve,
      alias: {
        ...cfg.resolve?.alias,
        '@salemcobalt/ui': new URL('../../../packages/ui/src/index.ts', import.meta.url).pathname,
      },
    },
  }),
};
export default config;
