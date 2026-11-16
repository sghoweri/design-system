import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';
import { Logo } from './Logo';
import { Inline } from '../Inline/Inline';
import { Stack } from '../Stack/Stack';
import { Text } from '../Text/Text';
import { DarkTheme } from '../../stories/helpers';

const meta = {
  title: 'Components/Logo',
  component: Logo,
  args: { size: 'xl', wordmark: true },
  argTypes: {
    size: { control: 'radio', options: ['xs', 'sm', 'md', 'lg', 'xl', 'em'] },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The Job Sweep mark, "Tile cut-out": a rounded square in `--proto-color-accent-default` with the broom knocked out, so the surface behind shows through. `CanvasText` in forced colours. At `md` (16px) and below it uses the simplified 16px drawing. `wordmark` adds the name in the surrounding font, which then names the logo; without it the logo is an image named "Job Sweep" (`label` to change). For a size outside the Icon scale, set `--proto-logo-size`.',
      },
    },
  },
} satisfies Meta<typeof Logo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

function Gallery() {
  return (
    <Stack gap="lg">
      <Inline gap="lg" align="end">
        <Logo style={{ '--proto-logo-size': '96px' } as CSSProperties} />
        <Logo style={{ '--proto-logo-size': '48px' } as CSSProperties} />
        <Logo style={{ '--proto-logo-size': '32px' } as CSSProperties} />
        <Logo size="xl" />
        <Logo size="lg" />
        <Logo size="md" />
        <Logo size="sm" />
      </Inline>
      <Inline gap="lg">
        <Text weight="semibold">
          <Logo wordmark />
        </Text>
        <Text size="lg">
          <Logo size="xl" wordmark />
        </Text>
        <Text size="sm" tone="muted">
          <Logo size="em" wordmark />
        </Text>
      </Inline>
    </Stack>
  );
}

export const Sizes: Story = { name: 'Sizes and wordmark', render: () => <Gallery /> };

export const Dark: Story = {
  name: 'Dark theme',
  render: () => (
    <DarkTheme>
      <Gallery />
    </DarkTheme>
  ),
};

/** In a header, as the app uses it: the logo with its wordmark is the home link's name. */
export const InAHeader: Story = {
  name: 'In a header',
  render: () => (
    <a href="#home" style={{ color: 'var(--proto-color-text-default)', textDecoration: 'none' }}>
      <Logo wordmark />
    </a>
  ),
};

/**
 * The mark is centred on the wordmark's cap height in whatever face it is set in: a face whose ascent and descent sit
 * unevenly (a display face, a serif) would otherwise pull the line box, and a centred mark with it, below the letters.
 */
export const AcrossFaces: Story = {
  name: 'Across faces',
  render: () => (
    <Stack gap="md">
      {[
        'var(--proto-font-family-sans)',
        'var(--proto-font-family-mono)',
        'Georgia, "Times New Roman", serif',
        '"Arial Black", Impact, system-ui, sans-serif',
      ].map((fontFamily) => (
        <Inline key={fontFamily} gap="lg" align="center">
          <span style={{ fontFamily, fontSize: 16 }}>
            <Logo wordmark style={{ '--proto-logo-size': '30px' } as CSSProperties} />
          </span>
          <span style={{ fontFamily, fontSize: 24 }}>
            <Logo size="xl" wordmark />
          </span>
          <span style={{ fontFamily, fontSize: 12 }}>
            <Logo size="md" wordmark />
          </span>
        </Inline>
      ))}
    </Stack>
  ),
};

export const Sweep: Story = {
  name: 'Sweep on hover and focus',
  render: () => (
    <Stack gap="md">
      <Text size="sm" tone="muted">
        Hover or Tab to a link: the cut-out broom sweeps about 9° inside the tile and three specks of dust
        puff off its bristles; leaving mid-sweep eases back to the static tile. Nothing moves under reduced
        motion, and the 16px drawing (md and below) never sweeps.
      </Text>
      <Inline gap="lg" align="center">
        {(['md', 'lg', 'xl'] as const).map((size) => (
          <a
            key={size}
            href={`#${size}`}
            style={{ color: 'var(--proto-color-text-default)', textDecoration: 'none' }}
          >
            <Logo size={size} wordmark sweep />
          </a>
        ))}
        <a
          href="#big"
          style={
            {
              color: 'var(--proto-color-text-default)',
              textDecoration: 'none',
              fontSize: 'var(--proto-font-size-xl)',
              '--proto-logo-size': '30px',
            } as CSSProperties
          }
        >
          <Logo wordmark sweep />
        </a>
        <button type="button" style={{ all: 'unset', cursor: 'pointer' }}>
          <Logo size="xl" sweep label="Job Sweep home" />
        </button>
      </Inline>
    </Stack>
  ),
};
