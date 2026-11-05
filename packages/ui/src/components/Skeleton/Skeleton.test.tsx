import { render } from '@testing-library/react';
import { Skeleton } from './Skeleton';
import { expectNoA11yViolations } from '../../../test/axe';

describe('Skeleton', () => {
  it('is a hidden text line by default and takes width and height', async () => {
    const { container } = render(<Skeleton width="50%" height={12} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveClass('sc-skeleton');
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el).toHaveAttribute('data-variant', 'text');
    expect(el.style.inlineSize).toBe('50%');
    expect(el.style.blockSize).toBe('12px');
    await expectNoA11yViolations(container);
  });

  it('renders several lines with the last marked, and circle and still variants', () => {
    const { container } = render(
      <>
        <Skeleton lines={3} />
        <Skeleton variant="circle" width={24} still />
      </>,
    );
    const lines = container.querySelectorAll('.sc-skeleton-lines > .sc-skeleton');
    expect(lines).toHaveLength(3);
    expect(lines[2]).toHaveAttribute('data-last');
    expect(container.querySelector('.sc-skeleton-lines')).toHaveAttribute('aria-hidden', 'true');
    const circle = container.querySelector('[data-variant="circle"]')!;
    expect(circle).toHaveAttribute('data-still');
    expect((circle as HTMLElement).style.inlineSize).toBe('24px');
  });
});
