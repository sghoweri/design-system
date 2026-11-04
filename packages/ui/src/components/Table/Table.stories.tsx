import type { Meta, StoryObj } from '@storybook/react-vite';
import { Table } from './Table';
import { Badge } from '../Badge/Badge';
import { IconButton } from '../IconButton/IconButton';
import { Text } from '../Text/Text';
import { MoreHorizontalIcon } from '../../icons/icons.gen';
import { Compact, DarkTheme } from '../../stories/helpers';

const rows = [
  {
    role: 'Senior Design Systems Engineer',
    company: 'Linear',
    status: 'Interview',
    tone: 'success',
    score: 94,
    days: 3,
  },
  {
    role: 'Staff Frontend Engineer, Platform Experience',
    company: 'Vercel',
    status: 'Applied',
    tone: 'neutral',
    score: 88,
    days: 5,
  },
  { role: 'Design Engineer', company: 'Figma', status: 'Screening', tone: 'info', score: 86, days: 1 },
  { role: 'Lead UI Engineer', company: 'Stripe', status: 'Follow up', tone: 'warning', score: 81, days: 9 },
  {
    role: 'Principal Frontend Architect',
    company: 'Shopify',
    status: 'Rejected',
    tone: 'danger',
    score: 77,
    days: 14,
  },
] as const;

const meta: Meta<typeof Table.Root> = {
  title: 'Components/Table',
  component: Table.Root,
  args: { stickyHeader: false, density: undefined, divided: true, layout: 'auto' },
  argTypes: {
    density: { control: 'radio', options: [undefined, 'comfortable', 'compact'] },
    layout: { control: 'radio', options: ['auto', 'fixed'] },
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

function Example(props: React.ComponentProps<typeof Table.Root>) {
  return (
    <Table.Root {...props}>
      <Table.Caption>Applications, ranked by score</Table.Caption>
      <Table.Head>
        <Table.Row>
          <Table.Header width="40%">Role</Table.Header>
          <Table.Header>Company</Table.Header>
          <Table.Header>Status</Table.Header>
          <Table.Header numeric>Score</Table.Header>
          <Table.Header numeric>Days</Table.Header>
          <Table.Header width="48px">
            <span className="sc-visually-hidden">Actions</span>
          </Table.Header>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {rows.map((row, i) => (
          <Table.Row key={row.role} selected={i === 0} interactive>
            <Table.Header scope="row" truncate>
              {row.role}
            </Table.Header>
            <Table.Cell>{row.company}</Table.Cell>
            <Table.Cell>
              <Badge tone={row.tone} size="sm">
                {row.status}
              </Badge>
            </Table.Cell>
            <Table.Cell numeric>{row.score}</Table.Cell>
            <Table.Cell numeric>{row.days}</Table.Cell>
            <Table.Cell align="end">
              <IconButton label={`More actions for ${row.role}`} size="sm">
                <MoreHorizontalIcon />
              </IconButton>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
      <Table.Foot>
        <Table.Row>
          <Table.Cell colSpan={3}>
            <Text as="span" tone="muted">
              5 roles
            </Text>
          </Table.Cell>
          <Table.Cell numeric>85 avg</Table.Cell>
          <Table.Cell numeric>6 avg</Table.Cell>
          <Table.Cell />
        </Table.Row>
      </Table.Foot>
    </Table.Root>
  );
}

export const Playground: Story = { render: (args) => <Example {...args} /> };

/** `layout="fixed"` lets the role column truncate; `maxHeight` scrolls rows under a sticky header. */
export const StickyHeader: Story = {
  name: 'Sticky header, fixed layout',
  render: () => <Example stickyHeader maxHeight="200px" layout="fixed" />,
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
