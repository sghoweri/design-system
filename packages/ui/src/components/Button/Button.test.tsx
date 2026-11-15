import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';
import { Kbd } from '../Kbd/Kbd';

describe('Button', () => {
  it('renders a native button with type=button and data attributes', () => {
    render(
      <Button variant="secondary" size="sm">
        Cancel
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Cancel' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('data-variant', 'secondary');
    expect(button).toHaveAttribute('data-size', 'sm');
  });

  it('defaults to primary and md', () => {
    render(<Button>Add job</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-variant', 'primary');
    expect(button).toHaveAttribute('data-size', 'md');
  });

  it('fires onClick and forwards native props', async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} id="go">
        Go
      </Button>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button')).toHaveAttribute('id', 'go');
  });

  it('sets aria-busy and ignores clicks while loading, keeping the label accessible', async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Sending
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Sending' });
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('data-loading');
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('ignores mousedown, pointerdown and keydown while loading; a cancelled mousedown moves no focus', () => {
    const onMouseDown = vi.fn();
    const onPointerDown = vi.fn();
    const onKeyDown = vi.fn();
    render(
      <Button loading onMouseDown={onMouseDown} onPointerDown={onPointerDown} onKeyDown={onKeyDown}>
        Sending
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Sending' });
    fireEvent.pointerDown(button);
    // fireEvent returns false when the default was cancelled.
    expect(fireEvent.mouseDown(button)).toBe(false);
    // Keydown keeps its default, so Tab still leaves the button.
    expect(fireEvent.keyDown(button, { key: 'ArrowDown' })).toBe(true);
    expect(onMouseDown).not.toHaveBeenCalled();
    expect(onPointerDown).not.toHaveBeenCalled();
    expect(onKeyDown).not.toHaveBeenCalled();
  });

  it('passes mousedown, pointerdown and keydown through when not loading', () => {
    const onMouseDown = vi.fn();
    const onPointerDown = vi.fn();
    const onKeyDown = vi.fn();
    render(
      <Button onMouseDown={onMouseDown} onPointerDown={onPointerDown} onKeyDown={onKeyDown}>
        Send
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Send' });
    fireEvent.pointerDown(button);
    expect(fireEvent.mouseDown(button)).toBe(true);
    fireEvent.keyDown(button, { key: 'ArrowDown' });
    expect(onMouseDown).toHaveBeenCalledTimes(1);
    expect(onPointerDown).toHaveBeenCalledTimes(1);
    expect(onKeyDown).toHaveBeenCalledTimes(1);
  });

  it('is disabled natively', () => {
    render(<Button disabled>Off</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('hides icons from assistive tech', () => {
    render(<Button iconStart={<svg data-testid="icon" />}>Label</Button>);
    expect(screen.getByTestId('icon').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('button')).toHaveAccessibleName('Label');
  });

  it('shows a shortcut hint after the label, hidden from the accessible name', () => {
    render(
      <Button shortcut={<Kbd>N</Kbd>} aria-keyshortcuts="n">
        Add a job
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Add a job' });
    expect(button).toHaveAttribute('aria-keyshortcuts', 'n');
    const hint = button.querySelector('.sc-button__shortcut')!;
    expect(hint).toHaveAttribute('aria-hidden', 'true');
    expect(hint.querySelector('kbd')).toHaveTextContent('N');
  });

  it('goes icon-only without remounting, keeping the name and hiding the shortcut', () => {
    const { rerender } = render(
      <Button iconStart={<svg />} shortcut={<Kbd>N</Kbd>} aria-keyshortcuts="n">
        Add item
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Add item' });
    expect(button).not.toHaveAttribute('data-icon-only');
    rerender(
      <Button iconStart={<svg />} shortcut={<Kbd>N</Kbd>} aria-keyshortcuts="n" iconOnly>
        Add item
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Add item' })).toBe(button);
    expect(button).toHaveAttribute('data-icon-only', 'true');
    expect(button).toHaveAttribute('aria-keyshortcuts', 'n');
  });

  it('hides the shortcut hint where there is no fine pointer, in the stylesheet', () => {
    // jsdom loads no CSS and cannot emulate pointers, so check the rule itself.
    const css = readFileSync(join(__dirname, '../../styles/button.css'), 'utf8');
    expect(css).toMatch(
      /@media not all and \(any-pointer: fine\) \{\s*\.sc-button__shortcut \{\s*display: none;/,
    );
  });
});
