import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useMemo, useState } from 'react';
import { TextEditor } from './TextEditor';
import { diffParts } from './diffParts';
import { fixtures, type Fixture } from './fixtures';
import { Button } from '../Button/Button';
import { Card } from '../Card/Card';
import { Checkbox } from '../Checkbox/Checkbox';
import { Heading } from '../Heading/Heading';
import { Inline } from '../Inline/Inline';
import { Stack } from '../Stack/Stack';
import { Switch } from '../Switch/Switch';
import { Textarea } from '../Textarea/Textarea';
import { WordDiff } from '../WordDiff/WordDiff';

/**
 * Lab for the one-day iPhone check (job-radar docs/design/word-diff-editor.md, option (b)). CodeMirror 6 with an
 * inline word diff, from `@salemcobalt/ui/editor`. Open a story on the phone, work down the checklist, and compare
 * with the plain Textarea story.
 */
const meta = {
  title: 'Lab/TextEditor',
  component: TextEditor,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof TextEditor>;
export default meta;
type Story = StoryObj<typeof meta>;

const checks: { title: string; how: string }[] = [
  {
    title: 'Typing speed',
    how: 'Type a fast sentence in the Markdown story. Letters keep up with your thumbs, none dropped. Then do the same in the Textarea story and compare.',
  },
  {
    title: 'Autocorrect and predictive text',
    how: 'In Markdown, misspell a word and let it fix itself, then tap a word above the keyboard. Each lands once, in the right place. In YAML and JSON both stay off.',
  },
  {
    title: 'Dictation',
    how: 'Tap the mic and say a sentence. It arrives whole, and the green marks follow.',
  },
  {
    title: 'Selection handles',
    how: 'Long-press a word, then drag the handles across lines and across a struck-through word. Copy and paste somewhere: only the real text comes along, never the struck words.',
  },
  {
    title: 'Caret across a struck-through word',
    how: 'Touch and hold the space bar to move the caret past a struck-through word. It jumps over it. Backspace right after it deletes real text, never the struck word.',
  },
  {
    title: 'Paste',
    how: 'Copy a few lines from Notes and paste them mid-line. One paste, plain text, the pasted words underlined.',
  },
  {
    title: 'Shake or three-finger undo',
    how: 'Shake to undo, or swipe left with three fingers (right to redo). It undoes your last edit, not everything. Reset to base can be undone too.',
  },
  {
    title: 'Scrolling with the keyboard open',
    how: 'In the YAML story, type near the bottom, then scroll up and down with the keyboard still open. The line you type on stays above the keyboard, and nothing jumps.',
  },
  {
    title: 'Taps near the bottom',
    how: 'Tap near the bottom of the text to move the caret. The field should stay focused, and the line you type on sits well above the bottom edge.',
  },
  {
    title: 'Marks while typing',
    how: 'Off (default): the marks disappear while you type and come back when you leave the field. On: they stay, and catch up a moment after you stop typing.',
  },
  {
    title: 'No zoom, no pinching',
    how: 'Tapping into the editor must not zoom the page in. You should never need to pinch to read or edit.',
  },
];

function Checklist() {
  return (
    <Card variant="filled" padding="sm">
      <Stack gap="sm">
        <Heading level={2} size="sm">
          Try on the iPhone
        </Heading>
        {checks.map((check) => (
          <Checkbox key={check.title} label={check.title} description={check.how} />
        ))}
      </Stack>
    </Card>
  );
}

function Lab({ fixture, plain = false }: { fixture: Fixture; plain?: boolean }) {
  const [value, setValue] = useState(fixture.start ?? fixture.base);
  const [showChanges, setShowChanges] = useState(true);
  const [liveDiff, setLiveDiff] = useState(false);
  // The Textarea's changes view is option (d): a read-only WordDiff under it.
  const parts = useMemo(
    () => (plain && showChanges ? diffParts(fixture.base, value) : []),
    [plain, showChanges, fixture.base, value],
  );
  return (
    <Stack gap="sm">
      <Inline gap="sm" align="center" wrap>
        <Switch label="Show changes" checked={showChanges} onCheckedChange={setShowChanges} />
        {plain ? null : (
          <Checkbox
            label="Show changes while typing"
            checked={liveDiff}
            onCheckedChange={setLiveDiff}
            disabled={!showChanges}
          />
        )}
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setValue(fixture.base)}
          disabled={value === fixture.base}
        >
          Reset to base
        </Button>
      </Inline>
      {plain ? (
        <>
          <Textarea
            label={fixture.label}
            description={fixture.description}
            value={value}
            onValueChange={setValue}
            rows={8}
            variant="code"
            {...(fixture.language === 'markdown'
              ? { spellCheck: true, autoCorrect: 'on', autoCapitalize: 'sentences' }
              : {})}
          />
          {parts.some((p) => p.kind !== 'same') ? <WordDiff as="div" family="mono" parts={parts} /> : null}
        </>
      ) : (
        <TextEditor
          label={fixture.label}
          description={fixture.description}
          language={fixture.language}
          value={value}
          onValueChange={setValue}
          base={fixture.base}
          view={showChanges ? 'inline' : 'edit'}
          liveDiff={liveDiff}
        />
      )}
    </Stack>
  );
}

// Room under the content (and scroll padding on the page), so the editor never sits on the bottom edge where Safari's collapsed toolbar takes taps.
const pageStyle = { maxInlineSize: 720, paddingBlockEnd: '40vh' } as const;

function useScrollPadding() {
  useEffect(() => {
    const root = document.documentElement;
    root.style.scrollPaddingBlockEnd = '96px';
    return () => {
      root.style.scrollPaddingBlockEnd = '';
    };
  }, []);
}

function Page({ fixture }: { fixture: Fixture }) {
  useScrollPadding();
  return (
    <Stack gap="lg" style={pageStyle}>
      <Lab fixture={fixture} />
      <Checklist />
    </Stack>
  );
}

function Comparison() {
  useScrollPadding();
  return (
    <Stack gap="xl" style={pageStyle}>
      <Lab fixture={fixtures.yaml} plain />
      <Lab fixture={fixtures.markdown} plain />
      <Lab fixture={fixtures.json} plain />
    </Stack>
  );
}

/** A YAML search-settings file, long enough to scroll with the keyboard open. Edit it and the diff appears. */
export const YamlSearchSettings: Story = {
  args: { label: '', value: '', onValueChange: () => undefined },
  render: () => <Page fixture={fixtures.yaml} />,
};

/** A Markdown resume section: prose, so autocorrect, capitals and predictive text are on. */
export const MarkdownResume: Story = {
  args: { label: '', value: '', onValueChange: () => undefined },
  render: () => <Page fixture={fixtures.markdown} />,
};

/** A JSON career file with five edits already made: a reworded headline, a number, a new skill, a removed line, a changed link. */
export const JsonCareerFile: Story = {
  args: { label: '', value: '', onValueChange: () => undefined },
  render: () => <Page fixture={fixtures.json} />,
};

/** The same three files in the plain code Textarea, for comparison. "Show changes" adds a read-only WordDiff below. */
export const TextareaComparison: Story = {
  name: 'Plain Textarea (comparison)',
  args: { label: '', value: '', onValueChange: () => undefined },
  render: () => <Comparison />,
};
