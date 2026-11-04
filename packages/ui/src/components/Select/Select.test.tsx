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
});
