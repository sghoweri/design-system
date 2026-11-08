import { render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { TextEditor, type TextEditorProps } from './TextEditor';
import { expectNoA11yViolations } from '../../../test/axe';

const base = 'enabled: true\nseniority_floor: manager\n';

function Controlled(props: Partial<TextEditorProps>) {
  const [value, setValue] = useState(base.replace('manager', 'senior'));
  return (
    <TextEditor
      label="search.yaml"
      description="Search settings."
      error="Unknown key: seniority."
      language="yaml"
      base={base}
      value={value}
      onValueChange={setValue}
      {...props}
    />
  );
}

/** Waits for CodeMirror to replace the fallback Textarea. */
async function editorContent(container: HTMLElement) {
  await waitFor(() =>
    expect(container.querySelector('[data-editor="codemirror"] .cm-content')).not.toBeNull(),
  );
  return container.querySelector<HTMLElement>('.cm-content')!;
}

describe('TextEditor', () => {
  it('renders a labelled code Textarea first, in the same field chrome', async () => {
    const { container } = render(<Controlled />);
    const textarea = screen.getByLabelText('search.yaml');
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea).toHaveAccessibleDescription('Search settings. Unknown key: seniority.');
    expect(container.querySelector('.sc-field')).toHaveAttribute('data-editor', 'fallback');
    await editorContent(container); // let the swap finish inside act
  });

  it('swaps in CodeMirror as a labelled, described, multi-line textbox with the given id', async () => {
    const { container } = render(<Controlled id="settings" />);
    const content = await editorContent(container);
    expect(content).toHaveAttribute('role', 'textbox');
    expect(content).toHaveAttribute('aria-multiline', 'true');
    expect(content).toHaveAttribute('id', 'settings');
    expect(content).toHaveAttribute('aria-invalid', 'true');
    expect(content).toHaveAttribute('contenteditable', 'true');
    expect(screen.getByRole('textbox', { name: 'search.yaml' })).toBe(content);
    expect(content).toHaveAccessibleDescription('Search settings. Unknown key: seniority.');
    // The diff shows (not focused), with WordDiff's classes and screen reader words.
    expect(content.querySelector('del.sc-word-diff__removed')).toHaveTextContent('[removed: manager]');
    expect(content.querySelector('ins.sc-word-diff__added')).toHaveTextContent('senior');
    expect(content.textContent).toContain('[added: senior]');
    await expectNoA11yViolations(container);
  });

  it('is not editable when disabled, and read-only keeps the keyboard down', async () => {
    const { container, rerender } = render(<Controlled disabled />);
    const content = await editorContent(container);
    expect(content).toHaveAttribute('contenteditable', 'false');
    expect(content).toHaveAttribute('aria-disabled', 'true');
    expect(container.querySelector('.cm-editor')).toHaveAttribute('data-disabled');
    rerender(<Controlled readOnly />);
    await waitFor(() => expect(content).toHaveAttribute('aria-readonly', 'true'));
    expect(content).toHaveAttribute('inputmode', 'none');
    expect(content).toHaveAttribute('contenteditable', 'true');
  });

  it('shows no diff without a base', async () => {
    const { container } = render(<Controlled base={undefined} />);
    const content = await editorContent(container);
    expect(content.querySelector('del, ins')).toBeNull();
  });
});
