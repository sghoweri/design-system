import { render, screen } from '@testing-library/react';
import { Callout } from './Callout';
import { Button } from '../Button/Button';
import { expectNoA11yViolations } from '../../../test/axe';

describe('Callout', () => {
  it('is an accent block with a title, body and actions, and no live-region role', async () => {
    const { container } = render(
      <Callout
        title="Move to Interview?"
        actions={
          <>
            <Button size="sm">Accept</Button>
            <Button size="sm" variant="ghost">
              Dismiss
            </Button>
          </>
        }
      >
        From the recruiter&apos;s email on Nov 9: an interview on Nov 14 at 2pm.
      </Callout>,
    );
    const callout = container.querySelector('.sc-callout')!;
    expect(callout).toHaveAttribute('data-tone', 'accent');
    expect(callout).toHaveAttribute('data-variant', 'solid');
    expect(callout).not.toHaveAttribute('role');
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByText('Move to Interview?').tagName).toBe('P');
    expect(screen.getAllByRole('button')).toHaveLength(2);
    await expectNoA11yViolations(container);
  });

  it('takes a tone, the dashed variant and a heading level', async () => {
    const { container } = render(
      <Callout tone="danger" variant="dashed" title="Mark as rejected?" headingLevel={3}>
        A suggestion from email; nothing has changed yet.
      </Callout>,
    );
    const callout = container.querySelector('.sc-callout')!;
    expect(callout).toHaveAttribute('data-tone', 'danger');
    expect(callout).toHaveAttribute('data-variant', 'dashed');
    expect(screen.getByRole('heading', { level: 3, name: 'Mark as rejected?' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
    await expectNoA11yViolations(container);
  });
});
