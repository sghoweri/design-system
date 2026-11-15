#!/usr/bin/env node
// The var() usage check (ADR 0009, decision 5; guideline 02 rule 13): every var(--<prefix>-*) without a fallback must
// name a token or a custom property some scanned stylesheet declares. A reference with a fallback is a knob a
// consumer may set (`var(--proto-toast-offset-block-end, 0px)`), so it passes.
//
//   node scripts/check-vars.mjs [--tokens <tokens.json>] <file or folder>...
//
// --tokens defaults to packages/tokens/dist/json/tokens.json (run `pnpm build` first); its `prefix` field picks the
// prefix. Folders are scanned for .css, .scss and .astro files, whose references are checked, and for .ts and .tsx
// files, whose inline-style keys (`'--proto-text-lines': clamp`) count as declarations. Exits 1 and lists file:line
// for each unknown name.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const argv = process.argv.slice(2);
let tokensPath = 'packages/tokens/dist/json/tokens.json';
const paths = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--tokens') tokensPath = argv[++i];
  else paths.push(argv[i]);
}
if (!paths.length) {
  console.error('usage: check-vars.mjs [--tokens <tokens.json>] <file or folder>...');
  process.exit(2);
}

let tokens;
try {
  tokens = JSON.parse(readFileSync(tokensPath, 'utf8'));
} catch {
  console.error(`${tokensPath} is missing: run \`pnpm build\` first`);
  process.exit(2);
}
const prefix = `--${tokens.prefix}-`;
const declared = new Set([...Object.keys(tokens.light), ...Object.keys(tokens.dark)].map((k) => `--${k}`));

const files = [];
const scripts = [];
const walk = (p) => {
  if (statSync(p).isDirectory()) {
    for (const e of readdirSync(p)) if (e !== 'node_modules' && e !== 'dist') walk(join(p, e));
  } else if (['.css', '.scss', '.astro'].includes(extname(p))) files.push(p);
  else if (['.ts', '.tsx'].includes(extname(p)) && !/\.test\.tsx?$/.test(p)) scripts.push(p);
};
for (const p of paths) walk(p);

const sources = files.map((f) => [
  f,
  readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' ')),
]);
for (const [, text] of sources) for (const m of text.matchAll(/(--[\w-]+)\s*:/g)) declared.add(m[1]);
for (const f of scripts)
  for (const m of readFileSync(f, 'utf8').matchAll(/['"](--[\w-]+)['"]\s*:/g)) declared.add(m[1]);

let errors = 0;
for (const [file, text] of sources) {
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    for (const m of line.matchAll(/var\(\s*(--[\w-]+)\s*\)/g)) {
      if (!m[1].startsWith(prefix) || declared.has(m[1])) continue;
      errors++;
      console.log(
        `${relative(process.cwd(), file)}:${i + 1}  ${m[1]} is not a token and nothing declares it`,
      );
    }
  });
}
console.log(
  errors
    ? `\n${errors} unknown custom propert${errors === 1 ? 'y' : 'ies'}`
    : `var() check: ${files.length} files, no unknown ${prefix}* names`,
);
process.exit(errors ? 1 : 0);
