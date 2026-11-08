import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { TextEditor, type TextEditorProps } from './TextEditor';
import { diffParts } from './diffParts';
import { fixtures, type Fixture } from './fixtures';
import { Button } from '../Button/Button';
import { Checkbox } from '../Checkbox/Checkbox';
import { Inline } from '../Inline/Inline';
import { Stack } from '../Stack/Stack';
import { Switch } from '../Switch/Switch';
import { Textarea } from '../Textarea/Textarea';
import { WordDiff } from '../WordDiff/WordDiff';
import { DarkTheme } from '../../stories/helpers';

/**
 * `@salemcobalt/ui/editor`: CodeMirror 6 with inline word diffs against `base`. Each story keeps "Show changes"
 * (passes `base` or not), "Show changes while typing" (`liveDiff`) and "Reset to base" above the editor.
 */
const meta = {
  title: 'Forms/TextEditor',
  component: TextEditor,
  parameters: { layout: 'padded' },
  args: { label: '', value: '', onValueChange: () => undefined },
} satisfies Meta<typeof TextEditor>;
export default meta;
type Story = StoryObj<typeof meta>;

// Room under the content, and scroll padding on the page, so the editor never sits on the bottom edge where
// Safari's collapsed toolbar takes taps.
function Page({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    root.style.scrollPaddingBlockEnd = '96px';
    return () => {
      root.style.scrollPaddingBlockEnd = '';
    };
  }, []);
  return (
    <Stack gap="xl" style={{ maxInlineSize: 720, paddingBlockEnd: '40vh' }}>
      {children}
    </Stack>
  );
}

function Demo({ fixture, plain = false }: { fixture: Fixture; plain?: boolean }) {
  const [value, setValue] = useState(fixture.start ?? fixture.base);
  const [showChanges, setShowChanges] = useState(true);
  const [liveDiff, setLiveDiff] = useState(false);
  // The Textarea's changes view (design doc option (d)): a read-only WordDiff under it.
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
          base={showChanges ? fixture.base : undefined}
          liveDiff={liveDiff}
        />
      )}
    </Stack>
  );
}

/** A YAML search-settings file, long enough to scroll with the keyboard open. Edit it, then leave the field. */
export const Yaml: Story = {
  name: 'YAML',
  render: () => (
    <Page>
      <Demo fixture={fixtures.yaml} />
    </Page>
  ),
};

/** A Markdown resume section: prose, so autocorrect, capitals, spellcheck and predictive text stay on. */
export const Markdown: Story = {
  render: () => (
    <Page>
      <Demo fixture={fixtures.markdown} />
    </Page>
  ),
};

/** A JSON career file with five edits already made: a reworded headline, a number, a new skill, a removed line, a changed link. */
export const Json: Story = {
  name: 'JSON',
  render: () => (
    <Page>
      <Demo fixture={fixtures.json} />
    </Page>
  ),
};

function State(props: Omit<TextEditorProps, 'value' | 'onValueChange'> & { start: string }) {
  const { start, ...rest } = props;
  const [value, setValue] = useState(start);
  return <TextEditor value={value} onValueChange={setValue} rows={3} {...rest} />;
}

/** No base (no diff), an error, read-only (focusable, selectable, no keyboard on a phone) and disabled. */
export const States: Story = {
  render: () => (
    <Page>
      <State label="notes.md" language="markdown" start="Plain editing: no `base`, so no diff." />
      <State
        label="search.yaml"
        language="yaml"
        start={'seniority: senior\n'}
        base={'seniority_floor: senior\n'}
        error="Unknown key: seniority. Did you mean seniority_floor?"
      />
      <State
        label="career.json (saved)"
        language="json"
        start={'{ "years_experience": 12 }\n'}
        description="Read only: select and copy, no editing."
        readOnly
      />
      <State
        label="search.yaml"
        language="yaml"
        start={'enabled: true\n'}
        description="Sweeps are paused."
        disabled
      />
    </Page>
  ),
};

export const Dark: Story = {
  render: () => (
    <DarkTheme>
      <Demo fixture={fixtures.json} />
    </DarkTheme>
  ),
};

/** The same three files in the plain code Textarea, for comparison. "Show changes" adds a read-only WordDiff below. */
export const TextareaComparison: Story = {
  name: 'Plain Textarea (comparison)',
  render: () => (
    <Page>
      <Demo fixture={fixtures.yaml} plain />
      <Demo fixture={fixtures.markdown} plain />
      <Demo fixture={fixtures.json} plain />
    </Page>
  ),
};
