// Types for docgen.mjs, imported by the Storybook config (apps/storybook/.storybook/main.ts).
import type { PropItem, ParserOptions } from 'react-docgen-typescript';

export const CONTRACT_PACKAGES: readonly string[];
export function packageOf(fileName: string): string | null;
export function propFilter(prop: PropItem): boolean;
export const parserOptions: ParserOptions & { propFilter: (prop: PropItem) => boolean };
