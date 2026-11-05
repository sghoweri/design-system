import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';
import { Button } from '../Button/Button';
import { InboxIcon } from '../../icons/icons.gen';
import { expectNoA11yViolations } from '../../../test/axe';

describe('EmptyState', () => {
  it('renders title, description, a hidden icon and the actions', async () => {
    const { container } = render(
      <EmptyState icon={<InboxIcon />} title="No applications yet" description="Postings show up here.">
        <Button>Add a job</Button>
      </EmptyState>,
    );
    expect(screen.getByText('No applications yet')).toHaveClass('sc-empty-state__title');
    expect(screen.getByText('Postings show up here.')).toHaveClass('sc-empty-state__description');
    expect(container.querySelector('.sc-empty-state__icon')).toHaveAttribute('aria-hidden', 'true');
    expect(
      screen.getByRole('button', { name: 'Add a job' }).closest('.sc-empty-state__actions'),
    ).not.toBeNull();
    expect(container.firstElementChild).toHaveAttribute('data-size', 'md');
    await expectNoA11yViolations(container);
  });

  it('takes size and as, and omits empty slots', () => {
    const { container } = render(
      <EmptyState as="section" size="sm" title="Nothing here" aria-label="Empty" />,
    );
    const root = container.firstElementChild!;
    expect(root.tagName).toBe('SECTION');
    expect(root).toHaveAttribute('data-size', 'sm');
    expect(root.querySelector('.sc-empty-state__icon')).toBeNull();
    expect(root.querySelector('.sc-empty-state__description')).toBeNull();
    expect(root.querySelector('.sc-empty-state__actions')).toBeNull();
  });
});
