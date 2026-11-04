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
});
