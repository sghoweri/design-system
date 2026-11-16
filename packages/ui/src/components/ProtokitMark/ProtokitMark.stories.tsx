import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';
import { ProtokitMark, type ProtokitMarkOrbit } from './ProtokitMark';
import { Inline } from '../Inline/Inline';
import { Stack } from '../Stack/Stack';
import { Text } from '../Text/Text';
import { DarkTheme } from '../../stories/helpers';

const meta = {
  title: 'Components/ProtokitMark',
  component: ProtokitMark,
  args: { size: 'xl' },
  argTypes: {
    size: { control: 'radio', options: ['xs', 'sm', 'md', 'lg', 'xl', 'em'] },
    orbit: { control: 'radio', options: ['inside', 'outside', false] },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Protokit\'s mark, "Proton" (brand direction 1, not yet adopted): a monogram P whose bowl is a ring around an accent nucleus. Stem and ring take `currentColor` (`--proto-color-text-default` by default), the nucleus `--proto-color-accent-default`; `CanvasText` in forced colours. Under 24px the ring is a unit heavier. An electron, parked at half past one, circles the nucleus while the surrounding link or button is hovered or focused: `orbit` is `inside` by default, `outside` around the ring, or `false` for the plain P. Not drawn under 32px. For a size outside the Icon scale, set `--proto-protokit-mark-size`.',
      },
    },
  },
} satisfies Meta<typeof ProtokitMark>;
export default meta;
type Story = StoryObj<typeof meta>;

const px = (n: number) =>
  ({
    '--proto-protokit-mark-size': `${n}px`,
  }) as CSSProperties;

/** In a link, at 48px: hover or Tab to it to see the orbit. */
export const Playground: Story = {
  render: (args) => (
    <a href="#home" aria-label="Protokit home" style={{ lineHeight: 0 }}>
      <ProtokitMark {...args} />
    </a>
  ),
  args: { style: px(48) },
};

/** The brand's proof sizes (96, 32, 16) and the Icon steps in between. */
function Gallery() {
  return (
    <Inline gap="lg" align="end">
      <ProtokitMark style={px(96)} />
      <ProtokitMark style={px(48)} />
      <ProtokitMark style={px(32)} />
      <ProtokitMark size="xl" />
      <ProtokitMark size="lg" />
      <ProtokitMark size="md" />
      <ProtokitMark size="sm" />
    </Inline>
  );
}

export const Sizes: Story = { render: () => <Gallery /> };

export const Dark: Story = {
  name: 'Dark theme',
  render: () => (
    <DarkTheme>
      <Gallery />
    </DarkTheme>
  ),
};

const link: CSSProperties = { color: 'var(--proto-color-text-default)', lineHeight: 0 };

/** One row of orbiting marks in links, at 96 and 32 (where the electron shows) and 24, 20 and 16 (where it does not). */
function OrbitRow({ orbit, label }: { orbit: ProtokitMarkOrbit; label: string }) {
  return (
    <Stack gap="xs">
      <Text size="sm" weight="semibold">
        {label}
      </Text>
      <Inline gap="lg" align="end">
        {[96, 32, 24, 20, 16].map((n) => (
          <a key={n} href={`#${orbit}-${n}`} style={link} aria-label={`Protokit home, ${n}px`}>
            <ProtokitMark orbit={orbit} style={px(n)} />
          </a>
        ))}
      </Inline>
    </Stack>
  );
}

function Orbits() {
  return (
    <Stack gap="lg">
      <OrbitRow orbit="inside" label='orbit="inside": in the counter, around the nucleus' />
      <OrbitRow orbit="outside" label='orbit="outside": around the ring, behind the stem' />
    </Stack>
  );
}

export const Orbit: Story = {
  name: 'Orbit on hover and focus',
  render: () => (
    <Stack gap="md">
      <Text size="sm" tone="muted">
        The electron rests at half past one. Hover or Tab to a mark and it circles the nucleus once every 6s;
        leaving stops it where it is, and the next hover carries on from there. Under reduced motion it stays
        parked. Not drawn under 32px.
      </Text>
      <Orbits />
    </Stack>
  ),
};

export const OrbitDark: Story = {
  name: 'Orbit, dark theme',
  render: () => (
    <DarkTheme>
      <Orbits />
    </DarkTheme>
  ),
};

/**
 * Not shipped: the orbit running all the time, for comparison. A logo that moves on its own for more than 5s needs a
 * way to pause it (WCAG 2.2.2), and a nav mark that never rests pulls the eye from the page, so the component only
 * orbits on hover and focus.
 */
export const AlwaysOn: Story = {
  args: {
    orbit: 'outside',
  },

  name: 'Alternative: always on (not shipped)',

  render: () => (
    <Stack gap="md">
      <style>{`.story-always :is(.c-proto-protokit-mark__orbit, .c-proto-protokit-mark__orbit > svg) { animation-play-state: running; }`}</style>
      <Text size="sm" tone="muted">
        For comparison only: the same orbit, running without hover. Not an option of the component (WCAG
        2.2.2).
      </Text>
      <Inline gap="lg" align="end" className="story-always">
        <ProtokitMark orbit="inside" style={px(96)} />
        <ProtokitMark orbit="outside" style={px(96)} />
        <ProtokitMark orbit="inside" style={px(32)} />
        <ProtokitMark orbit="outside" style={px(32)} />
      </Inline>
    </Stack>
  ),
};
