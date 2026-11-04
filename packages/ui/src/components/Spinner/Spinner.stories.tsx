import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from './Spinner';
import { Button } from '../Button/Button';
import { Inline } from '../Inline/Inline';
import { Text } from '../Text/Text';
import { DarkTheme } from '../../stories/helpers';

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  args: { size: 'md', label: 'Loading' },
  argTypes: { size: { control: 'radio', options: ['xs', 'sm', 'md', 'lg', 'xl', 'em'] } },
} satisfies Meta<typeof Spinner>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <Inline gap="md" align="center">
      <Spinner size="xs" />
      <Spinner size="sm" />
      <Spinner />
      <Spinner size="lg" />
      <Spinner size="xl" />
      <Text size="lg" as="span">
        <Spinner size="em" decorative /> follows the text
      </Text>
    </Inline>
  ),
};

/** It takes the current colour, so it reads as part of a button, a muted line or a status tone. */
export const InContext: Story = {
  name: 'In context',
  render: () => (
    <Inline gap="md">
      <Button variant="secondary" disabled iconStart={<Spinner decorative />}>
        Queued
      </Button>
      <Text tone="muted" as="span">
        <Spinner size="sm" label="Sweeping" /> Sweeping…
      </Text>
      <Text tone="accent" as="span">
        <Spinner size="sm" decorative /> Verifying
      </Text>
    </Inline>
  ),
};

export const Dark: Story = {
  name: 'Dark theme',
  render: () => (
    <DarkTheme>
      <Inline gap="md">
        <Spinner size="lg" />
        <Button variant="secondary" disabled iconStart={<Spinner decorative />}>
          Queued
        </Button>
      </Inline>
    </DarkTheme>
  ),
};
