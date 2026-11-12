import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { EditableChip, type EditableChipProps } from './EditableChip';
import { expectNoA11yViolations } from '../../../test/axe';

function Controlled(props: Partial<EditableChipProps> & { initial?: string }) {
  const { initial = 'frontend architect', onValueChange, ...rest } = props;
  const [value, setValue] = useState(initial);
  return (
    <EditableChip
      value={value}
      editLabel="Edit job title"
      onValueChange={(next) => {
        setValue(next);
        onValueChange?.(next);
      }}
      {...rest}
    />
  );
}

describe('EditableChip', () => {
  it('is a chip whose text is an "Edit" button, with a labelled ×', async () => {
    const { container } = render(<Controlled onRemove={() => {}} />);
    const edit = screen.getByRole('button', { name: 'Edit “frontend architect”' });
    expect(edit).not.toHaveAttribute('aria-pressed');
    expect(edit.closest('.sc-chip')).toHaveAttribute('data-editable');
    expect(screen.getByRole('button', { name: 'Remove frontend architect' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).toBeNull();
    await expectNoA11yViolations(container);
  });

  it('opens on click into a focused, auto-sized one-line field with the caret at the end', async () => {
    const user = userEvent.setup();
    const { container } = render(<Controlled />);
    await user.click(screen.getByRole('button', { name: 'Edit “frontend architect”' }));
    const field = screen.getByRole('textbox', { name: 'Edit job title' }) as HTMLTextAreaElement;
    expect(field).toHaveFocus();
    expect(field).toHaveValue('frontend architect');
    expect(field.selectionStart).toBe('frontend architect'.length);
    expect(field).toHaveAttribute('rows', '1');
    expect(field).toHaveAttribute('data-autosize');
    expect(container.firstElementChild).toHaveAttribute('data-editing');
    await expectNoA11yViolations(container);
  });

  it('opens on Enter or F2 without typing a newline, saves on Enter and puts focus back on the chip', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Controlled onValueChange={onValueChange} />);
    screen.getByRole('button', { name: 'Edit “frontend architect”' }).focus();
    await user.keyboard('{Enter}');
    const field = screen.getByRole('textbox', { name: 'Edit job title' });
    expect(field).toHaveValue('frontend architect');
    await user.type(field, '  /  lead {Enter}');
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith('frontend architect / lead');
    const chip = screen.getByRole('button', { name: 'Edit “frontend architect / lead”' });
    await waitFor(() => expect(chip).toHaveFocus());

    await user.keyboard('{F2}');
    expect(screen.getByRole('textbox', { name: 'Edit job title' })).toHaveFocus();
  });

  it('cancels on Escape without saving or letting Escape reach a dialog around it', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    // A dialog listens for Escape on the document (Base UI does).
    const outer = vi.fn((event: KeyboardEvent) => event.key);
    document.addEventListener('keydown', outer);
    render(<Controlled onValueChange={onValueChange} />);
    await user.click(screen.getByRole('button', { name: 'Edit “frontend architect”' }));
    await user.type(screen.getByRole('textbox'), ' changed');
    await user.keyboard('{Escape}');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(outer.mock.results.map((r) => r.value)).not.toContain('Escape');
    document.removeEventListener('keydown', outer);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Edit “frontend architect”' })).toHaveFocus(),
    );
  });

  it('saves when focus leaves the field, and leaves focus where it went', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <>
        <Controlled onValueChange={onValueChange} />
        <button type="button">Elsewhere</button>
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'Edit “frontend architect”' }));
    await user.type(screen.getByRole('textbox'), 's');
    await user.click(screen.getByRole('button', { name: 'Elsewhere' }));
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith('frontend architects');
    expect(screen.getByRole('button', { name: 'Elsewhere' })).toHaveFocus();
  });

  it('does not call onValueChange when nothing changed', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Controlled onValueChange={onValueChange} />);
    await user.click(screen.getByRole('button', { name: 'Edit “frontend architect”' }));
    await user.keyboard('{Enter}');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('refuses a save that validate rejects, with the message as the field’s announced error', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <Controlled
        onValueChange={onValueChange}
        validate={(next) => (next === 'staff engineer' ? '“staff engineer” is already in this list.' : null)}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Edit “frontend architect”' }));
    const field = screen.getByRole('textbox', { name: 'Edit job title' });
    await user.clear(field);
    await user.type(field, 'staff engineer{Enter}');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAccessibleDescription('“staff engineer” is already in this list.');
    expect(container.querySelector('.sc-field__error-region')).toHaveAttribute('aria-live', 'polite');
    await expectNoA11yViolations(container);

    await user.type(field, 's');
    expect(field).not.toHaveAttribute('aria-invalid');
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith('staff engineers');
  });

  it('removes when saved empty with onRemove, and reverts without it', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const onValueChange = vi.fn();
    const { unmount } = render(<Controlled onRemove={onRemove} onValueChange={onValueChange} />);
    await user.click(screen.getByRole('button', { name: 'Edit “frontend architect”' }));
    await user.clear(screen.getByRole('textbox'));
    await user.keyboard('{Enter}');
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onValueChange).not.toHaveBeenCalled();
    unmount();

    render(<Controlled onValueChange={onValueChange} />);
    await user.click(screen.getByRole('button', { name: 'Edit “frontend architect”' }));
    await user.clear(screen.getByRole('textbox'));
    await user.keyboard('{Enter}');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Edit “frontend architect”' })).toBeInTheDocument();
  });

  it('removes on Backspace or Delete, takes custom names, and does nothing while disabled', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const { rerender } = render(
      <Controlled onRemove={onRemove} editButtonLabel="Change title" removeLabel="Drop title" />,
    );
    screen.getByRole('button', { name: 'Change title' }).focus();
    await user.keyboard('{Delete}');
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Drop title' })).toBeInTheDocument();

    rerender(<Controlled onRemove={onRemove} disabled />);
    const edit = screen.getByRole('button', { name: 'Edit “frontend architect”' });
    expect(edit).toBeDisabled();
    await user.click(edit);
    expect(screen.queryByRole('textbox')).toBeNull();
  });
});
