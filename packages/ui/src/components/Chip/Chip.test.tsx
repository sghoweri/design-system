import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Chip } from './Chip';
import { FilterIcon } from '../../icons/icons.gen';
import { expectNoA11yViolations } from '../../../test/axe';

describe('Chip', () => {
  it('is plain text with a decorative icon when it has no handlers', async () => {
    const { container } = render(
      <Chip icon={<FilterIcon />} tone="info" size="sm">
        Remote
      </Chip>,
    );
    const chip = screen.getByText('Remote').closest('.sc-chip')!;
    expect(chip.tagName).toBe('SPAN');
    expect(chip).toHaveAttribute('data-tone', 'info');
    expect(chip).toHaveAttribute('data-size', 'sm');
    expect(chip.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('button')).toBeNull();
    await expectNoA11yViolations(container);
  });

  it('is a pressed toggle button with onClick and selected', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { container } = render(
      <Chip selected onClick={onClick}>
        Applied
      </Chip>,
    );
    const button = screen.getByRole('button', { name: 'Applied', pressed: true });
    expect(button.closest('.sc-chip')).toHaveAttribute('data-selected');
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
    await expectNoA11yViolations(container);
  });

  it('removes from the × and from Backspace or Delete on the chip, naming the × after the text', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const onClick = vi.fn();
    const { container } = render(
      <Chip onClick={onClick} onRemove={onRemove}>
        Remote
      </Chip>,
    );
    const remove = screen.getByRole('button', { name: 'Remove Remote' });
    await user.click(remove);
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
    screen.getByRole('button', { name: 'Remote' }).focus();
    await user.keyboard('{Backspace}');
    await user.keyboard('{Delete}');
    expect(onRemove).toHaveBeenCalledTimes(3);
    await expectNoA11yViolations(container);
  });

  it('takes a custom remove label and ignores removal while disabled', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <Chip onRemove={onRemove} removeLabel="Clear location" disabled>
        <em>Boston</em>
      </Chip>,
    );
    const remove = screen.getByRole('button', { name: 'Clear location' });
    expect(remove).toBeDisabled();
    await user.click(remove);
    expect(onRemove).not.toHaveBeenCalled();
  });
});
