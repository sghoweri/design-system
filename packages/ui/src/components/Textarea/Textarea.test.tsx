import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from './Textarea';
import { expectNoA11yViolations } from '../../../test/axe';

describe('Textarea', () => {
  it('is a labelled native textarea with rows, description and error', async () => {
    const { container } = render(
      <Textarea
        label="Notes"
        name="notes"
        description="Private to you."
        error="Too long."
        rows={5}
        resize="none"
      />,
    );
    const el = screen.getByLabelText('Notes');
    expect(el.tagName).toBe('TEXTAREA');
    expect(el).toHaveAttribute('rows', '5');
    expect(el).toHaveAttribute('name', 'notes');
    expect(el).toHaveAttribute('data-resize', 'none');
    expect(el).toHaveAccessibleDescription('Private to you. Too long.');
    expect(el).toHaveAttribute('aria-invalid', 'true');
    await expectNoA11yViolations(container);
  });

  it('reports value changes and defaults to 3 rows', async () => {
    const onValueChange = vi.fn();
    render(<Textarea label="Notes" onValueChange={onValueChange} />);
    const el = screen.getByLabelText('Notes');
    expect(el).toHaveAttribute('rows', '3');
    await userEvent.type(el, 'hi');
    expect(onValueChange).toHaveBeenLastCalledWith('hi');
  });

  it('variant="code" turns off spellcheck, autocorrect and autocapitalize and keeps native wrap', async () => {
    const { container } = render(<Textarea label="Markdown" variant="code" wrap="off" />);
    const textarea = screen.getByLabelText('Markdown');
    expect(textarea).toHaveAttribute('data-variant', 'code');
    expect(textarea).toHaveAttribute('spellcheck', 'false');
    expect(textarea).toHaveAttribute('autocorrect', 'off');
    expect(textarea).toHaveAttribute('autocapitalize', 'off');
    expect(textarea).toHaveAttribute('wrap', 'off');
    await expectNoA11yViolations(container);
  });

  describe('autoSize', () => {
    it('sizes with CSS field-sizing where supported: rows as a minimum, no resize handle', () => {
      const supports = vi.fn(() => true);
      vi.stubGlobal('CSS', { supports });
      render(<Textarea label="Phrase" autoSize rows={1} resize="vertical" defaultValue="frontend" />);
      const el = screen.getByLabelText('Phrase');
      expect(el).toHaveAttribute('data-autosize');
      expect(el).toHaveAttribute('data-resize', 'none');
      expect(el.style.getPropertyValue('--_rows')).toBe('1');
      expect(el.style.blockSize).toBe('');
      expect(supports).toHaveBeenCalledWith('field-sizing', 'content');
      vi.unstubAllGlobals();
    });

    it('falls back to the scrollHeight on every change without field-sizing, and keeps the caller ref', async () => {
      vi.stubGlobal('CSS', { supports: () => false });
      let height = 40;
      const spy = vi
        .spyOn(HTMLTextAreaElement.prototype, 'scrollHeight', 'get')
        .mockImplementation(() => height);
      const ref = { current: null as HTMLTextAreaElement | null };
      render(<Textarea label="Phrase" autoSize rows={1} ref={ref} />);
      const el = screen.getByLabelText('Phrase') as HTMLTextAreaElement;
      expect(ref.current).toBe(el);
      expect(el.style.blockSize).toBe('40px');
      height = 64;
      await userEvent.type(el, 'a long phrase that wraps');
      expect(el.style.blockSize).toBe('64px');
      spy.mockRestore();
      vi.unstubAllGlobals();
    });

    it('leaves the height alone without autoSize', () => {
      vi.stubGlobal('CSS', { supports: () => false });
      render(<Textarea label="Notes" />);
      const el = screen.getByLabelText('Notes');
      expect(el).not.toHaveAttribute('data-autosize');
      expect(el.style.blockSize).toBe('');
      vi.unstubAllGlobals();
    });
  });
});
