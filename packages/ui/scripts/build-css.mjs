// Concatenates src/styles/*.css (in the order listed in src/styles/index.txt) into dist/styles.css inside @layer sc.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const stylesDir = join(here, '..', 'src', 'styles');
const order = readFileSync(join(stylesDir, 'index.txt'), 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter(Boolean);
const version = JSON.parse(readFileSync(join(here, '..', 'package.json'), 'utf8')).version;
const body = order
  .map((f) => `/* ---- ${f} ---- */\n${readFileSync(join(stylesDir, f), 'utf8').trim()}\n`)
  .join('\n');
mkdirSync(join(here, '..', 'dist'), { recursive: true });
writeFileSync(
  join(here, '..', 'dist', 'styles.css'),
  `/* @salemcobalt/ui ${version} — requires @salemcobalt/tokens/css. */\n@layer sc {\n${body.replace(/^/gm, '  ')}\n}\n`,
);
console.log(`styles.css: ${order.length} files`);
