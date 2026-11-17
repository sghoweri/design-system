import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactNode } from 'react';
import { ProtokitLogo } from './ProtokitLogo';
import { Inline } from '../Inline/Inline';
import { Stack } from '../Stack/Stack';
import { Text } from '../Text/Text';
import { DarkTheme } from '../../stories/helpers';

const meta = {
  title: 'Components/ProtokitLogo',
  component: ProtokitLogo,
  argTypes: { motion: { control: 'radio', options: ['always', 'hover'] } },
  parameters: {
    docs: {
      description: {
        component:
          'Protokit\'s header logo: the Proton mark as the P, then "rotokit", set at the P\'s cap height on the stem\'s foot. The electron circles all the time by default (`motion="hover"` for hover and focus only), and parks under reduced motion. 32px tall, or `--proto-protokit-logo-size`; no electron under 32px. Stem, ring and name take the inherited colour.',
      },
    },
  },
} satisfies Meta<typeof ProtokitLogo>;
export default meta;
type Story = StoryObj<typeof meta>;

const size = (n: number) => ({ '--proto-protokit-logo-size': `${n}px` }) as CSSProperties;

/** A header bar like the docs site's: 56px tall, the logo 32px in its home link, then nav links. */
function Header() {
  const link: CSSProperties = { color: 'var(--proto-color-text-default)', textDecoration: 'none' };
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--proto-spacing-lg)',
        blockSize: 56,
        paddingInline: 'var(--proto-spacing-lg)',
        borderBlockEnd: 'var(--proto-border-width-hairline) solid var(--proto-color-border-default)',
        background: 'var(--proto-color-surface-canvas)',
      }}
    >
      <a href="#home" style={{ ...link, display: 'inline-flex' }}>
        <ProtokitLogo />
      </a>
      <Inline gap="md">
        <a href="#components" style={link}>
          Components
        </a>
        <a href="#workshop" style={link}>
          Workshop
        </a>
      </Inline>
    </header>
  );
}

export const InTheHeader: Story = {
  name: 'In the header',
  render: () => (
    <Stack gap="lg">
      <Header />
      <DarkTheme>
        <Header />
      </DarkTheme>
    </Stack>
  ),
};

function Row({ children }: { children: ReactNode }) {
  return (
    <Inline gap="xl" align="end">
      {children}
    </Inline>
  );
}

/** 64, 40 and 32 (the electron shows) and 24 (it does not). */
export const Sizes: Story = {
  render: () => (
    <Stack gap="md">
      <Row>
        {[64, 40, 32, 24].map((n) => (
          <ProtokitLogo key={n} style={size(n)} />
        ))}
      </Row>
      <Text size="sm" tone="muted">
        No electron under 32px: it would be a smudge beside the nucleus.
      </Text>
    </Stack>
  ),
};

export const Playground: Story = {
  render: (args) => (
    <a href="#home" style={{ color: 'var(--proto-color-text-default)', textDecoration: 'none' }}>
      <ProtokitLogo {...args} />
    </a>
  ),
  args: { style: size(48) },
};
