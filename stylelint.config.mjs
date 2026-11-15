// Namespace rules for the Protokit rename (ADR 0009, decisions 2–5 and 9). Only these rules run: formatting is
// Prettier's job. Part of `pnpm lint` since the rename (docs/protokit-rename-plan.md, PR 2).
const component = '(?:c|o|u|t)-proto-[a-z0-9]+(?:-[a-z0-9]+)*(?:__[a-z0-9]+(?:-[a-z0-9]+)*)?';
// FilePond's own markup, restyled inside the FileInput (ADR 0004).
const vendor = 'filepond--[a-z0-9-]+';
// Custom properties Base UI sets on its popups and tabs, read (never declared) by the stylesheets.
const baseUi = '(?:anchor-width|available-width|available-height|transform-origin|active-tab-[a-z]+)$';

/** @type {import('stylelint').Config} */
export default {
  rules: {
    'selector-class-pattern': [
      `^(?:${component}|${vendor})$`,
      {
        resolveNestedSelectors: true,
        message: (c) =>
          `"${c}" needs a namespace and the brand: c-proto-*, o-proto-*, u-proto-* or t-proto-* (ADR 0009)`,
      },
    ],
    'custom-property-pattern': [
      `^(?:proto-|_|${baseUi})`,
      { message: (p) => `"${p}" must start with --proto- (or --_ for a private value) (ADR 0009)` },
    ],
  },
  overrides: [
    {
      // The docs site is a consumer: its own classes (.demo) are not the system's, and it maps Starlight's --sl-*
      // onto the system's tokens (ADR 0007). The leftover-name check still covers it.
      files: ['apps/docs/**/*.css'],
      rules: { 'selector-class-pattern': null, 'custom-property-pattern': [`^(?:proto-|sl-|_|${baseUi})`] },
    },
  ],
};
