#!/usr/bin/env node
// Writes custom-elements.json: every component @protokit/ui exports, in the Custom Elements Manifest format
// (schema 2.1.0), from the TypeScript source through react-docgen-typescript. The docs site's props tables, and
// later its header cards, llms.txt and proof strip, read this one file. The mapping from React components to
// CEM declarations, and what it gives up, is docs/adr/0010-component-manifest.md.
//
//   node scripts/build-manifest.mjs           write custom-elements.json
//   node scripts/build-manifest.mjs --check   exit 1 when the committed file differs from a fresh build
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';
import { Parser } from 'react-docgen-typescript';
import { loadCsf } from 'storybook/internal/csf-tools';
import { CONTRACT_PACKAGES, packageOf, parserOptions } from './docgen.mjs';

const PKG_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPO = 'https://github.com/sghoweri/protokit';
const REPO_DIR = 'packages/ui';
const WORKSHOP = 'https://protokit.design/workshop';
export const MANIFEST_PATH = join(PKG_ROOT, 'custom-elements.json');

/** Each source entry and the built module a consumer imports it from (tsup.config.ts, package.json `exports`). */
export const ENTRIES = [
  { source: 'src/index.ts', path: 'dist/index.js' },
  { source: 'src/components/TextEditor/index.ts', path: 'dist/editor.js' },
];

const isPascal = (name) => /^[A-Z]/.test(name);
const posix = (p) => p.split('\\').join('/');
const rel = (file) => posix(relative(PKG_ROOT, file));
const sourceLink = (file) => ({ href: `${REPO}/blob/main/${REPO_DIR}/${rel(file)}` });

function createProgram() {
  const configPath = join(PKG_ROOT, 'tsconfig.json');
  const { config } = ts.readConfigFile(configPath, ts.sys.readFile);
  const { options } = ts.parseJsonConfigFileContent(config, ts.sys, PKG_ROOT);
  return ts.createProgram(
    ENTRIES.map((e) => join(PKG_ROOT, e.source)),
    { ...options, noEmit: true },
  );
}

/** A symbol's own declaration, following `export { X } from` aliases and `{ Root }` shorthands. */
function resolveValue(checker, symbol) {
  let s = symbol;
  if (s.flags & ts.SymbolFlags.Alias) s = checker.getAliasedSymbol(s);
  const decl = s.valueDeclaration ?? s.declarations?.[0];
  if (decl && ts.isShorthandPropertyAssignment(decl)) {
    const target = checker.getShorthandAssignmentValueSymbol(decl);
    if (target) return resolveValue(checker, target);
  }
  if (decl && ts.isPropertyAssignment(decl) && ts.isIdentifier(decl.initializer)) {
    const target = checker.getSymbolAtLocation(decl.initializer);
    if (target) return resolveValue(checker, target);
  }
  return s;
}

const declOf = (s) => s.valueDeclaration ?? s.declarations?.[0];

/** JSDoc block tags on a declaration (`@since`, `@status`, `@cssprop`), in source order. */
function jsDocTags(decl) {
  return ts.getJSDocTags(decl).map((tag) => ({
    name: tag.tagName.text,
    text: (ts.getTextOfJSDocComment(tag.comment) ?? '').trim(),
  }));
}

function docText(checker, symbol) {
  return ts.displayPartsToString(symbol.getDocumentationComment(checker)).trim();
}

/** `@cssprop --proto-x - What it does` or `@cssprop [--proto-x=4ch] - What it does` (the CEM analyzer's syntax). */
function cssPropertiesOf(tags) {
  return tags
    .filter((t) => t.name === 'cssprop' || t.name === 'cssproperty')
    .map((t) => {
      const m = /^\[?(--[\w-]+)(?:=([^\]]+))?\]?\s*(?:-\s+)?([\s\S]*)$/.exec(t.text);
      if (!m) throw new Error(`Unreadable @cssprop: "${t.text}"`);
      const [, name, def, description] = m;
      return {
        name,
        ...(description ? { description: description.trim() } : {}),
        ...(def ? { default: def.trim() } : {}),
      };
    });
}

function extensionOf(tags) {
  const ext = {};
  for (const key of ['status', 'since']) {
    const tag = tags.find((t) => t.name === key);
    if (tag) ext[key] = tag.text;
  }
  return Object.keys(ext).length ? { 'x-protokit': ext } : {};
}

/** Where a prop comes from: `null` for this repo, or a Reference to the wrapped primitive's props type. */
function inheritedFrom(prop) {
  const declarations = prop.declarations ?? [];
  if (declarations.length === 0 || declarations.some((d) => packageOf(d.fileName) === null)) return null;
  const d = declarations.find((x) => CONTRACT_PACKAGES.includes(packageOf(x.fileName)));
  if (!d) return null;
  // Base UI's shared `className`/`render`/`style` live in an anonymous part of `BaseUIComponentProps`.
  const name = d.name === 'TypeLiteral' ? 'BaseUIComponentProps' : d.name;
  return { name, package: packageOf(d.fileName) };
}

/**
 * The function that renders a component: a function declaration, an arrow in a `const`, or the first argument of
 * `Object.assign(Base, { Part })`. `null` for a re-exported primitive (`const Trigger = BaseDialog.Trigger`).
 */
function componentFunction(checker, symbol) {
  const decl = declOf(symbol);
  if (!decl) return null;
  if (ts.isFunctionDeclaration(decl)) return decl;
  if (ts.isVariableDeclaration(decl) && decl.initializer) {
    let init = decl.initializer;
    while (ts.isAsExpression(init) || ts.isParenthesizedExpression(init)) init = init.expression;
    if (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) return init;
    if (ts.isCallExpression(init) && /Object\.assign$/.test(init.expression.getText()) && init.arguments[0]) {
      const base = checker.getSymbolAtLocation(init.arguments[0]);
      if (base) return componentFunction(checker, resolveValue(checker, base));
    }
  }
  return null;
}

/** The literal members of a prop's declared type in source order (`'sm' | 'md' | 'lg'`), through aliases. */
function sourceLiterals(checker, typeNode) {
  const out = [];
  const seen = new Set();
  const visit = (node) => {
    if (ts.isParenthesizedTypeNode(node)) return visit(node.type);
    if (ts.isUnionTypeNode(node)) return node.types.every(visit);
    if (node.kind === ts.SyntaxKind.UndefinedKeyword) return true; // added back for optional props
    if (ts.isLiteralTypeNode(node)) {
      const lit = node.literal;
      out.push(ts.isStringLiteral(lit) ? JSON.stringify(lit.text) : lit.getText());
      return true;
    }
    if (ts.isTypeReferenceNode(node)) {
      let sym = checker.getSymbolAtLocation(node.typeName);
      if (sym && sym.flags & ts.SymbolFlags.Alias) sym = checker.getAliasedSymbol(sym);
      const alias = sym?.declarations?.find(ts.isTypeAliasDeclaration);
      if (!alias || seen.has(alias)) return false;
      seen.add(alias);
      return visit(alias.type);
    }
    return false;
  };
  return typeNode && visit(typeNode) && out.length ? out : null;
}

/** The type node a component's props type declares for `name`, when the component is a function in this repo. */
function propTypeNode(checker, fn, name) {
  const param = fn?.parameters[0];
  if (!param) return null;
  const prop = checker.getTypeAtLocation(param).getProperty(name);
  const decl = prop?.declarations?.find((d) => ts.isPropertySignature(d) || ts.isPropertyDeclaration(d));
  return decl?.type ?? null;
}

/**
 * `type.text` with literal unions spelled out (`"sm" | "md" | "lg" | undefined`, not `ButtonSize | undefined`), so
 * a reader needs no TypeScript to see the options, in source order: TypeScript's own order is by type id, so
 * `'start' | 'center' | 'end'` would print as `"center" | "start" | "end"`. Optional props end in `| undefined`,
 * as the source spells them (`exactOptionalPropertyTypes`); that suffix is how a reader tells required props.
 */
function typesOf(prop, literals) {
  const t = prop.type;
  const optional = prop.required ? '' : ' | undefined';
  if (t.name === 'enum' && Array.isArray(t.value)) {
    const values = literals ?? t.value.map((v) => v.value);
    return { type: { text: values.join(' | ') + optional } };
  }
  return { type: { text: t.name + optional } };
}

/** A default as a JavaScript expression (CEM's `default`): docgen gives `primary` for `= 'primary'`. */
function defaultOf(prop, literals) {
  const def = prop.defaultValue?.value;
  if (def === undefined || def === null || def === '' || def === 'undefined') return {};
  const text = String(def);
  const quoted = JSON.stringify(text);
  const isString =
    literals?.includes(quoted) ||
    (/^string\b/.test(prop.type.name) && !/^(-?\d|true$|false$|null$|undefined$|[[{(`'"])/.test(text));
  return { default: isString ? quoted : text };
}

/** Splits a type at its top-level `|`, leaving `A<B | C>` and `(x: A | B) => void` whole. */
function unionMembers(text) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
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

/** A prop that takes rendered content: `ReactNode`, or a single `ReactElement` (not `render`'s element-or-function). */
const isSlot = (prop) => {
  const members = unionMembers(prop.type.name);
  return members.length === 1 && /^(ReactNode|ReactElement)\b/.test(members[0]);
};
const isEvent = (prop) => /^on[A-Z]/.test(prop.name) && prop.type.name.includes('=>');

function deprecationOf(prop) {
  const tags = prop.tags ?? {};
  if (!('deprecated' in tags)) return {};
  return { deprecated: tags.deprecated ? String(tags.deprecated) : true };
}

/** True when the component takes `children` out of its props: it renders them itself (Button's label). */
function usesChildren(fn) {
  const name = fn?.parameters[0]?.name;
  return Boolean(
    name &&
    ts.isObjectBindingPattern(name) &&
    name.elements.some((e) => (e.propertyName ?? e.name).getText() === 'children'),
  );
}

/** Splits a docgen result into CEM members (props), events (`on*` callbacks) and slots (ReactNode props). */
function apiOf(doc, checker, symbol) {
  const fn = componentFunction(checker, symbol);
  const members = [];
  const events = [];
  const slots = [];
  for (const prop of Object.values(doc?.props ?? {})) {
    // `children` passes the filter only to be decided here: kept when declared in this repo or destructured.
    if (prop.name === 'children' && !inheritedFromRepo(prop) && !usesChildren(fn)) continue;
    const description = prop.description?.trim();
    const common = {
      ...(description ? { description } : {}),
      ...deprecationOf(prop),
    };
    const origin = inheritedFrom(prop);
    if (isSlot(prop)) {
      // The default slot is the empty string in CEM; for a React component it is `children`. A Slot has no type
      // and no required flag, so a required one says so where readers look: the start of its description.
      const text = prop.required ? `**Required.** ${description ?? ''}`.trim() : description;
      slots.push({
        name: prop.name === 'children' ? '' : prop.name,
        ...(text ? { description: text } : {}),
        ...deprecationOf(prop),
      });
      continue;
    }
    const literals = sourceLiterals(checker, propTypeNode(checker, fn, prop.name));
    if (isEvent(prop)) {
      events.push({
        name: prop.name,
        ...typesOf(prop, literals),
        ...common,
        ...(origin ? { inheritedFrom: origin } : {}),
      });
      continue;
    }
    members.push({
      kind: 'field',
      name: prop.name,
      ...typesOf(prop, literals),
      ...defaultOf(prop, literals),
      ...common,
      ...(origin ? { inheritedFrom: origin } : {}),
    });
  }
  return {
    ...(members.length ? { members } : {}),
    ...(events.length ? { events } : {}),
    ...(slots.length ? { slots } : {}),
  };
}

const inheritedFromRepo = (prop) => (prop.declarations ?? []).some((d) => packageOf(d.fileName) === null);

/** Every story in the package, keyed by the component its title names (`Components/Table/Selection` → Table). */
function collectDemos() {
  const byComponent = new Map();
  const componentsDir = join(PKG_ROOT, 'src/components');
  const files = readdirSync(componentsDir, { recursive: true })
    .map(posix)
    .filter((f) => /\.stories\.tsx?$/.test(f))
    .sort();
  for (const file of files) {
    const abs = join(componentsDir, file);
    const csf = loadCsf(readFileSync(abs, 'utf8'), {
      fileName: abs,
      makeTitle: (title) => title,
    }).parse();
    const title = csf.meta.title;
    const component = title.split('/')[1] ?? file.split('/')[0];
    const list = byComponent.get(component) ?? [];
    for (const story of csf.stories) {
      list.push({
        url: `${WORKSHOP}/iframe.html?id=${story.id}&viewMode=story`,
        description: `${title.split('/').slice(1).join(' / ')}: ${story.name}`,
        source: sourceLink(abs),
      });
    }
    byComponent.set(component, list);
  }
  return byComponent;
}

function declaration({ name, symbol, doc, checker, demos }) {
  const decl = declOf(symbol);
  const fn = componentFunction(checker, symbol);
  // `Kbd = Object.assign(KbdBase, { Group })`: the docs and tags are on KbdBase.
  const base =
    fn && fn !== decl && ts.isFunctionDeclaration(fn) && fn.name
      ? checker.getSymbolAtLocation(fn.name)
      : null;
  const tags = [...jsDocTags(decl), ...(base ? jsDocTags(declOf(base)) : [])];
  const description = (
    doc?.description ||
    docText(checker, symbol) ||
    (base ? docText(checker, base) : '')
  ).trim();
  const cssProperties = cssPropertiesOf(tags);
  return {
    kind: 'class',
    customElement: true,
    name,
    ...(description ? { description } : {}),
    ...apiOf(doc, checker, symbol),
    ...(cssProperties.length ? { cssProperties } : {}),
    ...(demos?.length ? { demos } : {}),
    source: sourceLink(decl.getSourceFile().fileName),
    ...extensionOf(tags),
  };
}

/** Builds the manifest object. Pure: the same source gives the same manifest. */
export function buildManifest() {
  const program = createProgram();
  const checker = program.getTypeChecker();
  // `children` comes from `@types/react` on most components; apiOf decides per component whether it is a slot.
  const parser = new Parser(program, {
    ...parserOptions,
    skipChildrenPropWithoutDoc: false,
    propFilter: (prop, component) => prop.name === 'children' || parserOptions.propFilter(prop, component),
  });
  const demos = collectDemos();
  const info = (symbol) => parser.getComponentInfo(symbol, declOf(symbol).getSourceFile());

  const modules = ENTRIES.map((entry) => {
    const sourceFile = program.getSourceFile(join(PKG_ROOT, entry.source));
    const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
    const families = [];
    for (const exported of checker.getExportsOfModule(moduleSymbol)) {
      if (!isPascal(exported.name)) continue;
      const symbol = resolveValue(checker, exported);
      if (!(symbol.flags & ts.SymbolFlags.Value)) continue; // types
      const decl = declOf(symbol);
      if (!decl || !posix(decl.getSourceFile().fileName).includes('/src/components/')) continue; // icon glyphs
      const type = checker.getTypeOfSymbolAtLocation(symbol, decl);
      // A namespace object (`Dialog = { Root, … }`) has no call signature; `Kbd = Object.assign(KbdBase, …)` does.
      const plainObject = type.getCallSignatures().length === 0;
      const doc = plainObject ? null : info(symbol);
      if (!plainObject && !doc) continue;
      // Parts: PascalCase properties of the export that are components (`Dialog.Root`, `Kbd.Group`).
      const parts = [];
      for (const member of type.getProperties()) {
        if (!isPascal(member.name)) continue;
        const target = resolveValue(checker, member);
        const partDoc = declOf(target) ? info(target) : null;
        if (partDoc) parts.push({ name: `${exported.name}.${member.name}`, symbol: target, doc: partDoc });
      }
      if (plainObject && parts.length === 0) continue;
      families.push({ name: exported.name, symbol, doc, parts });
    }
    families.sort((a, b) => a.name.localeCompare(b.name, 'en'));

    const declarations = [];
    for (const family of families) {
      declarations.push(declaration({ ...family, checker, demos: demos.get(family.name) }));
      for (const part of family.parts) declarations.push(declaration({ ...part, checker }));
    }
    return {
      kind: 'javascript-module',
      path: entry.path,
      declarations,
      exports: families.map((f) => ({
        kind: 'js',
        name: f.name,
        declaration: { name: f.name, module: entry.path },
      })),
    };
  });

  return { schemaVersion: '2.1.0', readme: 'README.md', modules };
}

export const serialize = (manifest) => `${JSON.stringify(manifest, null, 2)}\n`;

function main() {
  const check = process.argv.includes('--check');
  const next = serialize(buildManifest());
  if (check) {
    let current = '';
    try {
      current = readFileSync(MANIFEST_PATH, 'utf8');
    } catch {
      // missing counts as stale
    }
    if (current !== next) {
      console.error(
        `${rel(MANIFEST_PATH)} is stale: a component's props, docs or stories changed without regenerating it.\n` +
          'Run `pnpm --filter @protokit/ui manifest` and commit the result.',
      );
      process.exit(1);
    }
    console.log(`${rel(MANIFEST_PATH)} is up to date.`);
    return;
  }
  writeFileSync(MANIFEST_PATH, next);
  const declarations = JSON.parse(next).modules.flatMap((m) => m.declarations);
  const components = JSON.parse(next).modules.flatMap((m) => m.exports).length;
  console.log(`Wrote ${rel(MANIFEST_PATH)}: ${components} components, ${declarations.length} declarations.`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) main();
