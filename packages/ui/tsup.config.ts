import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts', fonts: 'src/fonts.ts' },
  format: ['esm'],
  dts: { entry: { index: 'src/index.ts' } },
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
  target: 'es2022',
  external: ['react', 'react-dom', 'react/jsx-runtime', /^@base-ui\/react/, /^@fontsource/],
});
