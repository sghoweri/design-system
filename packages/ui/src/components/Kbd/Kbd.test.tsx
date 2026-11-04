import { render, screen } from '@testing-library/react';
import { Kbd } from './Kbd';

describe('Kbd', () => {
  it('renders a native kbd', () => {
    render(<Kbd>Esc</Kbd>);
    const key = screen.getByText('Esc');
    expect(key.tagName).toBe('KBD');
    expect(key).toHaveClass('sc-kbd');
  });

  it('groups keys with a readable label and hidden separators', () => {
    render(
      <Kbd.Group label="Command K">
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </Kbd.Group>,
    );
    const group = screen.getByRole('group', { name: 'Command K' });
    expect(group.querySelectorAll('kbd')).toHaveLength(2);
    const sep = group.querySelector('.sc-kbd-group__sep');
    expect(sep).toHaveTextContent('+');
    expect(sep).toHaveAttribute('aria-hidden', 'true');
  });

  it('omits the separator for sequences', () => {
    render(
      <Kbd.Group label="g then i" separator="space">
        <Kbd>g</Kbd>
        <Kbd>i</Kbd>
      </Kbd.Group>,
    );
    expect(screen.getByRole('group').querySelector('.sc-kbd-group__sep')).toBeNull();
  });
});
