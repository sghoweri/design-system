import { render, screen, within } from '@testing-library/react';
import { ReasonList } from './ReasonList';
import { Heading } from '../Heading/Heading';
import { expectNoA11yViolations } from '../../../test/axe';

describe('ReasonList', () => {
  it('is a list named by its heading, with the tone on the list', async () => {
    const { container } = render(
      <>
        <Heading level={3} size="overline" id="fits">
          Why it fits
        </Heading>
        <ReasonList tone="for" aria-labelledby="fits">
          <ReasonList.Item>
            <strong>Design system</strong> is the product
          </ReasonList.Item>
          <ReasonList.Item>Top of range clears your floor</ReasonList.Item>
        </ReasonList>
      </>,
    );
    const list = screen.getByRole('list', { name: 'Why it fits' });
    expect(list).toHaveClass('sc-reason-list');
    expect(list).toHaveAttribute('data-tone', 'for');
    expect(list).toHaveAttribute('data-size', 'md');
    expect(list).not.toHaveAttribute('data-divider');
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    expect(within(list).getAllByRole('listitem')[0]).toHaveClass('sc-reason-list__item');
    await expectNoA11yViolations(container);
  });

  it('takes the against and gap tones, the compact size and a divider', () => {
    render(
      <>
        <ReasonList tone="against" aria-label="Against">
          <ReasonList.Item>On-site five days</ReasonList.Item>
        </ReasonList>
        <ReasonList tone="gap" size="sm" divider aria-label="Watch for">
          <ReasonList.Item>One legacy app in scope</ReasonList.Item>
        </ReasonList>
      </>,
    );
    expect(screen.getByRole('list', { name: 'Against' })).toHaveAttribute('data-tone', 'against');
    const gaps = screen.getByRole('list', { name: 'Watch for' });
    expect(gaps).toHaveAttribute('data-tone', 'gap');
    expect(gaps).toHaveAttribute('data-size', 'sm');
    expect(gaps).toHaveAttribute('data-divider');
  });
});
