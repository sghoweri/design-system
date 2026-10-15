// Builds dist/ from src/ with Style Dictionary.
// One source, two themes: light.json and dark.json alias the same primitives under the same paths.
import StyleDictionary from 'style-dictionary';
import { formattedVariables } from 'style-dictionary/utils';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dist = join(here, 'dist');
const PREFIX = 'sc';
const version = JSON.parse(readFileSync(join(here, 'package.json'), 'utf8')).version;
const header = (lang) =>
  `${lang === 'scss' ? '//' : '/*'} @salemcobalt/tokens ${version} — generated from src/ by Style Dictionary. Do not edit.${lang === 'scss' ? '' : ' */'}\n`;

const isThemed = (token) =>
  (token.path[0] === 'color' &&
    token.path[1] !== 'white' &&
    token.path[1] !== 'black' &&
    !['neutral', 'cobalt', 'green', 'amber', 'red'].includes(token.path[1])) ||
  token.path[0] === 'elevation';
const isPrimitiveColor = (token) => token.path[0] === 'color' && !isThemed(token);

const sources = (theme) => ['src/primitives/**/*.json', 'src/global/**/*.json', `src/themes/${theme}.json`];
const common = { transforms: ['attribute/cti', 'name/kebab'], prefix: PREFIX };

StyleDictionary.registerFormat({
  name: 'css/themed',
  format: ({ dictionary, options }) => {
    const { selector, mediaDark, colorScheme } = options;
    const vars = formattedVariables({ format: 'css', dictionary, outputReferences: true, usesDtcg: true });
    const block = `${selector} {\n  color-scheme: ${colorScheme};\n${vars}\n}\n`;
    if (!mediaDark) return block;
    return `${block}\n@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="light"]) {\n    color-scheme: dark;\n${vars.replace(/^/gm, '  ')}\n  }\n}\n`;
  },
});
StyleDictionary.registerFormat({
  name: 'scss/dark-map',
  format: ({ dictionary }) =>
    `$${PREFIX}-dark: (\n${dictionary.allTokens.map((t) => `  '${t.name.replace(`${PREFIX}-`, '')}': ${t.$value},`).join('\n')}\n);\n`,
});

const build = (theme) =>
  new StyleDictionary({
    source: sources(theme),
    log: { verbosity: 'silent', warnings: 'disabled' },
    platforms: {
      css: {
        ...common,
        buildPath: 'dist/css/',
        files: [
          theme === 'light'
            ? {
                destination: 'light.css',
                format: 'css/themed',
                options: { selector: ':root, [data-theme="light"]', colorScheme: 'light' },
              }
            : {
                destination: 'dark.css',
                format: 'css/themed',
                filter: isThemed,
                options: { selector: '[data-theme="dark"]', colorScheme: 'dark', mediaDark: true },
              },
        ],
      },
      scss: {
        ...common,
        buildPath: 'dist/scss/',
        files: [
          theme === 'light'
            ? { destination: 'light.scss', format: 'scss/variables', options: { outputReferences: false } }
            : { destination: 'dark.scss', format: 'scss/dark-map', filter: isThemed },
        ],
      },
      json: {
        ...common,
        buildPath: 'dist/json/',
        files: [{ destination: `${theme}.json`, format: 'json/flat' }],
      },
    },
  });

rmSync(dist, { recursive: true, force: true });
const light = build('light');
const dark = build('dark');
await light.buildAllPlatforms();
await dark.buildAllPlatforms();
const lightTokens = (await light.getPlatformTokens('css')).allTokens;
const darkTokens = (await dark.getPlatformTokens('css')).allTokens;

// ---- CSS: light + dark + density remap, one file.
const read = (p) => readFileSync(join(dist, p), 'utf8');
const compact = lightTokens.filter((t) => t.path[0] === 'size' && t.path[1] === 'control-compact');
const density = `[data-density="compact"] {\n${compact.map((t) => `  --${PREFIX}-size-control-${t.path[2]}: var(--${t.name});`).join('\n')}\n}\n`;
writeFileSync(
  join(dist, 'css', 'tokens.css'),
  header('css') + read('css/light.css') + '\n' + read('css/dark.css') + '\n' + density,
);
rmSync(join(dist, 'css', 'light.css'));
rmSync(join(dist, 'css', 'dark.css'));

// ---- SCSS: light variables + dark map.
writeFileSync(
  join(dist, 'scss', '_tokens.scss'),
  header('scss') +
    read('scss/light.scss')
      .split('\n')
      .filter((l) => !l.startsWith('// Do not edit directly'))
      .join('\n')
      .trimStart() +
    '\n' +
    read('scss/dark.scss'),
);
rmSync(join(dist, 'scss', 'light.scss'));
rmSync(join(dist, 'scss', 'dark.scss'));

// ---- JSON: { light, dark } flat maps.
const lightJson = JSON.parse(read('json/light.json'));
const darkJson = { ...lightJson, ...JSON.parse(read('json/dark.json')) };
writeFileSync(
  join(dist, 'json', 'tokens.json'),
  JSON.stringify({ version, prefix: PREFIX, light: lightJson, dark: darkJson }, null, 2) + '\n',
);
rmSync(join(dist, 'json', 'light.json'));
rmSync(join(dist, 'json', 'dark.json'));

// ---- JS + d.ts: nested object; themed tokens are { light, dark }.
const nested = {};
const darkByName = new Map(darkTokens.map((t) => [t.name, t.$value]));
for (const t of lightTokens) {
  let node = nested;
  for (const key of t.path.slice(0, -1)) node = node[key] ??= {};
  const leaf = t.path.at(-1);
  node[leaf] = isThemed(t) ? { light: t.$value, dark: darkByName.get(t.name) } : t.$value;
}
const names = lightTokens.map((t) => t.name.replace(`${PREFIX}-`, ''));
const typeLiteral = (v) =>
  JSON.stringify(v, null, 2).replace(/"([^"]+)":/g, (_, k) =>
    /^[A-Za-z_$][\w$]*$/.test(k) ? `${k}:` : `'${k}':`,
  );
mkdirSync(join(dist, 'js'), { recursive: true });
writeFileSync(
  join(dist, 'js', 'tokens.js'),
  header('js') +
    `export const prefix = ${JSON.stringify(PREFIX)};\n` +
    `export const tokens = ${JSON.stringify(nested, null, 2)};\n` +
    `export const tokenNames = ${JSON.stringify(names)};\n` +
    `export const cssVar = (name) => \`var(--${PREFIX}-\${name})\`;\n`,
);
writeFileSync(
  join(dist, 'js', 'tokens.d.ts'),
  header('js') +
    `export declare const prefix: ${JSON.stringify(PREFIX)};\n` +
    `export declare const tokens: ${typeLiteral(nested)};\n` +
    `export type TokenName = ${names.map((n) => JSON.stringify(n)).join(' | ')};\n` +
    `export declare const tokenNames: readonly TokenName[];\n` +
    `export type Theme = 'light' | 'dark';\n` +
    `export declare const cssVar: (name: TokenName) => \`var(--${PREFIX}-\${TokenName})\`;\n`,
);
void isPrimitiveColor;
console.log(`built ${lightTokens.length} tokens (${lightTokens.filter(isThemed).length} themed) → dist/`);
