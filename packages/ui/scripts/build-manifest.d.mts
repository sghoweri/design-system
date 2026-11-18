// Types for build-manifest.mjs, for test/manifest.test.ts. The manifest's own types are the spec's
// (`custom-elements-manifest/schema`).
import type { Package } from 'custom-elements-manifest/schema';

export const MANIFEST_PATH: string;
export const ENTRIES: ReadonlyArray<{ source: string; path: string }>;
export function buildManifest(): Package;
export function serialize(manifest: Package): string;
