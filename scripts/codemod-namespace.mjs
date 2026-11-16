#!/usr/bin/env node
// The Protokit namespace codemod (ADR 0009, docs/protokit-rename-plan.md), driven by scripts/namespace-map.json.
//
//   node scripts/codemod-namespace.mjs [--dry-run | --check] [--exclude <path>]... <path>...
//
//   (no flag)   rewrite files in place and print the count per file
//   --dry-run   print the count per file, write nothing
//   --check     print every leftover old name (file:line) and exit 1 if there is one
//
// Paths are files or folders. Inside a git repository only tracked files are read (git ls-files), so dist/,
// node_modules/ and other ignored output are skipped. It works on text, not on a syntax tree, so one engine covers
// CSS, Sass, TS/TSX/JS, MDX, Astro, HTML (inline <style> blocks, class and style attributes, inline scripts), JSON
// (including markup escaped inside strings) and Markdown. Every rule matches whole names only, so `sc-` inside another
// word is never touched, and running it twice changes nothing.
//
// In order, it renames:
//   1. dashed idents: --sc-* → --proto-* (tokens, component knobs, anchor names, names built at runtime)
//   2. Sass variables: $sc-* → $proto-*; data attributes: data-sc-* → data-proto-*
//   3. keyframes:     sc-spin → proto-spin (the names the stylesheets declare)
//   4. classes:       sc-<block>[__<element>] → <ns>-proto-<block>[__<element>], for every block in the map,
//                     including partial names such as 'sc-dialog__' used as prefixes in tests
//   5. token names:   sc-<category>-* → proto-<category>-* (keys of tokens.json, e.g. `sc-color-${name}`)
//   6. layers:        @layer sc → @layer proto, in layer statements and in layer(sc)
//   7. packages:      @salemcobalt/ui → @protokit/ui, @salemcobalt/tokens → @protokit/tokens
// Anything else that still starts with sc- (an id such as `sc-logo-${id}`) is left alone and reported by --check.
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
export const defaultMap = JSON.parse(readFileSync(join(here, 'namespace-map.json'), 'utf8'));

const TEXT = new Set([
  '.css',
  '.scss',
  '.ts',
  '.tsx',
  '.mts',
  '.cts',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
  '.md',
  '.mdx',
  '.astro',
  '.html',
  '.txt',
  '.yml',
  '.yaml',
  '.svg',
  '.sh',
]);
const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  '.git',
  'storybook-static',
  '.astro',
  'coverage',
  '.nx',
  '.turbo',
]);
const SKIP_FILES = new Set(['pnpm-lock.yaml', 'CHANGELOG.md']);
// History, the rename plan (which names old and new side by side) and this tool's own sources keep the old names.
// These paths are this repo's; in another repo they match nothing.
const DEFAULT_EXCLUDES = [
  'docs/adr/',
  'docs/screenshots/',
  'docs/protokit-rename-plan.md',
  'DESIGN_SYSTEM_BRIEF.md',
  'scripts/namespace-map.json',
  'scripts/namespace-map.mjs',
  'scripts/codemod-namespace.mjs',
  'scripts/codemod-namespace.test.mjs',
];

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

export function transform(text, map = defaultMap) {
  const { from, to } = map;
  let count = 0;
  const sub = (re, fn) => {
    text = text.replace(re, (...args) => {
      const out = typeof fn === 'function' ? fn(...args) : fn;
      if (out !== args[0]) count++;
      return out;
    });
  };

  // 1–2. Dashed idents and Sass variables: a pure prefix change, also where the prefix is written on its own in prose
  // (`--sc-` prefixed, `$sc-*` variables). Then data attributes the system owns: data-sc-* → data-proto-*.
  sub(new RegExp(`(?<![\\w-])--${from}-`, 'g'), `--${to}-`);
  sub(new RegExp(`(?<![\\w$-])\\$${from}-`, 'g'), () => `$${to}-`);
  sub(new RegExp(`(?<![\\w-])data-${from}-(?=[a-z0-9])`, 'g'), `data-${to}-`);

  // 3–5. Names: keyframes, classes, token names. A name is `sc-` plus [a-z0-9_-]+, not inside a longer word.
  const categories = map.tokenCategories;
  sub(new RegExp(`(?<![\\w$-])${from}-([a-z0-9][a-z0-9_-]*)(?![\\w-])`, 'g'), (whole, body) => {
    if (map.keyframes[whole]) return map.keyframes[whole];
    const [block, ...element] = body.split('__');
    const ns = map.blocks[block];
    if (ns) return `${ns}-${to}-${block}${body.includes('__') ? `__${element.join('__')}` : ''}`;
    if (categories.some((c) => body === c || body.startsWith(`${c}-`))) return `${to}-${body}`;
    return whole;
  });

  // 6. Cascade layers.
  const layerName = new RegExp(`(?<![\\w-])${from}(?![\\w-])`, 'g');
  sub(/@layer\s+[^;{\n]+/g, (stmt) => stmt.replace(layerName, to));
  sub(new RegExp(`layer\\(\\s*${from}\\s*\\)`, 'g'), `layer(${to})`);

  // 7. Package names.
  for (const [old, next] of Object.entries(map.packages ?? {}))
    sub(new RegExp(`${escape(old)}(?![\\w-])`, 'g'), next);

  return { text, count };
}

export function leftovers(text, map = defaultMap) {
  const { from } = map;
  const res = [
    // Any `sc-` that does not continue a word, including inside hyphenated names (`cm-sc-removed`) and patterns
    // (`(sc-[\w-]+)`), which the rename rules leave for a person to decide.
    new RegExp(`(?<![A-Za-z0-9_])${from}-`, 'g'),
    new RegExp(`@layer\\s+[^;{\\n]*(?<![\\w-])${from}(?![\\w-])`, 'g'),
    new RegExp(`layer\\(\\s*${from}\\s*\\)`, 'g'),
    ...Object.keys(map.packages ?? {}).map((p) => new RegExp(`${escape(p)}(?![\\w-])`, 'g')),
  ];
  const found = [];
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    for (const re of res)
      for (const m of line.matchAll(re))
        found.push({ line: i + 1, column: m.index + 1, match: m[0], text: line.trim() });
  });
  return found.sort((a, b) => a.line - b.line || a.column - b.column);
}

function listFiles(paths, excludes) {
  const cwd = process.cwd();
  let files;
  try {
    files = execFileSync('git', ['ls-files', '-z', '--', ...paths], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .split('\0')
      .filter(Boolean);
  } catch {
    files = [];
    const walk = (p) => {
      const s = statSync(p);
      if (s.isDirectory()) {
        for (const e of readdirSync(p)) if (!SKIP_DIRS.has(e)) walk(join(p, e));
      } else files.push(relative(cwd, p));
    };
    for (const p of paths) walk(resolve(cwd, p));
  }
  return files.filter((f) => {
    const parts = f.split(/[\\/]/);
    if (parts.some((p) => SKIP_DIRS.has(p)) || SKIP_FILES.has(parts.at(-1))) return false;
    if (!TEXT.has(extname(f).toLowerCase())) return false;
    const posix = f.split(sep).join('/');
    return !excludes.some((x) => posix === x || posix.startsWith(x.endsWith('/') ? x : `${x}/`));
  });
}

function main(argv) {
  const mode = argv.includes('--check') ? 'check' : argv.includes('--dry-run') ? 'dry-run' : 'write';
  const excludes = [...DEFAULT_EXCLUDES];
  const paths = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--exclude') excludes.push(argv[++i]);
    else if (!argv[i].startsWith('--')) paths.push(argv[i]);
  }
  if (!paths.length) {
    console.error('usage: codemod-namespace.mjs [--dry-run | --check] [--exclude <path>]... <path>...');
    process.exit(2);
  }
  const files = listFiles(paths, excludes);
  let total = 0;
  let changed = 0;
  let left = 0;
  for (const f of files) {
    const before = readFileSync(f, 'utf8');
    if (mode === 'check') {
      for (const l of leftovers(before)) {
        left++;
        console.log(`${f}:${l.line}:${l.column}  ${l.match}  ${l.text.slice(0, 120)}`);
      }
      continue;
    }
    const { text, count } = transform(before);
    if (!count) continue;
    total += count;
    changed++;
    console.log(`${String(count).padStart(6)}  ${f}`);
    if (mode === 'write') writeFileSync(f, text);
  }
  if (mode === 'check') {
    console.log(
      left
        ? `\n${left} leftover old name(s) in ${files.length} files`
        : `no old names in ${files.length} files`,
    );
    process.exit(left ? 1 : 0);
  }
  console.log(
    `\n${total} renames in ${changed} of ${files.length} files${mode === 'dry-run' ? ' (dry run: nothing written)' : ''}`,
  );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  main(process.argv.slice(2));
