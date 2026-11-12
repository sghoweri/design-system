// Concatenates src/styles/*.css (in the order listed in src/styles/index.txt) into dist/styles.css inside @layer sc.
// A line naming a package file (`filepond/dist/filepond.css`) is resolved from node_modules, so a dependency's
// own stylesheet lands inside the layer too, version-locked to the installed package (docs/adr/0004).
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, copyFileSync } from 'node:fs';
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

// @salemcobalt/ui/fonts: the committed faces in src/fonts (woff2, their @font-face rules, the licences) go to
// dist/fonts as they are, and dist/fonts.js imports the stylesheet so the consumer's bundler serves the files from
// its own origin.
const fontsSrc = join(here, '..', 'src', 'fonts');
const fontsOut = join(here, '..', 'dist', 'fonts');
mkdirSync(fontsOut, { recursive: true });
const faces = readdirSync(fontsSrc).filter((f) => /\.(woff2|css|txt)$/.test(f));
for (const f of faces) copyFileSync(join(fontsSrc, f), join(fontsOut, f));
writeFileSync(
  join(here, '..', 'dist', 'fonts.js'),
  `// IBM Plex Sans, IBM Plex Mono and Unbounded, committed in @salemcobalt/ui (src/fonts). Import once at the app entry.\nimport './fonts/fonts.css';\n`,
);
console.log(`fonts: ${faces.filter((f) => f.endsWith('.woff2')).length} faces`);
