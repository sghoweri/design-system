// The docs-data layer: every fact the site states about a component comes from @protokit/ui's
// custom-elements.json (generated from source, docs/adr/0010-component-manifest.md) and its package.json.
// Props tables read it now; the header cards, llms.txt and the homepage's proof strip are meant to read it too.
import manifestJson from '@protokit/ui/custom-elements.json';
import uiPackage from '@protokit/ui/package.json';
import type {
  ClassField,
  CssCustomProperty,
  CustomElementDeclaration,
  Event,
  JavaScriptModule,
  Package,
  Slot,
} from 'custom-elements-manifest/schema';

export type { ClassField, CssCustomProperty, CustomElementDeclaration, Event, Slot };

/** Protokit's one extension to the spec: lifecycle facts on a component's declaration (ADR 0010). */
export interface ProtokitExtension {
  since?: string;
  status?: string;
}

export interface ComponentEntry {
  /** The exported name: `Button`, `Dialog`. */
  name: string;
  declaration: CustomElementDeclaration;
  /** A compound component's parts, in the order the source lists them (`Dialog.Root`, `Dialog.Trigger`, …). */
  parts: CustomElementDeclaration[];
  /** The specifier to import it from: `@protokit/ui`, `@protokit/ui/editor`. */
  specifier: string;
  since?: string;
  status?: string;
}

const manifest = manifestJson as unknown as Package;
const modules = manifest.modules as JavaScriptModule[];

/** `dist/editor.js` → `@protokit/ui/editor`, through the package's own `exports` map. */
function specifierFor(path: string): string {
  for (const [key, value] of Object.entries(uiPackage.exports)) {
    const targets = typeof value === 'string' ? [value] : Object.values(value);
    if (targets.includes(`./${path}`))
      return key === '.' ? uiPackage.name : `${uiPackage.name}/${key.slice(2)}`;
  }
  throw new Error(`${path} is not in ${uiPackage.name}'s exports`);
}

const entries: ComponentEntry[] = modules.flatMap((mod) => {
  const declarations = (mod.declarations ?? []) as CustomElementDeclaration[];
  return (mod.exports ?? []).map((exp) => {
    const declaration = declarations.find((d) => d.name === exp.name);
    if (!declaration) throw new Error(`custom-elements.json exports ${exp.name} with no declaration`);
    const ext = (declaration as { 'x-protokit'?: ProtokitExtension })['x-protokit'] ?? {};
    return {
      name: exp.name,
      declaration,
      parts: declarations.filter((d) => d.name.startsWith(`${exp.name}.`)),
      specifier: specifierFor(mod.path),
      ...ext,
    };
  });
});

const declarationsByName = new Map(
  modules.flatMap((m) => (m.declarations ?? []) as CustomElementDeclaration[]).map((d) => [d.name, d]),
);

/** Every exported component, A to Z. */
export const components = (): readonly ComponentEntry[] => entries;

/** One component by its exported name. Throws, so a typo fails the build instead of rendering nothing. */
export function component(name: string): ComponentEntry {
  const entry = entries.find((e) => e.name === name);
  if (!entry) throw new Error(`No component "${name}" in @protokit/ui's custom-elements.json`);
  return entry;
}

/** A component or one of its parts (`Dialog.Root`). */
export function declaration(name: string): CustomElementDeclaration {
  const found = declarationsByName.get(name);
  if (!found) throw new Error(`No declaration "${name}" in @protokit/ui's custom-elements.json`);
  return found;
}

/** `import { Dialog } from '@protokit/ui';` */
export const importStatement = (name: string): string =>
  `import { ${name} } from '${component(name).specifier}';`;

/** Counts for the homepage's proof strip: components and workshop stories, from the same file. */
export const counts = () => ({
  components: entries.length,
  stories: entries.reduce((n, e) => n + (e.declaration.demos?.length ?? 0), 0),
});

// ---- Reading the mapping back (ADR 0010) ------------------------------------------------------------------------

/** Splits a type at its top-level `|`, leaving `A<B | C>` and `(x: A | B) => void` whole. */
export function unionMembers(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i]!;
    if ('<([{'.includes(c)) depth += 1;
    else if ('>)]}'.includes(c) && text[i - 1] !== '=') depth -= 1;
    else if (c === '|' && depth === 0) {
      parts.push(text.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(text.slice(start).trim());
  return parts;
}

export interface TypeInfo {
  /** The type without the `| undefined` an optional prop carries. */
  text: string;
  /** Optional props end in `| undefined`; a prop whose type does not is required. */
  required: boolean;
  /** The literal values of a union (`"sm"`, `"md"`), when the type is nothing else. */
  options: string[] | null;
}

/** True when every bracket in `text` closes inside it (so `(a) => (b)` is not unwrapped to `a) => (b`). */
function balanced(text: string): boolean {
  let depth = 0;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i]!;
    if ('<([{'.includes(c)) depth += 1;
    else if ('>)]}'.includes(c) && text[i - 1] !== '=') depth -= 1;
    if (depth < 0) return false;
  }
  return depth === 0;
}

const isLiteral = (t: string) => /^(".*"|'.*'|-?\d+(\.\d+)?|true|false|null)$/.test(t);

export function typeInfo(text: string | undefined): TypeInfo {
  if (!text) return { text: '', required: false, options: null };
  const members = unionMembers(text);
  const required = !members.includes('undefined');
  const rest = members.filter((m) => m !== 'undefined');
  const options = rest.length > 1 && rest.every(isLiteral) ? rest : null;
  let joined = rest.join(' | ');
  // `((open: boolean) => void) | undefined` loses its `undefined`; the parentheses that grouped it go too.
  if (
    rest.length === 1 &&
    joined.startsWith('(') &&
    joined.endsWith(')') &&
    unionMembers(joined.slice(1, -1)).length === 1
  ) {
    const inner = joined.slice(1, -1);
    if (balanced(inner)) joined = inner;
  }
  return { text: joined, required, options };
}

/** Members split into the component's own props and the ones its Base UI primitive declares. */
export function membersOf(d: CustomElementDeclaration) {
  const fields = (d.members ?? []).filter((m): m is ClassField => m.kind === 'field');
  return {
    own: fields.filter((m) => !m.inheritedFrom),
    inherited: fields.filter((m) => m.inheritedFrom),
  };
}
