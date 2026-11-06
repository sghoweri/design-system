// Concatenates src/styles/*.css (in the order listed in src/styles/index.txt) into dist/styles.css inside @layer sc.
// A line naming a package file (`filepond/dist/filepond.css`) is resolved from node_modules, so a dependency's
// own stylesheet lands inside the layer too, version-locked to the installed package (docs/adr/0004).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const stylesDir = join(here, '..', 'src', 'styles');
const order = readFileSync(join(stylesDir, 'index.txt'), 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter(Boolean);
const version = JSON.parse(readFileSync(join(here, '..', 'package.json'), 'utf8')).version;
const require = createRequire(import.meta.url);
const pathOf = (f) => (existsSync(join(stylesDir, f)) ? join(stylesDir, f) : require.resolve(f));
const body = order.map((f) => `/* ---- ${f} ---- */\n${readFileSync(pathOf(f), 'utf8').trim()}\n`).join('\n');
mkdirSync(join(here, '..', 'dist'), { recursive: true });
writeFileSync(
  join(here, '..', 'dist', 'styles.css'),
  `/* @salemcobalt/ui ${version} — requires @salemcobalt/tokens/css. */\n@layer sc {\n${body.replace(/^/gm, '  ')}\n}\n`,
);
console.log(`styles.css: ${order.length} files`);
