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
          'The Job Sweep mark, "Tile cut-out": a rounded square in `--sc-color-accent-default` with the broom knocked out, so the surface behind shows through. `CanvasText` in forced colours. At `md` (16px) and below it uses the simplified 16px drawing. `wordmark` adds the name in the surrounding font, which then names the logo; without it the logo is an image named "Job Sweep" (`label` to change). For a size outside the Icon scale, set `--sc-logo-size`.',
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
        <Logo style={{ '--sc-logo-size': '96px' } as CSSProperties} />
        <Logo style={{ '--sc-logo-size': '48px' } as CSSProperties} />
        <Logo style={{ '--sc-logo-size': '32px' } as CSSProperties} />
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
    <a href="#home" style={{ color: 'var(--sc-color-text-default)', textDecoration: 'none' }}>
      <Logo wordmark />
    </a>
  ),
};
