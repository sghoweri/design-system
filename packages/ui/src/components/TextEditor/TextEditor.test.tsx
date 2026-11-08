import { EditorView } from '@codemirror/view';
import { act, render, screen, waitFor } from '@testing-library/react';
import { createRef, useState } from 'react';
import { TextEditor, type TextEditorHandle, type TextEditorProps } from './TextEditor';
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

  describe('ref', () => {
    it('selects a line in the fallback Textarea before CodeMirror loads', async () => {
      const ref = createRef<TextEditorHandle>();
      const { container } = render(<Controlled ref={ref} />);
      const textarea = screen.getByLabelText<HTMLTextAreaElement>('search.yaml');
      act(() => ref.current!.selectLine(2));
      expect(textarea).toHaveFocus();
      expect([textarea.selectionStart, textarea.selectionEnd]).toEqual([14, 37]); // "seniority_floor: senior"
      // The swap keeps focus and the selection.
      const content = await editorContent(container);
      expect(content).toHaveFocus();
      const { from, to } = EditorView.findFromDOM(content)!.state.selection.main;
      expect([from, to]).toEqual([14, 37]);
    });

    it('selects a line in CodeMirror and focuses it, clamped to the text', async () => {
      const ref = createRef<TextEditorHandle>();
      const { container } = render(<Controlled ref={ref} />);
      const content = await editorContent(container);
      const view = EditorView.findFromDOM(content)!;
      act(() => ref.current!.selectLine(1));
      expect(content).toHaveFocus();
      expect([view.state.selection.main.from, view.state.selection.main.to]).toEqual([0, 13]);
      act(() => ref.current!.selectLine(99)); // the empty line after the trailing newline
      expect(view.state.selection.main.from).toBe(view.state.doc.length);
      act(() => ref.current!.selectLine(0));
      expect(view.state.selection.main.from).toBe(0);
    });

    it('focus() focuses the editor; neither method does anything while disabled', async () => {
      const ref = createRef<TextEditorHandle>();
      const { container, rerender } = render(<Controlled ref={ref} />);
      const content = await editorContent(container);
      act(() => ref.current!.focus());
      expect(content).toHaveFocus();
      act(() => content.blur());
      rerender(<Controlled ref={ref} disabled />);
      await waitFor(() => expect(content).toHaveAttribute('contenteditable', 'false'));
      act(() => {
        ref.current!.focus();
        ref.current!.selectLine(2);
      });
      expect(content).not.toHaveFocus();
    });
  });
});
