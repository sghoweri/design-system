import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from './Icon';
import * as icons from '../../icons/icons.gen';
import { iconNames } from '../../icons/icon-names.gen';
import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';
import { Inline } from '../Inline/Inline';
import { Stack } from '../Stack/Stack';
import { DarkTheme } from '../../stories/helpers';

const meta: Meta<typeof Icon> = {
  title: 'Components/Icon',
  component: Icon,
  args: { size: 'md', title: undefined },
  argTypes: { size: { control: 'radio', options: ['xs', 'sm', 'md', 'lg', 'xl', 'em'] } },
};
export default meta;
type Story = StoryObj<typeof meta>;

const toPascal = (name: string) => name.replace(/(^|-)([a-z0-9])/g, (_, __, c: string) => c.toUpperCase());
const glyphs = Object.fromEntries(
  iconNames.map((name) => [name, icons[`${toPascal(name)}Icon` as keyof typeof icons]]),
);

export const Playground: Story = {
  args: { children: <path d="M8 3v10M3 8h10" /> },
};

/** Every shipped icon. Import them by name: `import { PlayIcon } from '@salemcobalt/ui'`. */
export const AllIcons: Story = {
  name: 'All icons',
  render: (args) => (
    <ul
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: 'var(--sc-spacing-xs)',
        margin: 0,
        padding: 0,
        listStyle: 'none',
      }}
    >
      {iconNames.map((name) => {
        const Glyph = glyphs[name]!;
        return (
          <li
            key={name}
            style={{
              display: 'grid',
              justifyItems: 'center',
              gap: 'var(--sc-spacing-2xs)',
              padding: 'var(--sc-spacing-sm)',
              border: '1px solid var(--sc-color-border-default)',
              borderRadius: 'var(--sc-radius-lg)',
              fontSize: 'var(--sc-font-size-xs)',
              color: 'var(--sc-color-text-muted)',
            }}
          >
            <span style={{ color: 'var(--sc-color-text-default)' }}>
              <Glyph size={args.size} />
            </span>
            <code>{`${toPascal(name)}Icon`}</code>
          </li>
        );
      })}
    </ul>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Inline gap="md" align="end">
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Stack key={size} gap="2xs" align="center">
          <icons.BriefcaseIcon size={size} />
          <code style={{ fontSize: 'var(--sc-font-size-xs)' }}>{size}</code>
        </Stack>
      ))}
      <Stack gap="2xs" align="center">
        <span style={{ fontSize: 'var(--sc-font-size-2xl)' }}>
          <icons.BriefcaseIcon size="em" />
        </span>
        <code style={{ fontSize: 'var(--sc-font-size-xs)' }}>em</code>
      </Stack>
    </Inline>
  ),
};

/** Icons inherit `currentColor`, so they take the colour of a Button, Badge or muted text. */
export const InContext: Story = {
  name: 'In context',
  render: () => (
    <Stack gap="md">
      <Inline gap="sm">
        <Button iconStart={<icons.PlusIcon />}>Add job</Button>
        <Button variant="secondary" iconStart={<icons.RefreshIcon />}>
          Sweep now
        </Button>
        <Button variant="ghost" iconEnd={<icons.ExternalLinkIcon />}>
          Open posting
        </Button>
        <Button variant="ghost" iconStart={<icons.SignOutIcon />}>
          Sign out
        </Button>
      </Inline>
      <Inline gap="xs">
        <Badge tone="success">
          <icons.CheckIcon size="xs" /> Replied
        </Badge>
        <Badge tone="warning" size="sm">
          <icons.ClockIcon size="xs" /> Due today
        </Badge>
        <Badge tone="danger" variant="solid">
          <icons.FlagIcon size="xs" /> Flagged
        </Badge>
      </Inline>
      <p style={{ margin: 0, color: 'var(--sc-color-text-muted)' }}>
        <icons.MapPinIcon size="em" /> Boston, MA · <icons.CalendarIcon size="em" /> posted 3 days ago
      </p>
      <p style={{ margin: 0 }}>
        A labelled icon is an image: <icons.InfoIcon title="Information" /> reads as “Information”.
      </p>
    </Stack>
  ),
};

export const Dark: Story = {
  name: 'Dark theme',
  render: () => (
    <DarkTheme>
      <Inline gap="sm">
        <icons.PlayIcon size="lg" />
        <icons.PauseIcon size="lg" />
        <icons.SettingsIcon size="lg" />
        <Button iconStart={<icons.PlusIcon />}>Add job</Button>
        <Badge tone="info">
          <icons.InfoIcon size="xs" /> Screening
        </Badge>
      </Inline>
    </DarkTheme>
  ),
};
