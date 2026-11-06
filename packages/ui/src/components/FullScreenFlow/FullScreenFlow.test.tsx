import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { FullScreenFlow, type FlowCloseRequestReason, type FlowDirection } from './FullScreenFlow';
import { Button } from '../Button/Button';
import { Dialog } from '../Dialog/Dialog';
import { expectNoA11yViolations } from '../../../test/axe';

const CHAPTERS = [
  { label: 'You', steps: 2 },
  { label: 'Your search', steps: 2 },
];
const STEPS = [
  { id: 'about', label: 'About you', chapter: 0 },
  { id: 'experience', label: 'Experience', chapter: 0 },
  { id: 'roles', label: 'Roles', chapter: 1 },
  { id: 'pay', label: 'Pay', chapter: 1 },
];

function Demo({
  start = 0,
  onRequestClose = () => {},
}: {
  start?: number;
  onRequestClose?: (reason: FlowCloseRequestReason) => void;
}) {
  const [i, setI] = useState(start);
  const [direction, setDirection] = useState<FlowDirection>('forward');
  const go = (n: number) => {
    if (n < 0 || n >= STEPS.length) return;
    setDirection(n > i ? 'forward' : 'back');
    setI(n);
  };
  const step = STEPS[i]!;
  return (
    <FullScreenFlow.Root onRequestClose={onRequestClose} onNext={() => go(i + 1)} onBack={() => go(i - 1)}>
      <FullScreenFlow.Header
        title="Set up your search"
        compactTitle={`${i + 1} of 4 · ${step.label}`}
        status="Saved"
        closeLabel="Save and exit setup"
      >
        <FullScreenFlow.Progress
          chapters={CHAPTERS}
          step={i + 1}
          label={`Step ${i + 1} of 4 · ${step.label}`}
        />
      </FullScreenFlow.Header>
      <FullScreenFlow.Body>
        <FullScreenFlow.Rail aria-label="Setup steps" footer="Everything here can be changed later.">
          {CHAPTERS.map((chapter, ci) => (
            <FullScreenFlow.RailGroup key={chapter.label} label={chapter.label}>
              {STEPS.filter((s) => s.chapter === ci).map((s) => {
                const si = STEPS.indexOf(s);
                return (
                  <FullScreenFlow.RailItem
                    key={s.id}
                    current={si === i}
                    done={si < i}
                    disabled={si > i}
                    onClick={() => go(si)}
                  >
                    {s.label}
                  </FullScreenFlow.RailItem>
                );
              })}
            </FullScreenFlow.RailGroup>
          ))}
        </FullScreenFlow.Rail>
        <FullScreenFlow.Viewport direction={direction}>
          <FullScreenFlow.Step
            key={step.id}
            title={step.label}
            eyebrow={`${CHAPTERS[step.chapter]!.label} · Step ${i + 1} of 4`}
            description="Why we ask."
            announcement={`Step ${i + 1} of 4, ${step.label}`}
          >
            <label>
              Note
              <input />
            </label>
          </FullScreenFlow.Step>
        </FullScreenFlow.Viewport>
      </FullScreenFlow.Body>
      <FullScreenFlow.Footer
        back={
          <Button variant="ghost" onClick={() => go(i - 1)}>
            Back
          </Button>
        }
        hint="Press Enter to continue"
      >
        <Button size="lg" onClick={() => go(i + 1)}>
          Continue
        </Button>
      </FullScreenFlow.Footer>
    </FullScreenFlow.Root>
  );
}

const liveRegion = (dialog: HTMLElement) =>
  dialog.querySelector<HTMLElement>('[aria-live="polite"][aria-atomic="true"]')!;

describe('FullScreenFlow', () => {
  it('is a full-screen modal dialog named by the header title, with focus on the step title', async () => {
    render(<Demo />);
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('data-variant', 'fullscreen');
    expect(dialog).toHaveAccessibleName('Set up your search');
    const title = screen.getByRole('heading', { level: 2, name: 'About you' });
    expect(title).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('region', { name: 'About you' })).toBeInTheDocument();
    await waitFor(() => expect(title).toHaveFocus());
  });

  it('sends Esc and the × to onRequestClose and stays open', async () => {
    const user = userEvent.setup();
    const onRequestClose = vi.fn();
    render(<Demo onRequestClose={onRequestClose} />);
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    expect(onRequestClose).toHaveBeenLastCalledWith('escape-key');
    const close = screen.getByRole('button', { name: 'Save and exit setup' });
    expect(close).toHaveAttribute('aria-keyshortcuts', 'Escape');
    await user.click(close);
    expect(onRequestClose).toHaveBeenLastCalledWith('close-press');
    expect(onRequestClose).toHaveBeenCalledTimes(2);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('moves focus to the new step title, announces it and drops the old step', async () => {
    const user = userEvent.setup();
    render(<Demo />);
    const dialog = await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    const title = screen.getByRole('heading', { level: 2, name: 'Experience' });
    await waitFor(() => expect(title).toHaveFocus());
    await waitFor(() => expect(liveRegion(dialog)).toHaveTextContent('Step 2 of 4, Experience'));
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'About you' })).toBeNull());
    const frame = title.closest('.sc-flow__frame')!;
    expect(frame).toHaveAttribute('data-phase', 'enter');
    expect(frame).toHaveAttribute('data-direction', 'forward');

    await user.click(screen.getByRole('button', { name: 'Back' }));
    const back = screen.getByRole('heading', { level: 2, name: 'About you' });
    await waitFor(() => expect(back).toHaveFocus());
    expect(back.closest('.sc-flow__frame')).toHaveAttribute('data-direction', 'back');
    await waitFor(() => expect(liveRegion(dialog)).toHaveTextContent('Step 1 of 4, About you'));
  });

  it('keeps the leaving step mounted and inert until its exit animation ends', async () => {
    const user = userEvent.setup();
    let finish!: () => void;
    const finished = new Promise<void>((resolve) => (finish = resolve));
    const original = HTMLElement.prototype.getAnimations;
    HTMLElement.prototype.getAnimations = function (this: HTMLElement) {
      return this.dataset['phase'] === 'exit' ? ([{ finished }] as unknown as Animation[]) : [];
    };
    try {
      render(<Demo />);
      await screen.findByRole('dialog');
      await user.click(screen.getByRole('button', { name: 'Continue' }));
      const leaving = document.querySelector('.sc-flow__frame[data-phase="exit"]')!;
      expect(leaving).toHaveAttribute('inert');
      expect(within(leaving as HTMLElement).getByText('About you')).toBeInTheDocument();
      await act(async () => {
        finish();
        await finished;
      });
      await waitFor(() => expect(document.querySelector('.sc-flow__frame[data-phase="exit"]')).toBeNull());
    } finally {
      HTMLElement.prototype.getAnimations = original;
    }
  });

  it('marks the current chapter and fills segments by steps done, the current step counting half', async () => {
    render(<Demo start={2} />);
    const list = await screen.findByRole('list', { name: 'Progress' });
    const [you, search] = within(list).getAllByRole('listitem');
    expect(you).not.toHaveAttribute('aria-current');
    expect(search).toHaveAttribute('aria-current', 'step');
    expect(you!.querySelector('.sc-flow__segment-fill')).toHaveStyle({ inlineSize: '100%' });
    expect(search!.querySelector('.sc-flow__segment-fill')).toHaveStyle({ inlineSize: '25%' });
    expect(search).toHaveStyle({ flexGrow: '2' });
  });

  it('marks the rail: current step, done steps, steps not reached disabled', async () => {
    render(<Demo start={1} />);
    const rail = await screen.findByRole('navigation', { name: 'Setup steps' });
    expect(within(rail).getByRole('list', { name: 'You' })).toBeInTheDocument();
    expect(within(rail).getByRole('button', { name: 'Experience' })).toHaveAttribute('aria-current', 'step');
    expect(within(rail).getByRole('button', { name: 'About you, done' })).not.toHaveAttribute('aria-current');
    expect(within(rail).getByRole('button', { name: 'Roles' })).toBeDisabled();
    expect(within(rail).getByText('Everything here can be changed later.')).toBeInTheDocument();
  });

  it('continues on Enter and moves with the arrow keys, but not from inside controls', async () => {
    const user = userEvent.setup();
    render(<Demo />);
    const first = await screen.findByRole('heading', { name: 'About you' });
    await waitFor(() => expect(first).toHaveFocus());
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Experience' })).toHaveFocus());
    await user.keyboard('{ArrowRight}');
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Roles' })).toHaveFocus());
    await user.keyboard('{ArrowLeft}');
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Experience' })).toHaveFocus());

    // The arrows edit text in a field.
    await user.click(screen.getByRole('textbox', { name: 'Note' }));
    await user.keyboard('{ArrowRight}{ArrowLeft}');
    expect(screen.getByRole('heading', { name: 'Experience' })).toBeInTheDocument();

    // Enter on a button activates that button only: one step, not two.
    screen.getByRole('button', { name: 'Continue' }).focus();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Roles' })).toBeInTheDocument());
    expect(screen.queryByRole('heading', { name: 'Pay' })).toBeNull();
  });

  it('lets a nested leave confirmation take Esc without asking the flow again', async () => {
    const user = userEvent.setup();
    function WithConfirm() {
      const [open, setOpen] = useState(true);
      const [confirming, setConfirming] = useState(false);
      const [requests, setRequests] = useState(0);
      if (!open) return <p>Left the flow</p>;
      return (
        <FullScreenFlow.Root
          onRequestClose={() => {
            setRequests((n) => n + 1);
            setConfirming(true);
          }}
        >
          <FullScreenFlow.Header title="Set up your search" />
          <FullScreenFlow.Body>
            <FullScreenFlow.Viewport>
              <FullScreenFlow.Step key="a" title="About you">
                <p data-testid="requests">{requests}</p>
              </FullScreenFlow.Step>
            </FullScreenFlow.Viewport>
          </FullScreenFlow.Body>
          <FullScreenFlow.Footer>
            <Button>Continue</Button>
          </FullScreenFlow.Footer>
          <Dialog.Root open={confirming} onOpenChange={setConfirming}>
            <Dialog.Content size="sm">
              <Dialog.Title>Leave setup for now?</Dialog.Title>
              <Dialog.Actions>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Leave for now
                </Button>
                <Dialog.Close render={<Button />}>Keep going</Dialog.Close>
              </Dialog.Actions>
            </Dialog.Content>
          </Dialog.Root>
        </FullScreenFlow.Root>
      );
    }
    render(<WithConfirm />);
    await screen.findByRole('dialog', { name: 'Set up your search' });
    await user.keyboard('{Escape}');
    await screen.findByRole('dialog', { name: 'Leave setup for now?' });
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Leave setup for now?' })).toBeNull());
    expect(screen.getByRole('dialog', { name: 'Set up your search' })).toBeInTheDocument();
    expect(screen.getByTestId('requests')).toHaveTextContent('1');

    await user.click(screen.getByRole('button', { name: 'Close' }));
    await screen.findByRole('dialog', { name: 'Leave setup for now?' });
    await user.click(screen.getByRole('button', { name: 'Leave for now' }));
    await screen.findByText('Left the flow');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('has no axe violations', async () => {
    const { baseElement } = render(<Demo start={1} />);
    await screen.findByRole('dialog');
    await expectNoA11yViolations(baseElement);
  });
});
