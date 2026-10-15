// Regenerates color primitives and the themed color/elevation tokens from OKLCH parameters.
// Run: pnpm generate:color  (then review the diff of src/).
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, '..', 'src');

const clamp01 = (x) => Math.min(1, Math.max(0, x));
function oklchToLinearSrgb(L, C, h) {
  const hr = (h * Math.PI) / 180;
  const a = C * Math.cos(hr),
    b = C * Math.sin(hr);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3,
    m = m_ ** 3,
    s = s_ ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}
const inGamut = (rgb) => rgb.every((c) => c >= -0.0005 && c <= 1.0005);
const gamma = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
export function oklch(L, C, h) {
  let c = C,
    rgb = oklchToLinearSrgb(L, c, h);
  while (!inGamut(rgb) && c > 0) {
    c -= 0.002;
    rgb = oklchToLinearSrgb(L, c, h);
  }
  return (
    '#' +
    rgb
      .map((v) =>
        Math.round(clamp01(gamma(clamp01(v))) * 255)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}

// Shared lightness ladder and chroma envelope for the chromatic scales.
const ladder = {
  50: 0.975,
  100: 0.945,
  200: 0.89,
  300: 0.81,
  400: 0.715,
  500: 0.62,
  600: 0.53,
  700: 0.46,
  800: 0.39,
  900: 0.31,
  950: 0.24,
};
const envelope = {
  50: 0.12,
  100: 0.25,
  200: 0.45,
  300: 0.7,
  400: 0.9,
  500: 1,
  600: 1,
  700: 0.92,
  800: 0.8,
  900: 0.62,
  950: 0.5,
};
const hues = {
  cobalt: { h: 263, peak: 0.215 },
  green: { h: 152, peak: 0.17 },
  amber: { h: 72, peak: 0.165 },
  red: { h: 24, peak: 0.205 },
};
const neutralLadder = {
  0: 1.0,
  50: 0.985,
  100: 0.965,
  200: 0.93,
  300: 0.885,
  400: 0.79,
  500: 0.65,
  600: 0.555,
  700: 0.46,
  800: 0.37,
  900: 0.29,
  950: 0.225,
  1000: 0.175,
};

const color = {
  white: { $value: '#ffffff', $type: 'color', $description: 'Primitive.' },
  black: {
    $value: oklch(0.13, 0.012, 263),
    $type: 'color',
    $description: 'Primitive. Deepest dark surface.',
  },
};
color.neutral = {};
for (const [step, L] of Object.entries(neutralLadder)) {
  const c = step === '0' ? 0 : L > 0.9 ? 0.004 : L > 0.5 ? 0.009 : 0.012;
  color.neutral[step] = {
    $value: oklch(L, c, 263),
    $type: 'color',
    $description: 'Primitive. Cool neutral, OKLCH hue 263.',
  };
}
for (const [name, { h, peak }] of Object.entries(hues)) {
  color[name] = {};
  for (const [step, L] of Object.entries(ladder))
    color[name][step] = {
      $value: oklch(L, peak * envelope[step], h),
      $type: 'color',
      $description: `Primitive. OKLCH hue ${h}.`,
    };
}
writeFileSync(join(src, 'primitives', 'color.json'), JSON.stringify({ color }, null, 2) + '\n');

// Semantic tokens: [light alias, dark alias, description]
const ref = (p) => `{color.${p}}`;
const semantic = {
  surface: {
    canvas: ['neutral.50', 'neutral.1000', 'App background behind everything.'],
    default: ['white', 'neutral.950', 'Default content surface: Card, panels.'],
    raised: ['white', 'neutral.900', 'Floating surfaces: Dialog, menus. Pair with elevation 2 or 3.'],
    sunken: ['neutral.100', 'black', 'Inset wells and code blocks.'],
    hover: ['neutral.100', 'neutral.900', 'Hover wash on rows and ghost controls.'],
    active: ['neutral.200', 'neutral.800', 'Pressed wash on rows and ghost controls.'],
    backdrop: ['#0b0d1699', '#00000099', 'Dialog scrim, 60% alpha.'],
  },
  text: {
    default: ['neutral.1000', 'neutral.50', 'Body and headings on every surface token.'],
    muted: ['neutral.700', 'neutral.400', 'Secondary text and metadata on every surface token.'],
    subtle: [
      'neutral.600',
      'neutral.500',
      'Placeholders and disabled labels; 4.5:1 on surface.default only.',
    ],
    'on-accent': ['white', 'neutral.1000', 'Text on accent.default and accent.hover.'],
    'on-status': ['white', 'neutral.1000', 'Text on success.solid, warning.solid and danger.solid.'],
    link: ['cobalt.700', 'cobalt.300', 'Inline links on surface.canvas and surface.default.'],
  },
  border: {
    default: ['neutral.300', 'neutral.800', 'Structural borders: Card, Kbd, dividers, Dialog edge.'],
    strong: [
      'neutral.500',
      'neutral.600',
      'Borders that carry meaning (secondary Button); 3:1 on every surface.',
    ],
    focus: ['cobalt.600', 'cobalt.400', 'Focus ring: 2px solid, offset 2px.'],
  },
  accent: {
    default: ['cobalt.600', 'cobalt.400', 'Primary Button fill, selection, active indicators.'],
    hover: ['cobalt.700', 'cobalt.300', 'Primary Button hover.'],
    active: ['cobalt.800', 'cobalt.200', 'Primary Button pressed.'],
    subtle: ['cobalt.50', 'cobalt.950', 'Soft accent Badge fill, selected row wash.'],
    text: ['cobalt.700', 'cobalt.300', 'Text on accent.subtle and surface.default.'],
  },
  success: {
    subtle: ['green.50', 'green.950', 'Soft success Badge fill.'],
    text: ['green.800', 'green.300', 'Text on success.subtle and surface.default.'],
    solid: ['green.700', 'green.400', 'Solid success Badge fill.'],
  },
  warning: {
    subtle: ['amber.50', 'amber.950', 'Soft warning Badge fill.'],
    text: ['amber.900', 'amber.300', 'Text on warning.subtle and surface.default.'],
    solid: ['amber.700', 'amber.400', 'Solid warning Badge fill.'],
  },
  danger: {
    subtle: ['red.50', 'red.950', 'Soft danger Badge fill.'],
    text: ['red.800', 'red.300', 'Text on danger.subtle and surface.default.'],
    solid: ['red.700', 'red.400', 'Danger Button fill and solid danger Badge.'],
    hover: ['red.800', 'red.300', 'Danger Button hover.'],
  },
};
const elevation = {
  0: ['none', 'none', 'Flat. Card default, Badge, Button.'],
  1: [
    '0 1px 2px rgba(14, 17, 22, 0.06), 0 1px 3px rgba(14, 17, 22, 0.1)',
    '0 1px 2px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.5)',
    'Elevated Card and interactive Card hover.',
  ],
  2: [
    '0 2px 4px rgba(14, 17, 22, 0.06), 0 6px 16px -4px rgba(14, 17, 22, 0.14)',
    '0 2px 4px rgba(0, 0, 0, 0.5), 0 8px 20px -4px rgba(0, 0, 0, 0.6)',
    'Menus, popovers, toasts.',
  ],
  3: [
    '0 4px 8px rgba(14, 17, 22, 0.08), 0 20px 48px -12px rgba(14, 17, 22, 0.28)',
    '0 4px 8px rgba(0, 0, 0, 0.5), 0 24px 56px -12px rgba(0, 0, 0, 0.7)',
    'Dialog.',
  ],
};
for (const [i, theme] of ['light', 'dark'].entries()) {
  const out = { color: {}, elevation: {} };
  for (const [group, entries] of Object.entries(semantic)) {
    out.color[group] = {};
    for (const [name, def] of Object.entries(entries)) {
      const v = def[i];
      out.color[group][name] = {
        $value: v.startsWith('#') ? v : ref(v),
        $type: 'color',
        $description: def[2],
      };
    }
  }
  for (const [name, def] of Object.entries(elevation))
    out.elevation[name] = { $value: def[i], $type: 'shadow', $description: def[2] };
  writeFileSync(join(src, 'themes', `${theme}.json`), JSON.stringify(out, null, 2) + '\n');
}
console.log('wrote src/primitives/color.json, src/themes/light.json, src/themes/dark.json');
