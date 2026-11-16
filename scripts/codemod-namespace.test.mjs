// node --test scripts/
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { leftovers, transform } from './codemod-namespace.mjs';

const t = (s) => transform(s).text;

test('CSS: classes take their ITCSS namespace, custom properties and keyframes their prefix', () => {
  assert.equal(
    t('.sc-button:hover .sc-button__icon { color: var(--sc-color-text-default); animation: sc-spin 1s; }'),
    '.c-proto-button:hover .c-proto-button__icon { color: var(--proto-color-text-default); animation: proto-spin 1s; }',
  );
  assert.equal(t('@keyframes sc-logo-sweep {}'), '@keyframes proto-logo-sweep {}');
  assert.equal(t('.sc-stack > .sc-inline'), '.o-proto-stack > .o-proto-inline');
  assert.equal(t('.sc-visually-hidden, .sc-focus-ring'), '.u-proto-visually-hidden, .u-proto-focus-ring');
  assert.equal(t('.sc-on-accent'), '.t-proto-on-accent');
  assert.equal(t('.sc-file-input-field .sc-file-input'), '.c-proto-file-input-field .c-proto-file-input');
});

test('CSS: component knobs, anchor names and private values', () => {
  assert.equal(
    t('bottom: var(--sc-toast-offset-block-end, 0); anchor-name: --sc-bottom-bar; --_bg: red;'),
    'bottom: var(--proto-toast-offset-block-end, 0); anchor-name: --proto-bottom-bar; --_bg: red;',
  );
});

test('layers', () => {
  assert.equal(t('@layer sc {\n  .sc-card {}\n}'), '@layer proto {\n  .c-proto-card {}\n}');
  assert.equal(t('@layer base, sc;'), '@layer base, proto;');
  assert.equal(t('@layer sc.components, sc.utilities;'), '@layer proto.components, proto.utilities;');
  assert.equal(
    t("@import '@salemcobalt/ui/styles.css' layer(sc);"),
    "@import '@protokit/ui/styles.css' layer(proto);",
  );
});

test('TS: class strings, partial prefixes, runtime-built names, token keys', () => {
  assert.equal(
    t('className={cx("sc-chip", open && "sc-chip__remove")}'),
    'className={cx("c-proto-chip", open && "c-proto-chip__remove")}',
  );
  assert.equal(
    t("container.querySelector('.sc-menu__group')"),
    "container.querySelector('.c-proto-menu__group')",
  );
  assert.equal(
    t("expect(el.className).toContain('sc-dialog__')"),
    "expect(el.className).toContain('c-proto-dialog__')",
  );
  assert.equal(t("'--_anchor': `--sc-priority-nav${id}`"), "'--_anchor': `--proto-priority-nav${id}`");
  assert.equal(t('const v = t[`sc-color-${name}`];'), 'const v = t[`proto-color-${name}`];');
  assert.equal(t("json.light['sc-z-overlay']"), "json.light['proto-z-overlay']");
  assert.equal(t("import { Button } from '@salemcobalt/ui';"), "import { Button } from '@protokit/ui';");
  assert.equal(t("import '@salemcobalt/tokens/css';"), "import '@protokit/tokens/css';");
});

test('the prefix written on its own, and data attributes', () => {
  assert.equal(
    t('Custom properties, `--sc-` prefixed; `$sc-*` variables.'),
    'Custom properties, `--proto-` prefixed; `$proto-*` variables.',
  );
  assert.equal(
    t("probe.setAttribute('data-sc-safe-area-probe', '')"),
    "probe.setAttribute('data-proto-safe-area-probe', '')",
  );
});

test('leftovers include old names inside hyphenated names and patterns', () => {
  const s = ["wrap.className = 'cm-sc-removed';", String.raw`.replace(/var\(--(sc-[\w-]+)\)/g, f)`].join(
    '\n',
  );
  assert.deepEqual(
    leftovers(s).map((l) => l.line),
    [1, 2],
  );
});

test('Sass variables', () => {
  assert.equal(
    t('$sc-color-text-default: #111; $sc-dark: ();'),
    '$proto-color-text-default: #111; $proto-dark: ();',
  );
});

test('HTML: style blocks, class and style attributes, markup escaped inside JSON', () => {
  const html =
    '<style>.sc-card{padding:var(--sc-spacing-md)}</style>\n' +
    '<div class="sc-stack" data-gap="md"><button class="sc-button topnav__add" style="gap: var(--sc-spacing-lg);"></button></div>';
  assert.equal(
    t(html),
    '<style>.c-proto-card{padding:var(--proto-spacing-md)}</style>\n' +
      '<div class="o-proto-stack" data-gap="md"><button class="c-proto-button topnav__add" style="gap: var(--proto-spacing-lg);"></button></div>',
  );
  const json = JSON.stringify({ html: '<div class="sc-inline"><svg class="sc-icon"></svg></div>' });
  assert.equal(
    t(json),
    JSON.stringify({ html: '<div class="o-proto-inline"><svg class="c-proto-icon"></svg></div>' }),
  );
});

test('no false positives', () => {
  for (const s of [
    'misc-button',
    'disc-x',
    '.asc-stack',
    'scss-button',
    'sc-unknown-block',
    'sc-button--primary',
    'url(#sc-mask)',
    '.topnav__add',
    'basic-sc',
    'layer(base)',
    '@layer base, components;',
    '@salemcobalt/ui-extra',
  ])
    assert.equal(t(s), s, s);
});

test('names it cannot know are left alone and reported', () => {
  const s = 'const mask = `sc-logo-${useId()}`;';
  assert.equal(t(s), s);
  assert.deepEqual(
    leftovers(s).map((l) => l.match),
    ['sc-'],
  );
});

test('idempotent: a second run changes nothing', () => {
  const s =
    '@layer sc { .sc-dialog__close { inset: var(--sc-spacing-md); animation: sc-spin 1s; } }\n' +
    "import '@salemcobalt/ui/styles.css'; const k = `sc-color-${n}`; $sc-dark: ();";
  const once = transform(s);
  const twice = transform(once.text);
  assert.ok(once.count > 0);
  assert.equal(twice.count, 0);
  assert.equal(twice.text, once.text);
  assert.deepEqual(leftovers(once.text), []);
});

test('leftovers finds every old form', () => {
  const found = leftovers(
    ".sc-button\nvar(--sc-x)\n$sc-dark\n@layer base, sc;\nimport '@salemcobalt/ui';",
  ).map((l) => l.line);
  assert.deepEqual(found, [1, 2, 3, 4, 5]);
});
