// @vitest-environment node
// custom-elements.json: valid Custom Elements Manifest, mapped as docs/adr/0010-component-manifest.md says, and
// reproducible from source.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import Ajv from 'ajv';
import type {
  ClassField,
  CustomElementDeclaration,
  Declaration,
  Package,
} from 'custom-elements-manifest/schema';
import schema from 'custom-elements-manifest/schema.json';
import { ENTRIES, MANIFEST_PATH, buildManifest, serialize } from '../scripts/build-manifest.mjs';
import pkg from '../package.json';

const committed = readFileSync(MANIFEST_PATH, 'utf8');
const manifest = JSON.parse(committed) as Package;
const declarations = manifest.modules.flatMap((m) => m.declarations ?? []) as Declaration[];
const byName = (name: string) => {
  const found = declarations.find((d) => d.name === name);
  if (!found) throw new Error(`No declaration named ${name}`);
  return found as CustomElementDeclaration;
};
const names = (list: ReadonlyArray<{ name: string }> | undefined) => (list ?? []).map((x) => x.name);

describe('custom-elements.json', () => {
  it('validates against the custom-elements-manifest 2.1.0 schema', () => {
    const validate = new Ajv({ allErrors: true, strict: false }).compile(schema);
    const valid = validate(manifest);
    expect(validate.errors ?? []).toEqual([]);
    expect(valid).toBe(true);
    expect(manifest.schemaVersion).toBe('2.1.0');
  });

  it('adds no field the schema does not define, other than x-protokit on a declaration', () => {
    // The published schema allows extra properties; `cem validate` (@pwrs/cem) does not. Close every object and
    // allow only the one documented extension, so nothing else slips in.
    const strict = structuredClone(schema) as {
      additionalProperties?: boolean;
      definitions: Record<string, { type?: string; properties?: object; additionalProperties?: boolean }>;
    };
    strict.additionalProperties = false;
    for (const definition of Object.values(strict.definitions)) {
      if (definition.properties) definition.additionalProperties = false;
    }
    const withoutExtension = structuredClone(manifest);
    for (const mod of withoutExtension.modules) {
      for (const d of mod.declarations ?? []) delete (d as unknown as Record<string, unknown>)['x-protokit'];
    }
    const validate = new Ajv({ allErrors: true, strict: false }).compile(strict);
    validate(withoutExtension);
    expect(validate.errors ?? []).toEqual([]);
  });

  it('is what the generator makes from source, every time', () => {
    const first = serialize(buildManifest());
    const second = serialize(buildManifest());
    expect(second).toBe(first);
    // A stale file fails here and in `pnpm check:manifest`; `pnpm --filter @protokit/ui manifest` rewrites it.
    expect(first).toBe(committed);
  }, 60_000);

  it('describes every component directory, and nothing that is not exported', () => {
    const dirs = readdirSync(join(__dirname, '../src/components')).filter((d) => d !== 'Field');
    const sources = new Set(
      declarations.map((d) => /\/src\/components\/([^/]+)\//.exec(d.source?.href ?? '')?.[1]),
    );
    expect(dirs.filter((d) => !sources.has(d))).toEqual([]);
    for (const mod of manifest.modules) {
      for (const exp of mod.exports ?? []) {
        expect(mod.declarations?.some((d) => d.name === exp.name)).toBe(true);
      }
    }
  });

  it('ships through the package.json discovery field, from module paths the package exports', () => {
    expect(pkg.customElements).toBe('custom-elements.json');
    expect(pkg.files).toContain('custom-elements.json');
    const targets = Object.values(pkg.exports).flatMap((v) =>
      typeof v === 'string' ? [v] : Object.values(v),
    );
    for (const entry of ENTRIES) expect(targets).toContain(`./${entry.path}`);
    expect(manifest.modules.map((m) => m.path)).toEqual(ENTRIES.map((e) => e.path));
  });
});

describe('the React mapping', () => {
  it("lists Button's own props and none it inherits from <button>", () => {
    const button = byName('Button');
    expect(names(button.members)).toEqual(['variant', 'size', 'loading', 'fullWidth', 'iconOnly']);
    expect(button.events ?? []).toEqual([]);
    expect(button.tagName).toBeUndefined();
  });

  it('maps ReactNode props to slots, children to the default slot', () => {
    expect(names(byName('Button').slots)).toEqual(['iconStart', 'iconEnd', 'shortcut', '']);
  });

  it('says a required slot is required, since a CEM Slot has no flag for it', () => {
    const title = byName('EmptyState').slots?.find((s) => s.name === 'title');
    expect(title?.description).toMatch(/^\*\*Required\.\*\* /);
    expect(byName('Button').slots?.find((s) => s.name === 'iconStart')?.description).not.toMatch(/Required/);
  });

  it('maps on* callbacks to events', () => {
    const root = byName('Dialog.Root');
    expect(names(root.events)).toEqual(['onOpenChange', 'onRequestClose']);
    expect(root.events?.[0]?.type.text).toBe('((open: boolean) => void) | undefined');
    expect(names(root.members)).not.toContain('onOpenChange');
  });

  it('keeps a prop the component declares even when it shadows a DOM attribute', () => {
    // Table.Cell's `align` is its own (start | center | end) and also the obsolete HTML attribute.
    const align = byName('Table.Cell').members?.find((m) => m.name === 'align') as ClassField;
    expect(align.type?.text).toBe('"start" | "center" | "end" | undefined');
    expect(align.inheritedFrom).toBeUndefined();
  });

  it("keeps the wrapped primitive's props, marked as inherited from Base UI", () => {
    const render = byName('Dialog.Trigger').members?.find((m) => m.name === 'render') as ClassField;
    expect(render.inheritedFrom).toEqual({ name: 'BaseUIComponentProps', package: '@base-ui/react' });
  });

  it('writes literal unions in source order and defaults as JavaScript', () => {
    const variant = byName('Button').members?.[0] as ClassField;
    expect(variant.type?.text).toBe(
      '"primary" | "secondary" | "ghost" | "danger" | "success" | "inverse" | undefined',
    );
    expect(variant.default).toBe('"primary"');
  });

  it('gives a compound component one declaration per part, named as JSX writes it', () => {
    const exported = manifest.modules[0]?.exports?.map((e) => e.name) ?? [];
    expect(exported).toContain('Dialog');
    expect(exported).not.toContain('Dialog.Root');
    const parts = declarations.filter((d) => d.name.startsWith('Dialog.')).map((d) => d.name);
    expect(parts).toEqual([
      'Dialog.Root',
      'Dialog.Trigger',
      'Dialog.Content',
      'Dialog.Title',
      'Dialog.Description',
      'Dialog.Body',
      'Dialog.Actions',
      'Dialog.Close',
    ]);
    expect(byName('Dialog').demos?.[0]?.url).toMatch(
      /^https:\/\/protokit\.design\/workshop\/iframe\.html\?id=components-dialog--/,
    );
  });

  it('carries the component custom properties and the release it shipped in', () => {
    expect(byName('Meter').cssProperties).toEqual([
      expect.objectContaining({ name: '--proto-meter-value-width', default: '4ch' }),
    ]);
    expect((byName('Button') as unknown as Record<string, unknown>)['x-protokit']).toEqual({
      since: '0.1.0',
    });
  });
});
