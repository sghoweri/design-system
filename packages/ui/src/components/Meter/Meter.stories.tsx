import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Meter, type MeterTone } from './Meter';
import { Button } from '../Button/Button';
import { Card } from '../Card/Card';
import { Heading } from '../Heading/Heading';
import { Stack } from '../Stack/Stack';
import { Table } from '../Table/Table';
import { DarkTheme } from '../../stories/helpers';

const meta: Meta<typeof Meter> = {
  title: 'Components/Meter',
  component: Meter,
  args: {
    label: 'Shown in your inbox',
    value: 214,
    max: 1204,
    valueText: '214 of 1,204',
    tone: 'accent',
    size: 'md',
    layout: 'stacked',
  },
  argTypes: {
    tone: { control: 'radio', options: ['accent', 'success', 'warning', 'danger', 'neutral'] },
    size: { control: 'radio', options: ['sm', 'md'] },
    layout: { control: 'radio', options: ['stacked', 'inline'] },
  },
  decorators: [(Story) => <div style={{ maxWidth: 480 }}>{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const funnel = [
  ['Fetched', 1204],
  ['New', 640],
  ['Read', 588],
  ['Fit', 231],
  ['Shown', 214],
  ['Approved', 38],
  ['Applied', 12],
] as const;

function Funnel() {
  return (
    <Stack gap="xs">
      <Heading level={3} size="sm" id="funnel-heading">
        All sources, last 30 days
      </Heading>
      <ol
        aria-labelledby="funnel-heading"
        style={{ display: 'grid', gap: 'var(--sc-spacing-sm)', margin: 0, padding: 0, listStyle: 'none' }}
      >
        {funnel.map(([label, count], i) => {
          const before = i === 0 ? null : funnel[i - 1]![1];
          const kept = before ? ` · ${Math.round((count / before) * 100)}% kept` : '';
          return (
            <li key={label}>
              <Meter
                label={label}
                value={count}
                max={funnel[0][1]}
                valueText={`${count.toLocaleString('en-US')}${kept}`}
              />
            </li>
          );
        })}
      </ol>
    </Stack>
  );
}

/** Funnel rows: every step takes the first step's count as `max`, so the bars compare; the share kept is text. */
export const FunnelRows: Story = {
  name: 'Funnel',
  render: () => <Funnel />,
};

const sources = [
  { source: 'Greenhouse', fresh: 412, shown: 121, approved: 22 },
  { source: 'Lever', fresh: 188, shown: 64, approved: 11 },
  { source: 'Ashby', fresh: 96, shown: 23, approved: 5 },
  { source: 'Built In', fresh: 240, shown: 6, approved: 0 },
];

function SourceTable() {
  const top = Math.max(...sources.map((s) => s.shown));
  return (
    <Table.Root>
      <Table.Caption>By source, last 30 days</Table.Caption>
      <Table.Head>
        <Table.Row>
          <Table.Header>Source</Table.Header>
          <Table.Header numeric>New</Table.Header>
          <Table.Header width="40%">Shown</Table.Header>
          <Table.Header numeric>Approved</Table.Header>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {sources.map((s) => (
          <Table.Row key={s.source} interactive>
            <Table.Header scope="row">{s.source}</Table.Header>
            <Table.Cell numeric>{s.fresh}</Table.Cell>
            <Table.Cell>
              <Meter
                layout="inline"
                size="sm"
                label={`Shown, ${s.source}`}
                value={s.shown}
                max={top}
                tone={s.shown < 10 ? 'neutral' : 'accent'}
              />
            </Table.Cell>
            <Table.Cell numeric>{s.approved}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

/** `layout="inline"` in a table cell: the number, then a bar from the same x in every row; the label is for assistive tech. */
export const InTable: Story = {
  name: 'Inline, in a table cell',
  render: () => <SourceTable />,
};

const slots = [
  { slot: '7:00 AM', found: 40, strong: 12 },
  { slot: '12:00 PM', found: 26, strong: 9 },
  { slot: '5:00 PM', found: 31, strong: 4 },
  { slot: '9:30 PM', found: 8, strong: 0 },
];

function TimeOfDay() {
  const top = Math.max(...slots.map((s) => s.found));
  return (
    <Stack gap="md">
      {slots.map((s) => (
        <Meter
          key={s.slot}
          label={s.slot}
          value={s.found}
          max={top}
          valueText={`${s.found} found first · ${s.strong} strong`}
          mark={{ value: s.strong, label: `${s.strong} strong leads` }}
        />
      ))}
    </Stack>
  );
}

/** A mark is a part of the amount: solid from the start, the rest of the fill hatched. Its label joins `aria-valuetext`. */
export const Mark: Story = {
  name: 'Mark (a part of the value)',
  render: () => <TimeOfDay />,
};

const tones: MeterTone[] = ['accent', 'success', 'warning', 'danger', 'neutral'];

export const Tones: Story = {
  render: () => (
    <Stack gap="md">
      {tones.map((tone) => (
        <Meter key={tone} label={tone} value={62} valueText="62%" tone={tone} />
      ))}
      {tones.map((tone) => (
        <Meter key={`sm-${tone}`} label={`${tone}, small`} value={62} valueText="62%" tone={tone} size="sm" />
      ))}
    </Stack>
  ),
};

function Moving() {
  const [value, setValue] = useState(214);
  return (
    <Stack gap="sm">
      <Meter label="Shown in your inbox" value={value} max={1204} valueText={`${value} of 1,204`} />
      <Button variant="secondary" size="sm" onClick={() => setValue((v) => (v === 214 ? 820 : 214))}>
        Change the value
      </Button>
    </Stack>
  );
}

/** The fill moves on a value change with the data motion (600ms); the first render draws it in place, none under reduced motion. */
export const ValueChange: Story = {
  name: 'Value change',
  render: () => <Moving />,
};

export const Dark: Story = {
  name: 'Dark theme',
  render: () => (
    <DarkTheme>
      <Stack gap="lg">
        <Funnel />
        <TimeOfDay />
        <Card variant="elevated">
          <SourceTable />
        </Card>
      </Stack>
    </DarkTheme>
  ),
};
