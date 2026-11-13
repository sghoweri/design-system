import { render, screen, within } from '@testing-library/react';
import { ReasonList } from './ReasonList';
import { ArchiveIcon } from '../../icons/icons.gen';
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

  describe('empty', () => {
    it('says so in one line in place of the list: the heading, then the sentence, no empty list', async () => {
      const { container } = render(
        <>
          <Heading level={3} size="overline" id="against">
            Against
          </Heading>
          <ReasonList
            tone="against"
            empty="No cons flagged."
            aria-labelledby="against"
            className="extra"
            id="cons"
          />
        </>,
      );
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
      const line = screen.getByText('No cons flagged.').closest('p');
      expect(line).toHaveClass('sc-reason-list__empty', 'extra');
      expect(line).toHaveAttribute('id', 'cons');
      expect(line).toHaveAttribute('data-tone', 'against');
      expect(line).toHaveAttribute('data-size', 'md');
      // A paragraph can't be named; the heading above is read first.
      expect(line).not.toHaveAttribute('aria-labelledby');
      expect(line).not.toHaveAttribute('aria-label');
      await expectNoA11yViolations(container);
    });

    it('leads against and gap with a decorative check, for with nothing', async () => {
      const { container } = render(
        <>
          <ReasonList tone="for" empty="No pros flagged." aria-label="For" />
          <ReasonList tone="against" empty="No cons flagged." aria-label="Against" />
          <ReasonList tone="gap" size="sm" divider empty="No gaps flagged." aria-label="Gaps" />
        </>,
      );
      const [pros, cons, gaps] = container.querySelectorAll('.sc-reason-list__empty');
      expect(pros!.querySelector('.sc-reason-list__empty-icon')).toBeNull();
      expect(cons!.querySelector('.sc-reason-list__empty-icon svg')).toBeInTheDocument();
      expect(cons!.querySelector('.sc-reason-list__empty-icon')).toHaveAttribute('aria-hidden', 'true');
      expect(gaps!.querySelector('.sc-reason-list__empty-icon svg')).toBeInTheDocument();
      expect(gaps).toHaveAttribute('data-size', 'sm');
      expect(gaps).toHaveAttribute('data-divider');
      expect(cons).toHaveTextContent(/^No cons flagged\.$/);
      await expectNoA11yViolations(container);
    });

    it('takes another icon, or none, through emptyIcon', () => {
      const { container } = render(
        <>
          <ReasonList tone="against" empty="Nothing against" emptyIcon={null} />
          <ReasonList tone="for" empty="Nothing for yet" emptyIcon={<ArchiveIcon size="em" />} />
        </>,
      );
      const [against, pros] = container.querySelectorAll('.sc-reason-list__empty');
      expect(against!.querySelector('.sc-reason-list__empty-icon')).toBeNull();
      expect(pros!.querySelector('.sc-reason-list__empty-icon svg')).toBeInTheDocument();
    });

    it('counts only real items: false, null, empty strings and empty fragments are none', () => {
      const flagged: string[] = [];
      render(
        <ReasonList tone="gap" empty="No gaps flagged." aria-label="Gaps">
          {false}
          {null}
          {''}
          <>
            {flagged.map((r) => (
              <ReasonList.Item key={r}>{r}</ReasonList.Item>
            ))}
            <>{undefined}</>
          </>
        </ReasonList>,
      );
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
      expect(screen.getByText('No gaps flagged.')).toBeInTheDocument();
    });

    it('renders the list when there is an item, even inside a fragment', () => {
      render(
        <ReasonList tone="gap" empty="No gaps flagged." aria-label="Gaps">
          {false}
          <>
            <ReasonList.Item>One legacy app in scope</ReasonList.Item>
          </>
        </ReasonList>,
      );
      expect(within(screen.getByRole('list', { name: 'Gaps' })).getAllByRole('listitem')).toHaveLength(1);
      expect(screen.queryByText('No gaps flagged.')).not.toBeInTheDocument();
    });

    it('keeps the empty list as before without empty', () => {
      render(<ReasonList tone="against" aria-label="Against" />);
      const list = screen.getByRole('list', { name: 'Against' });
      expect(list.children).toHaveLength(0);
      expect(document.querySelector('.sc-reason-list__empty')).toBeNull();
    });
  });
});
