import type { Meta, StoryObj } from '@storybook/react-vite';
import { WordDiff, type WordDiffPart } from './WordDiff';
import { Button } from '../Button/Button';
import { Card } from '../Card/Card';
import { Heading } from '../Heading/Heading';
import { Inline } from '../Inline/Inline';
import { Quote } from '../Quote/Quote';
import { Stack } from '../Stack/Stack';
import { Text } from '../Text/Text';
import { DarkTheme } from '../../stories/helpers';

// The shape a word-level diff produces: runs of same / removed / added text, each with its trailing whitespace.
const parts: WordDiffPart[] = [
  { kind: 'same', text: 'I ' },
  { kind: 'removed', text: 'helped with ' },
  { kind: 'added', text: 'led ' },
  { kind: 'same', text: 'the move from a jQuery front end to React ' },
  { kind: 'removed', text: 'and it went fairly smoothly' },
  { kind: 'added', text: 'and we cut over with zero downtime' },
  { kind: 'same', text: ', which is the kind of quiet migration your platform team is planning now.' },
];

const meta = {
  title: 'Components/WordDiff',
  component: WordDiff,
  args: { parts, size: 'sm', as: 'p' },
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md'] },
    as: { control: 'radio', options: ['p', 'div', 'span'] },
  },
} satisfies Meta<typeof WordDiff>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Strike-through and underline carry the change; screen readers hear "[removed: …]" and "[added: …]". */
export const Playground: Story = {};

function RewritePreview() {
  return (
    <Card style={{ maxWidth: 560 }}>
      <Stack gap="md">
        <Stack gap="2xs">
          <Heading level={3} size="overline">
            Paragraph rewrites
          </Heading>
          <Heading level={2} size="lg">
            Change one paragraph. Preview it first.
          </Heading>
        </Stack>
        <Quote label="You">Less modest about the migration. Mention the zero-downtime cutover.</Quote>
        <Card variant="filled" padding="sm">
          <WordDiff parts={parts} />
        </Card>
        <Inline gap="xs">
          <Button size="sm">Accept</Button>
          <Button size="sm" variant="secondary">
            Try again
          </Button>
          <Button size="sm" variant="ghost">
            Discard
          </Button>
          <Text as="span" family="mono" size="xs" tone="muted" style={{ marginInlineStart: 'auto' }}>
            1 unsaved change · save as v3
          </Text>
        </Inline>
      </Stack>
    </Card>
  );
}

/** The composed rewrite preview: the instruction as a Quote, the diff on a filled Card, actions and a mono meta line. */
export const ParagraphRewrite: Story = {
  render: () => <RewritePreview />,
};

export const Dark: Story = {
  render: () => (
    <DarkTheme>
      <RewritePreview />
    </DarkTheme>
  ),
};
