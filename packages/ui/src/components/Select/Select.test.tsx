import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from './Select';
import { expectNoA11yViolations } from '../../../test/axe';

const options = [
  { value: 'score', label: 'Score' },
  { value: 'date', label: 'Date posted' },
  { value: 'company', label: 'Company', disabled: true },
];

describe('Select', () => {
  it('is a labelled combobox showing the placeholder, with a hidden input for forms', async () => {
    const { container } = render(
      <Select label="Sort by" name="sort" options={options} placeholder="Pick one" />,
    );
    const trigger = screen.getByRole('combobox', { name: 'Sort by' });
    expect(trigger).toHaveClass('sc-select');
    expect(trigger).toHaveTextContent('Pick one');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(container.querySelector('input[name="sort"]')).not.toBeNull();
    await expectNoA11yViolations(container);
  });

  it('opens on click, lists options with disabled state, selects one and closes', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Select label="Sort by" options={options} onValueChange={onValueChange} />);
    await user.click(screen.getByRole('combobox', { name: 'Sort by' }));
    const listbox = await screen.findByRole('listbox');
    expect(listbox).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Company' })).toHaveAttribute('aria-disabled', 'true');
    await user.click(screen.getByRole('option', { name: 'Date posted' }));
    expect(onValueChange).toHaveBeenLastCalledWith('date');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    expect(screen.getByRole('combobox', { name: 'Sort by' })).toHaveTextContent('Date posted');
  });

  it('opens below the trigger, start-aligned, so a popup wider than the trigger lines up with it', async () => {
    const user = userEvent.setup();
    render(<Select label="Sort by" options={options} />);
    await user.click(screen.getByRole('combobox', { name: 'Sort by' }));
    const listbox = await screen.findByRole('listbox');
    const positioner = listbox.closest('.sc-select__positioner');
    expect(positioner).toHaveAttribute('data-side', 'bottom');
    expect(positioner).toHaveAttribute('data-align', 'start');
  });

  it('renders the selected label for a controlled value and groups with headings', async () => {
    const user = userEvent.setup();
    render(
      <Select
        label="Status"
        value="replied"
        options={[
          { label: 'Open', options: [{ value: 'new', label: 'New' }] },
          { label: 'Done', options: [{ value: 'replied', label: 'Replied' }] },
        ]}
      />,
    );
    const trigger = screen.getByRole('combobox', { name: 'Status' });
    expect(trigger).toHaveTextContent('Replied');
    await user.click(trigger);
    await screen.findByRole('listbox');
    expect(screen.getByRole('group', { name: 'Open' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Replied' })).toHaveAttribute('aria-selected', 'true');
  });

  it('shows description and error, and disables', () => {
    render(
      <Select label="Sort" options={options} description="Applies to the list." error="Pick one." disabled />,
    );
    const trigger = screen.getByRole('combobox', { name: 'Sort' });
    expect(trigger).toHaveAccessibleDescription('Applies to the list. Pick one.');
    expect(trigger).toHaveAttribute('data-invalid');
    expect(trigger).toHaveAttribute('data-disabled');
  });

  it('shows the placeholder again when the controlled value goes back to null', () => {
    const { rerender } = render(
      <Select label="Sort by" options={options} value="date" placeholder="Pick one" />,
    );
    expect(screen.getByRole('combobox', { name: 'Sort by' })).toHaveTextContent('Date posted');
    rerender(<Select label="Sort by" options={options} value={null} placeholder="Pick one" />);
    expect(screen.getByRole('combobox', { name: 'Sort by' })).toHaveTextContent('Pick one');
  });

  it('clears from the × and from Backspace on the trigger when clearable', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <Select
        label="Sort by"
        options={options}
        defaultValue="date"
        clearable
        onValueChange={onValueChange}
      />,
    );
    const trigger = screen.getByRole('combobox', { name: 'Sort by' });
    expect(trigger).toHaveTextContent('Date posted');
    await expectNoA11yViolations(container);
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    expect(trigger).toHaveTextContent('Choose…');
    expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull();

    await user.click(trigger);
    await user.click(await screen.findByRole('option', { name: 'Score' }));
    expect(onValueChange).toHaveBeenLastCalledWith('score');
    trigger.focus();
    await user.keyboard('{Backspace}');
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    expect(trigger).toHaveTextContent('Choose…');
  });
});
