import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';
import { SearchIcon } from '../../icons/icons.gen';
import { expectNoA11yViolations } from '../../../test/axe';

describe('Input', () => {
  it('is a labelled native input, md by default', async () => {
    const { container } = render(<Input label="Company" name="company" placeholder="Linear" />);
    const input = screen.getByLabelText('Company');
    expect(input.tagName).toBe('INPUT');
    expect(input).toHaveAttribute('name', 'company');
    expect(input).toHaveAttribute('placeholder', 'Linear');
    expect(input).toHaveClass('sc-input');
    expect(input.closest('.sc-field')).toHaveAttribute('data-size', 'md');
    await expectNoA11yViolations(container);
  });

  it('wires description and error with aria-describedby and marks invalid', async () => {
    const { container } = render(
      <Input label="Posting URL" description="Paste the job page." error="Not a URL." type="url" required />,
    );
    const input = screen.getByLabelText(/Posting URL/);
    expect(input).toHaveAccessibleDescription('Paste the job page. Not a URL.');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('data-invalid');
    expect(input).toBeRequired();
    expect(screen.getByText('Not a URL.')).toHaveClass('sc-field__error');
    await expectNoA11yViolations(container);
  });

  it('hides the label visually but keeps the name, and shows icons', async () => {
    const { container } = render(<Input label="Search" hideLabel iconStart={<SearchIcon />} size="sm" />);
    const input = screen.getByRole('textbox', { name: 'Search' });
    expect(screen.getByText('Search')).toHaveClass('sc-visually-hidden');
    expect(input.closest('.sc-input-wrap')).toHaveAttribute('data-icon-start');
    expect(input.closest('.sc-field')).toHaveAttribute('data-size', 'sm');
    expect(container.querySelector('.sc-input__icon')).toHaveAttribute('aria-hidden', 'true');
    await expectNoA11yViolations(container);
  });

  it('reports value changes through onValueChange and onChange, and disables', async () => {
    const onValueChange = vi.fn();
    const onChange = vi.fn();
    render(<Input label="Title" onValueChange={onValueChange} onChange={onChange} />);
    await userEvent.type(screen.getByLabelText('Title'), 'ab');
    expect(onValueChange).toHaveBeenLastCalledWith('ab');
    expect(onChange).toHaveBeenCalledTimes(2);
    render(<Input label="Off" disabled />);
    expect(screen.getByLabelText('Off')).toBeDisabled();
  });
});
