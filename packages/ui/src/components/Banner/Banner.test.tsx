import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Banner } from './Banner';
import { Button } from '../Button/Button';
import { expectNoA11yViolations } from '../../../test/axe';

describe('Banner', () => {
  it('is a status strip with the info tone and icon by default', async () => {
    const { container } = render(<Banner>3 new postings since you looked.</Banner>);
    const banner = screen.getByRole('status');
    expect(banner).toHaveClass('sc-banner');
    expect(banner).toHaveAttribute('data-tone', 'info');
    expect(banner.querySelector('.sc-banner__icon svg')).not.toBeNull();
    expect(banner).toHaveTextContent('3 new postings since you looked.');
    await expectNoA11yViolations(container);
  });

  it('announces warning and danger as alerts and takes an action', async () => {
    const { container } = render(
      <Banner
        tone="warning"
        action={
          <Button variant="ghost" size="sm">
            Resume
          </Button>
        }
      >
        Sweeps are paused.
      </Banner>,
    );
    const banner = screen.getByRole('alert');
    expect(banner).toHaveAttribute('data-tone', 'warning');
    expect(screen.getByRole('button', { name: 'Resume' }).closest('.sc-banner__action')).not.toBeNull();
    await expectNoA11yViolations(container);
  });

  it('dismisses itself and reports it', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <Banner tone="success" dismissible onDismiss={onDismiss}>
        Saved.
      </Banner>,
    );
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('hides the icon with icon={false}, uses a neutral tone, and honours controlled open', () => {
    const { rerender } = render(
      <Banner tone="neutral" icon={false} dismissible open>
        Offline.
      </Banner>,
    );
    const banner = screen.getByRole('status');
    expect(banner.querySelector('.sc-banner__icon')).toBeNull();
    expect(banner).toHaveAttribute('data-tone', 'neutral');
    rerender(
      <Banner tone="neutral" dismissible open={false}>
        Offline.
      </Banner>,
    );
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('keeps message, action, dismiss in DOM order, so reading and focus order hold when the action wraps', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Banner
        tone="warning"
        role="status"
        dismissible
        action={
          <Button variant="ghost" size="sm">
            Choose what to cut
          </Button>
        }
      >
        This version runs to 3 pages. The template allows 2 for this seat.
      </Banner>,
    );
    const banner = screen.getByRole('status');
    expect([...banner.children].map((el) => el.className)).toEqual([
      'sc-banner__icon',
      'sc-banner__body',
      'sc-banner__action',
      expect.stringContaining('sc-banner__dismiss'),
    ]);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Choose what to cut' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Dismiss' })).toHaveFocus();
    await expectNoA11yViolations(container);
  });

  it('shows no icon with icon={false}, whatever the tone, and keeps its action', async () => {
    const { container } = render(
      <Banner
        tone="warning"
        role="status"
        icon={false}
        action={
          <Button variant="ghost" size="sm">
            Choose what to cut
          </Button>
        }
      >
        This version runs to 3 pages.
      </Banner>,
    );
    const banner = screen.getByRole('status');
    expect(banner.querySelector('.sc-banner__icon')).toBeNull();
    expect(banner.querySelector('svg')).toBeNull();
    expect(banner.firstElementChild).toHaveClass('sc-banner__body');
    expect(
      screen.getByRole('button', { name: 'Choose what to cut' }).closest('.sc-banner__action'),
    ).not.toBeNull();
    await expectNoA11yViolations(container);
  });

  it('marks the page placement only when asked, and keeps the role it is given', async () => {
    const { container, rerender } = render(<Banner tone="warning">Sweeps are paused.</Banner>);
    expect(screen.getByRole('alert')).not.toHaveAttribute('data-placement');
    rerender(
      <Banner tone="warning" placement="page" role="status">
        GitHub Actions is down.
      </Banner>,
    );
    const banner = screen.getByRole('status');
    expect(banner).toHaveAttribute('data-placement', 'page');
    expect(banner).toHaveAttribute('data-tone', 'warning');
    await expectNoA11yViolations(container);
  });
});
