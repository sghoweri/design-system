import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';
import { FullScreenFlow, type FlowChapter, type FlowDirection } from './FullScreenFlow';
import { Button } from '../Button/Button';
import { Chip } from '../Chip/Chip';
import { Dialog } from '../Dialog/Dialog';
import { Input } from '../Input/Input';
import { Kbd } from '../Kbd/Kbd';
import { Select } from '../Select/Select';
import { Stack } from '../Stack/Stack';
import { Inline } from '../Inline/Inline';
import { Text } from '../Text/Text';
import { Textarea } from '../Textarea/Textarea';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, StarIcon } from '../../icons/icons.gen';

const meta = {
  title: 'Components/FullScreenFlow',
  component: FullScreenFlow.Root,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof FullScreenFlow.Root>;
export default meta;
type Story = StoryObj<typeof meta>;

/* Fictional content: a made-up job search for a made-up person. */
const CHAPTERS: FlowChapter[] = [
  { label: 'You', steps: 2 },
  { label: 'Your search', steps: 3 },
  { label: 'Start', steps: 1 },
];
interface DemoStep {
  id: string;
  label: string;
  chapter?: number;
  drafted?: boolean;
}
const STEPS: DemoStep[] = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'about', label: 'About you', chapter: 0, drafted: true },
  { id: 'experience', label: 'Your experience', chapter: 0, drafted: true },
  { id: 'roles', label: 'Roles', chapter: 1, drafted: true },
  { id: 'where', label: 'Where and when', chapter: 1 },
  { id: 'pay', label: 'Pay', chapter: 1 },
  { id: 'review', label: 'Review', chapter: 2 },
];
const NUMBERED = STEPS.filter((s) => s.chapter !== undefined).length;
const numberOf = (i: number) => (i === 0 ? 0 : i);

function Radar() {
  return (
    <svg
      viewBox="0 0 980 980"
      style={{
        position: 'absolute',
        inlineSize: 980,
        blockSize: 980,
        insetInlineEnd: -360,
        insetBlockStart: -180,
      }}
    >
      {[120, 220, 320, 420].map((r) => (
        <circle
          key={r}
          cx="490"
          cy="490"
          r={r}
          fill="none"
          stroke="color-mix(in oklab, var(--sc-color-accent-default) 18%, transparent)"
        />
      ))}
    </svg>
  );
}

function RoleChips() {
  const [picked, setPicked] = useState(['Program manager', 'Operations lead']);
  const all = ['Program manager', 'Operations lead', 'Project manager', 'Implementation manager'];
  const toggle = (r: string) => setPicked((p) => (p.includes(r) ? p.filter((x) => x !== r) : [...p, r]));
  return (
    <Inline gap="xs">
      {all.map((r) => (
        <Chip key={r} selected={picked.includes(r)} onClick={() => toggle(r)}>
          {r}
        </Chip>
      ))}
    </Inline>
  );
}

function StepBody({ id }: { id: string }): ReactNode {
  switch (id) {
    case 'welcome':
      return (
        <Text tone="muted" size="lg">
          A few questions, about eight minutes. We save as you go, so you can leave and pick up where you left
          off.
        </Text>
      );
    case 'about':
      return (
        <Stack gap="md">
          <Input label="Name" defaultValue="Robin Vale" />
          <Textarea
            label="In a sentence"
            defaultValue="Program manager who turns messy rollouts into calm, predictable launches."
          />
        </Stack>
      );
    case 'experience':
      return (
        <Stack gap="sm">
          <Text weight="semibold">Operations lead, Harbor Clinics · 2021 to now</Text>
          <Text tone="muted">Ran the move to a shared scheduling system across nine sites.</Text>
          <Text weight="semibold">Project coordinator, Lumen Health · 2017 to 2021</Text>
        </Stack>
      );
    case 'roles':
      return <RoleChips />;
    case 'where':
      return (
        <Select
          label="Where you work"
          defaultValue="remote"
          options={[
            { value: 'remote', label: 'Remote' },
            { value: 'hybrid', label: 'Hybrid' },
            { value: 'office', label: 'In an office' },
          ]}
        />
      );
    case 'pay':
      return <Input label="Lowest base salary you'd take" inputMode="numeric" placeholder="95,000" />;
    default:
      return (
        <Text tone="muted">
          That's everything. Start your first sweep and the first matches arrive in a few minutes.
        </Text>
      );
  }
}

function SetupFlow({ startAt = 0 }: { startAt?: number }) {
  const [open, setOpen] = useState(true);
  const [i, setI] = useState(startAt);
  const [furthest, setFurthest] = useState(startAt);
  const [direction, setDirection] = useState<FlowDirection>('forward');
  const [confirming, setConfirming] = useState(false);
  const step = STEPS[i]!;
  const n = numberOf(i);
  const last = i === STEPS.length - 1;

  const go = (to: number) => {
    if (to < 0 || to >= STEPS.length || to === i) return;
    setDirection(to > i ? 'forward' : 'back');
    setI(to);
    setFurthest((f) => Math.max(f, to));
  };
  const next = () => (last ? setOpen(false) : go(i + 1));

  if (!open) {
    return (
      <div style={{ padding: 'var(--sc-spacing-lg)' }}>
        <Button onClick={() => setOpen(true)}>Open setup</Button>
      </div>
    );
  }

  return (
    <FullScreenFlow.Root
      onRequestClose={() => setConfirming(true)}
      onNext={next}
      onBack={() => go(i - 1)}
      decoration={<Radar />}
    >
      <FullScreenFlow.Header
        title="Set up your search"
        logo={<StarIcon size="lg" />}
        compactTitle={n ? `${n} of ${NUMBERED} · ${step.label}` : step.label}
        status={
          n ? (
            <>
              <CheckIcon size="sm" /> Saved
            </>
          ) : undefined
        }
        closeLabel="Save and exit setup"
      >
        <FullScreenFlow.Progress
          chapters={CHAPTERS}
          step={n}
          label={
            n ? (
              <>
                <b>
                  Step {n} of {NUMBERED}
                </b>{' '}
                · {step.label}
              </>
            ) : (
              <>
                <b>About 8 minutes</b> · saved as you go
              </>
            )
          }
        />
      </FullScreenFlow.Header>
      <FullScreenFlow.Body>
        <FullScreenFlow.Rail
          aria-label="Setup steps"
          footer="Everything here can be changed later in Settings."
        >
          {CHAPTERS.map((chapter, ci) => (
            <FullScreenFlow.RailGroup key={chapter.label} label={chapter.label}>
              {STEPS.map((s, si) =>
                s.chapter === ci ? (
                  <FullScreenFlow.RailItem
                    key={s.id}
                    current={si === i}
                    done={si < furthest && si !== i}
                    disabled={si > furthest}
                    onClick={() => go(si)}
                    adornment={s.drafted ? <StarIcon size="sm" title="Drafted for you" /> : undefined}
                  >
                    {s.label}
                  </FullScreenFlow.RailItem>
                ) : null,
              )}
            </FullScreenFlow.RailGroup>
          ))}
        </FullScreenFlow.Rail>
        <FullScreenFlow.Viewport direction={direction}>
          <FullScreenFlow.Step
            key={step.id}
            eyebrow={
              step.chapter === undefined
                ? 'Welcome'
                : `${CHAPTERS[step.chapter]!.label} · Step ${n} of ${NUMBERED}`
            }
            title={step.id === 'welcome' ? "Let's get your first matches." : step.label}
            description={
              step.id === 'welcome' ? undefined : 'We drafted this from your resume. Change anything.'
            }
            announcement={n ? `Step ${n} of ${NUMBERED}, ${step.label}` : 'Welcome'}
          >
            <StepBody id={step.id} />
          </FullScreenFlow.Step>
        </FullScreenFlow.Viewport>
      </FullScreenFlow.Body>
      <FullScreenFlow.Footer
        back={
          i > 0 ? (
            <Button variant="ghost" size="lg" iconStart={<ArrowLeftIcon />} onClick={() => go(i - 1)}>
              Back
            </Button>
          ) : undefined
        }
        hint={
          <>
            Press <Kbd>Enter</Kbd> to continue
          </>
        }
      >
        <Button size="lg" iconEnd={<ArrowRightIcon />} onClick={next}>
          {i === 0 ? "Let's start" : last ? 'Start my first sweep' : 'Continue'}
        </Button>
      </FullScreenFlow.Footer>

      <Dialog.Root open={confirming} onOpenChange={setConfirming}>
        <Dialog.Content size="sm">
          <Dialog.Title>Leave setup for now?</Dialog.Title>
          <Dialog.Description>
            Everything you've confirmed is saved. Next time you'll pick up at {step.label}.
          </Dialog.Description>
          <Dialog.Actions>
            <Button
              variant="ghost"
              onClick={() => {
                setConfirming(false);
                setOpen(false);
              }}
            >
              Leave for now
            </Button>
            <Dialog.Close render={<Button />}>Keep going</Dialog.Close>
          </Dialog.Actions>
        </Dialog.Content>
      </Dialog.Root>
    </FullScreenFlow.Root>
  );
}

/**
 * Seven screens in three chapters. Continue, Back, the rail, Enter and the arrow keys move between steps;
 * each change slides by direction (a crossfade under reduced motion), focuses the new title and announces
 * "Step 3 of 6, Roles". Esc or the × asks before leaving, in a nested Dialog. The rail shows from 1000px.
 */
export const MultiStep: Story = {
  name: 'Multi-step demo',
  args: { onRequestClose: () => {} },
  render: () => <SetupFlow />,
};

/** Mid-way, on a wide screen: the rail marks done, current and not-yet-reached steps. */
export const MidFlow: Story = {
  name: 'Mid-flow',
  args: { onRequestClose: () => {} },
  render: () => <SetupFlow startAt={3} />,
};

/** At 390px the progress drops to its own row, the header shows "3 of 6 · Roles", the primary action stretches. */
export const Phone: Story = {
  name: 'Phone 390',
  args: { onRequestClose: () => {} },
  globals: { viewport: { value: 'phone390', isRotated: false } },
  render: () => <SetupFlow startAt={3} />,
};

export const Dark: Story = {
  name: 'Dark theme',
  args: { onRequestClose: () => {} },
  globals: { theme: 'dark' },
  render: () => <SetupFlow startAt={3} />,
};
