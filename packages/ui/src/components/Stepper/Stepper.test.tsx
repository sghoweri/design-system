import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Stepper } from './Stepper';
import { expectNoA11yViolations } from '../../../test/axe';

const steps = (orientation?: 'horizontal' | 'vertical') => (
  <Stepper aria-label="Application status" orientation={orientation}>
    <Stepper.Step state="done" meta="Nov 3">
      Applied
    </Stepper.Step>
    <Stepper.Step state="current" meta={<button type="button">Nov 9</button>}>
      Screen
    </Stepper.Step>
    <Stepper.Step state="upcoming" meta="proposed · Nov 14, 2pm" proposed>
      Interview
    </Stepper.Step>
    <Stepper.Step state="upcoming">Offer</Stepper.Step>
  </Stepper>
);

describe('Stepper', () => {
  it('is a named ordered list, horizontal by default, with the current step marked', async () => {
    const { container } = render(steps());
    const list = screen.getByRole('list', { name: 'Application status' });
    expect(list.tagName).toBe('OL');
    expect(list).toHaveAttribute('data-orientation', 'horizontal');
    const items = within(list).getAllByRole('listitem');
    expect(items.map((i) => i.getAttribute('data-state'))).toEqual([
      'done',
      'current',
      'upcoming',
      'upcoming',
    ]);
    expect(items.filter((i) => i.getAttribute('aria-current') === 'step')).toEqual([items[1]]);
    await expectNoA11yViolations(container);
  });

  it('marks a done step with a check and says so in words; the markers are decorative', () => {
    const { container } = render(steps('vertical'));
    const [done, current, upcoming] = screen.getAllByRole('listitem');
    expect(done!.querySelector('.sc-stepper__marker svg')).not.toBeNull();
    expect(current!.querySelector('.sc-stepper__marker svg')).toBeNull();
    expect(done).toHaveTextContent('Applied, done');
    expect(upcoming).not.toHaveTextContent('done');
    for (const m of container.querySelectorAll('.sc-stepper__marker'))
      expect(m).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('list')).toHaveAttribute('data-orientation', 'vertical');
  });

  it('holds a control in meta and draws a proposed meta in the accent', async () => {
    const { container } = render(steps());
    expect(screen.getByRole('button', { name: 'Nov 9' })).toBeInTheDocument();
    expect(screen.getByText('proposed · Nov 14, 2pm')).toHaveAttribute('data-proposed', 'true');
    expect(screen.getByText('Nov 3')).not.toHaveAttribute('data-proposed');
    await expectNoA11yViolations(container);
  });
});

const FULL = 'Nov 14, 2026, 2:00 PM ET';
const dated = (orientation: 'horizontal' | 'vertical', editor?: boolean) => (
  <Stepper aria-label="Application status" orientation={orientation}>
    <Stepper.Step state="current" meta="Nov 9">
      Screen
    </Stepper.Step>
    <Stepper.Step
      state="upcoming"
      proposed
      meta={
        <Stepper.Date label={FULL} short="Nov 14, 2pm">
          {editor ? (
            <label>
              When <input type="datetime-local" />
            </label>
          ) : null}
        </Stepper.Date>
      }
    >
      Interview
    </Stepper.Step>
  </Stepper>
);

describe('Stepper.Date', () => {
  it('horizontal: the word, then a calendar button named with the full date that opens it on tap', async () => {
    const { container } = render(dated('horizontal'));
    const step = screen.getAllByRole('listitem')[1]!;
    expect(step.querySelector('.sc-stepper__meta')).toHaveTextContent('proposed');
    expect(step).not.toHaveTextContent('Nov 14, 2pm');
    const button = within(step).getByRole('button', { name: `proposed: ${FULL}` });
    await expectNoA11yViolations(container);
    await userEvent.click(button);
    expect(await screen.findByText(`proposed · ${FULL}`, { selector: 'p' })).toBeInTheDocument();
  });

  it('vertical: the short date inline and no button when there is nothing to edit', async () => {
    const { container } = render(dated('vertical'));
    const step = screen.getAllByRole('listitem')[1]!;
    expect(step).toHaveTextContent('proposed · Nov 14, 2pm');
    expect(within(step).queryByRole('button')).toBeNull();
    await expectNoA11yViolations(container);
  });

  it.each(['horizontal', 'vertical'] as const)(
    '%s: with an editor, the button says it changes the date and opens the editor',
    async (orientation) => {
      render(dated(orientation, true));
      const button = screen.getByRole('button', { name: `Change date, proposed: ${FULL}` });
      await userEvent.click(button);
      expect(await screen.findByLabelText('When')).toBeInTheDocument();
    },
  );
});
