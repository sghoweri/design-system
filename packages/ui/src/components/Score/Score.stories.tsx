import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Score, type ScoreTone } from './Score';
import { Card } from '../Card/Card';
import { Inline } from '../Inline/Inline';
import { Stack } from '../Stack/Stack';
import { Text } from '../Text/Text';
import { DarkTheme } from '../../stories/helpers';

const meta = {
  title: 'Components/Score',
  component: Score,
  args: {
    value: 94,
    max: 100,
    tone: 'accent',
    variant: 'tile',
    size: 'sm',
    label: 'Fit score',
    selected: false,
  },
  argTypes: {
    tone: { control: 'radio', options: ['neutral', 'accent', 'success', 'warning', 'danger'] },
    variant: { control: 'radio', options: ['tile', 'ring'] },
    size: { control: 'radio', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof Score>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const tones: ScoreTone[] = ['neutral', 'accent', 'success', 'warning', 'danger'];

/** The system holds no thresholds: the app maps a value to a tone once and passes it in. */
export const Tones: Story = {
  render: () => (
    <Stack gap="md">
      <Inline gap="sm">
        {tones.map((tone) => (
          <Score key={tone} value={81} tone={tone} label={`Fit score, ${tone}`} />
        ))}
      </Inline>
      <Inline gap="sm">
        {tones.map((tone) => (
          <Score key={tone} value={81} tone={tone} size="md" caption="fit" label={`Fit score, ${tone}`} />
        ))}
      </Inline>
      <Inline gap="md">
        {tones.map((tone) => (
          <Score key={tone} variant="ring" value={81} tone={tone} label={`Fit score, ${tone}`} />
        ))}
      </Inline>
    </Stack>
  ),
};

/** `selected`, or any selected Card / `aria-pressed="true"` / `aria-selected="true"` ancestor, turns the tile solid. */
export const Selected: Story = {
  render: () => (
    <Inline gap="sm">
      {tones.map((tone) => (
        <Score key={tone} value={81} tone={tone} selected label={`Fit score, ${tone}, selected`} />
      ))}
    </Inline>
  ),
};

/** The arc moves when the value changes (300ms, none under reduced motion); the first render draws it in place. */
export const Ring: Story = {
  render: function RingDemo() {
    const [value, setValue] = useState(62);
    return (
      <Inline gap="md" align="center">
        <Score variant="ring" value={value} label="Fit score" />
        <Score variant="ring" value={value} label="Fit score" caption="fit" tone="success" />
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          aria-label="Value"
          onChange={(e) => setValue(Number(e.target.value))}
        />
      </Inline>
    );
  },
};

/**
 * `value={null}`: not scored yet. A muted dash on the neutral tile, or inside an empty ring; no tone (any `tone` is
 * ignored) and no arc. Assistive tech reads "Fit score: not scored"; `valueText` overrides it. Inside a selected row
 * the tile turns solid accent, as a neutral one does.
 */
export const NotScored: Story = {
  name: 'Not scored',
  render: () => (
    <Inline gap="md" align="center">
      <Score value={null} label="Fit score" />
      <Score value={null} size="md" caption="fit" label="Fit score" />
      <Score value={null} selected label="Fit score" />
      <Score variant="ring" value={null} label="Fit score" />
      <Score
        variant="ring"
        value={null}
        caption="fit"
        label="Fit score"
        valueText="Fit score: waiting for a sweep"
      />
    </Inline>
  ),
};

const jobs = [
  { score: 94, tone: 'success', title: 'Staff Frontend Engineer, Design Systems', meta: 'Quillstack · 5 h' },
  { score: 88, tone: 'success', title: 'Principal Engineer, Web Platform', meta: 'Fernpoint Health · 11 h' },
  { score: 74, tone: 'accent', title: 'Lead UI Engineer', meta: 'Kestrel Mobility · 1 d' },
  { score: 58, tone: 'warning', title: 'Senior Frontend Engineer, Growth', meta: 'Orbitwise · 2 d' },
  { score: null, tone: 'neutral', title: 'Frontend Engineer, Maps', meta: 'Lumen Atlas · 3 d' },
] as const;

function InboxRowList() {
  const [selected, setSelected] = useState(0);
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 'var(--sc-spacing-3xs)' }}>
      {jobs.map((job, i) => (
        <li key={job.title}>
          <Card
            render={<button type="button" />}
            variant="plain"
            padding="sm"
            interactive
            selected={i === selected}
            aria-pressed={i === selected}
            onClick={() => setSelected(i)}
          >
            <span
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto minmax(0, 1fr)',
                gap: 'var(--sc-spacing-sm)',
                alignItems: 'center',
              }}
            >
              <Score value={job.score} tone={job.tone} label="Fit score" />
              <span style={{ display: 'grid', minInlineSize: 0 }}>
                <Text as="span" weight="semibold" truncate style={{ display: 'block' }}>
                  {job.title}
                </Text>
                <Text as="span" family="mono" size="xs" tone="muted" truncate style={{ display: 'block' }}>
                  {job.meta}
                </Text>
              </span>
            </span>
          </Card>
        </li>
      ))}
    </ul>
  );
}

/**
 * The inbox row: a plain Card rendered as a real `button` with `aria-pressed`, a `sm` Score, a title and one mono meta
 * line. Selecting a row washes it in accent and turns its Score solid; hover is a wash with no border or shadow.
 */
export const InboxRows: Story = {
  render: () => (
    <div style={{ maxWidth: 380 }}>
      <InboxRowList />
    </div>
  ),
};

export const Dark: Story = {
  render: () => (
    <DarkTheme>
      <Stack gap="md">
        <Inline gap="sm">
          {tones.map((tone) => (
            <Score key={tone} value={81} tone={tone} size="md" caption="fit" label={`Fit score, ${tone}`} />
          ))}
        </Inline>
        <Inline gap="md">
          {tones.map((tone) => (
            <Score key={tone} variant="ring" value={81} tone={tone} label={`Fit score, ${tone}`} />
          ))}
        </Inline>
        <div style={{ maxWidth: 380 }}>
          <InboxRowList />
        </div>
      </Stack>
    </DarkTheme>
  ),
};
