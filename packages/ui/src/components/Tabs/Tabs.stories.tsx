import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs } from './Tabs';
import { Text } from '../Text/Text';
import { Stack } from '../Stack/Stack';
import { ArchiveIcon, CheckIcon, InboxIcon } from '../../icons/icons.gen';
import { Compact, DarkTheme } from '../../stories/helpers';

const meta: Meta<typeof Tabs.Root> = {
  title: 'Components/Tabs',
  component: Tabs.Root,
  decorators: [(Story) => <div style={{ maxWidth: 480 }}>{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof meta>;

function Example({ fill = false, variant }: { fill?: boolean; variant?: 'line' | 'segmented' }) {
  return (
    <Tabs.Root defaultValue="inbox">
      <Tabs.List aria-label="Inbox sections" fill={fill} variant={variant}>
        <Tabs.Tab value="inbox" icon={<InboxIcon />} count={12}>
          Inbox
        </Tabs.Tab>
        <Tabs.Tab value="applied" icon={<CheckIcon />} count={7}>
          Applied
        </Tabs.Tab>
        <Tabs.Tab value="archive" icon={<ArchiveIcon />}>
          Archive
        </Tabs.Tab>
        <Tabs.Tab value="rejected" disabled>
          Rejected
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="inbox">
        <Text>Twelve postings ranked by score.</Text>
      </Tabs.Panel>
      <Tabs.Panel value="applied">
        <Text>Seven applications in flight.</Text>
      </Tabs.Panel>
      <Tabs.Panel value="archive">
        <Text>Nothing archived yet.</Text>
      </Tabs.Panel>
      <Tabs.Panel value="rejected">
        <Text>Hidden.</Text>
      </Tabs.Panel>
    </Tabs.Root>
  );
}

export const Playground: Story = { render: () => <Example /> };

export const Fill: Story = { name: 'Equal widths', render: () => <Example fill /> };

function Segmented() {
  return (
    <Tabs.Root defaultValue="matches">
      <Tabs.List aria-label="Inbox sections" variant="segmented">
        <Tabs.Tab value="matches" count={16}>
          Matches
        </Tabs.Tab>
        <Tabs.Tab value="below" count={3}>
          Below floor
        </Tabs.Tab>
        <Tabs.Tab value="handled" count={13}>
          Handled
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="matches">
        <Text>Sixteen postings ranked by score.</Text>
      </Tabs.Panel>
      <Tabs.Panel value="below">
        <Text>Three postings under the salary floor.</Text>
      </Tabs.Panel>
      <Tabs.Panel value="handled">
        <Text>Thirteen handled.</Text>
      </Tabs.Panel>
    </Tabs.Root>
  );
}

/** A quiet segmented control: sunken track, the active tab raised on the surface, no accent colour, plain counts. */
export const SegmentedVariant: Story = {
  name: 'Segmented',
  render: () => (
    <Stack gap="lg">
      <Segmented />
      <Example variant="segmented" />
      <Example variant="segmented" fill />
    </Stack>
  ),
};

export const SegmentedDark: Story = {
  name: 'Segmented, dark theme',
  render: () => (
    <DarkTheme>
      <Stack gap="lg">
        <Segmented />
        <Example variant="segmented" />
      </Stack>
    </DarkTheme>
  ),
};

export const CompactDensity: Story = {
  name: 'Compact density',
  render: () => (
    <Compact>
      <Example />
    </Compact>
  ),
};

export const Dark: Story = {
  name: 'Dark theme',
  render: () => (
    <DarkTheme>
      <Example />
    </DarkTheme>
  ),
};
