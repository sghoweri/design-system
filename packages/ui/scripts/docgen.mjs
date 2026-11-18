// One docgen configuration, shared by the manifest generator (scripts/build-manifest.mjs) and the Storybook
// (apps/storybook/.storybook/main.ts), so the props a page lists and the controls a story offers are the same set.
// Decision: docs/adr/0010-component-manifest.md.

/** Packages whose declared props are part of a component's contract: the primitive it wraps. */
export const CONTRACT_PACKAGES = ['@base-ui/react'];

/** The package a declaration file belongs to, or `null` for this repo's own source. */
export function packageOf(fileName) {
  const at = fileName.lastIndexOf('/node_modules/');
  if (at === -1) return null;
  const rest = fileName.slice(at + '/node_modules/'.length).split('/');
  return rest[0].startsWith('@') ? `${rest[0]}/${rest[1]}` : rest[0];
}

/**
 * Keep a prop when the component (or a sibling in this repo) declares it, or when the wrapped primitive does.
 * Drop props that only `@types/react` declares: the DOM, HTML, ARIA and event attributes every element has.
 * A prop declared here and in `@types/react` (Table.Cell's `align`, Dialog.Content's `className`) is kept:
 * the component's own declaration is the documented one.
 */
export function propFilter(prop) {
  const declarations = prop.declarations ?? (prop.parent ? [prop.parent] : []);
  if (declarations.length === 0) return true; // declared inline in a type literal of this repo
  return declarations.some((d) => {
    const pkg = packageOf(d.fileName);
    return pkg === null || CONTRACT_PACKAGES.includes(pkg);
  });
}

/** `react-docgen-typescript` options, also passed to Storybook's `reactDocgenTypescriptOptions`. */
export const parserOptions = {
  propFilter,
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
  shouldSortUnions: false,
  savePropValueAsString: true,
  shouldIncludePropTagMap: true,
};
