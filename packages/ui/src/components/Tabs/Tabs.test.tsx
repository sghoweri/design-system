import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs } from './Tabs';
import { InboxIcon } from '../../icons/icons.gen';
import { expectNoA11yViolations } from '../../../test/axe';

function Example({ onValueChange }: { onValueChange?: (v: string) => void }) {
  return (
    <Tabs.Root defaultValue="inbox" onValueChange={onValueChange}>
      <Tabs.List aria-label="Inbox sections">
        <Tabs.Tab value="inbox" icon={<InboxIcon />} count={12}>
          Inbox
        </Tabs.Tab>
        <Tabs.Tab value="applied">Applied</Tabs.Tab>
        <Tabs.Tab value="archive" disabled>
          Archive
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="inbox">Inbox content</Tabs.Panel>
      <Tabs.Panel value="applied">Applied content</Tabs.Panel>
      <Tabs.Panel value="archive">Archive content</Tabs.Panel>
    </Tabs.Root>
  );
}

describe('Tabs', () => {
  it('renders a labelled tablist with the default tab active and only its panel shown', async () => {
    const { container } = render(<Example />);
    expect(screen.getByRole('tablist', { name: 'Inbox sections' })).toHaveClass('sc-tabs__list');
    const inbox = screen.getByRole('tab', { name: 'Inbox 12' });
    expect(inbox).toHaveAttribute('aria-selected', 'true');
    expect(inbox).toHaveAttribute('data-active');
    expect(screen.getByRole('tab', { name: 'Archive' })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Inbox content');
    expect(screen.queryByText('Applied content')).toBeNull();
    await expectNoA11yViolations(container);
  });

  it('switches on click and with arrow keys plus Enter, reporting the value', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);
    await user.click(screen.getByRole('tab', { name: 'Applied' }));
    expect(onValueChange).toHaveBeenLastCalledWith('applied');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Applied content');
    await user.keyboard('{ArrowLeft}');
    await waitFor(() => expect(screen.getByRole('tab', { name: 'Inbox 12' })).toHaveFocus());
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith('inbox');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Inbox content');
  });

  it('is controllable', () => {
    render(
      <Tabs.Root value="b">
        <Tabs.List aria-label="x">
          <Tabs.Tab value="a">A</Tabs.Tab>
          <Tabs.Tab value="b">B</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="a">A panel</Tabs.Panel>
        <Tabs.Panel value="b">B panel</Tabs.Panel>
      </Tabs.Root>,
    );
    expect(screen.getByRole('tab', { name: 'B' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('B panel');
  });

  it('keeps the line look by default and marks the segmented variant for the stylesheet', async () => {
    const { container, rerender } = render(<Example />);
    expect(screen.getByRole('tablist')).toHaveAttribute('data-variant', 'line');
    rerender(
      <Tabs.Root defaultValue="matches">
        <Tabs.List aria-label="Inbox sections" variant="segmented">
          <Tabs.Tab value="matches" count={16}>
            Matches
          </Tabs.Tab>
          <Tabs.Tab value="handled" count={13}>
            Handled
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="matches">Matches content</Tabs.Panel>
        <Tabs.Panel value="handled">Handled content</Tabs.Panel>
      </Tabs.Root>,
    );
    expect(screen.getByRole('tablist')).toHaveAttribute('data-variant', 'segmented');
    expect(screen.getByRole('tab', { name: 'Matches 16' })).toHaveAttribute('aria-selected', 'true');
    await expectNoA11yViolations(container);
  });
});
