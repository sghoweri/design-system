import { defineConfig, type Options } from 'tsup';

const shared: Options = {
  format: ['esm'],
  sourcemap: true,
  treeshake: true,
  splitting: false,
  target: 'es2022',
  external: ['react', 'react-dom', 'react/jsx-runtime', /^@base-ui\/react/, /^@fontsource/],
};

export default defineConfig([
  {
    ...shared,
    entry: { index: 'src/index.ts' },
    dts: true,
    clean: true,
    // Every component is a Client Component (event handlers, Base UI hooks), so the
    // bundle declares it once here. Server Components can import and render them.
    banner: { js: "'use client';" },
    // tsup's extra rollup tree-shake pass drops module-level directives; esbuild already
    // tree-shakes a single ESM entry, so skip it here.
    treeshake: false,
  },
  {
    ...shared,
    entry: { fonts: 'src/fonts.ts' },
    dts: false,
    clean: false,
  },
]);
