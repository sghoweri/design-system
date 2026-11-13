import { createContext, useContext, type ComponentPropsWithRef, type ReactNode } from 'react';
import { CalendarIcon, CheckIcon } from '../../icons/icons.gen';
import { cx } from '../../utils/cx';
import { IconButton } from '../IconButton/IconButton';
import { Popover } from '../Popover/Popover';

export type StepperOrientation = 'horizontal' | 'vertical';
export type StepState = 'done' | 'current' | 'upcoming';

export interface StepperProps extends ComponentPropsWithRef<'ol'> {
  /**
   * `horizontal` (default): steps side by side, the meta under each label. `vertical`: a column, the meta at the end
   * of each row; use it below the width where the labels fit side by side.
   */
  orientation?: StepperOrientation | undefined;
  /** Names the list: "Application status". Required: a list of steps needs a name. */
  'aria-label': string;
}

/**
 * Steps in order, each done, current or upcoming: an application's pipeline, a setup's chapters. Display only; a step
 * can hold its own control in `meta` (a date button). The markers differ by shape as well as colour: a check, a
 * haloed ring, a hollow ring. The current step is `aria-current="step"` and pulses unless motion is reduced.
 */
const OrientationContext = createContext<StepperOrientation>('horizontal');
const ProposedContext = createContext(false);

function Root({ orientation = 'horizontal', className, children, ...rest }: StepperProps) {
  return (
    <OrientationContext.Provider value={orientation}>
      <ol className={cx('sc-stepper', className)} data-orientation={orientation} {...rest}>
        {children}
      </ol>
    </OrientationContext.Provider>
  );
}

export interface StepperStepProps extends Omit<ComponentPropsWithRef<'li'>, 'children'> {
  state: StepState;
  /** The step's name: "Applied". */
  children: ReactNode;
  /** A date, or a control that sets one. Mono xs, muted. */
  meta?: ReactNode | undefined;
  /** The meta is a proposal, not a fact ("proposed · Nov 14, 2pm"): drawn in the accent text colour. */
  proposed?: boolean | undefined;
  /** Read after a done step's name, since the check alone is visual. Default "done". */
  doneLabel?: string | undefined;
}

function Step({
  state,
  children,
  meta,
  proposed = false,
  doneLabel = 'done',
  className,
  ...rest
}: StepperStepProps) {
  return (
    <li
      className={cx('sc-stepper__step', className)}
      data-state={state}
      aria-current={state === 'current' ? 'step' : undefined}
      {...rest}
    >
      <span className="sc-stepper__marker" aria-hidden="true">
        {state === 'done' ? <CheckIcon size="xs" /> : null}
      </span>
      <span className="sc-stepper__label">
        {children}
        {state === 'done' ? <span className="sc-visually-hidden">, {doneLabel}</span> : null}
      </span>
      {meta != null ? (
        <span className="sc-stepper__meta" data-proposed={proposed || undefined}>
          <ProposedContext.Provider value={proposed}>{meta}</ProposedContext.Provider>
        </span>
      ) : null}
    </li>
  );
}

export interface StepperDateProps {
  /** The full date, as a person would say it: "Nov 14, 2026, 2:00 PM ET". The tooltip, the button's name, the popover. */
  label: string;
  /** The short form shown inline in a vertical Stepper: "Nov 14, 2pm". Default `label`. */
  short?: string | undefined;
  /**
   * An editor for the date (the app's re-date form). With it, the calendar button opens it in a Popover in both
   * orientations; without it, the button only shows the date (in a Popover on tap, since touch has no tooltip).
   */
  children?: ReactNode | undefined;
  /** The word before a proposed date. Default "proposed". */
  proposedLabel?: string | undefined;
  /** Names the button when it opens an editor: "Change date, Nov 14, …". Default "Change date". */
  editLabel?: string | undefined;
}

/**
 * A step's date, for `Stepper.Step meta`, sized to the room there is. Horizontal (narrow columns): the word
 * "proposed" (on a `proposed` step) and a calendar icon button whose tooltip and name carry the full date. Vertical:
 * the short date inline, plus the button only when there is an editor. A plain short date ("Oct 28") needs none of
 * this; pass it as text.
 */
function DateMeta({
  label,
  short,
  children,
  proposedLabel = 'proposed',
  editLabel = 'Change date',
}: StepperDateProps) {
  const orientation = useContext(OrientationContext);
  const proposed = useContext(ProposedContext);
  const editable = children != null;
  const spoken = proposed ? `${proposedLabel}: ${label}` : label;
  const name = editable ? `${editLabel}, ${spoken}` : spoken;
  const button = (
    <Popover.Root>
      <Popover.Trigger
        render={
          <IconButton label={name} tooltip={label} size="sm" className="sc-stepper__date-button">
            <CalendarIcon />
          </IconButton>
        }
      />
      <Popover.Content side="bottom" align="start" arrow className="sc-stepper__date-popover">
        {editable ? (
          children
        ) : (
          <p className="sc-stepper__date-full">{proposed ? `${proposedLabel} · ${label}` : label}</p>
        )}
      </Popover.Content>
    </Popover.Root>
  );
  if (orientation === 'vertical') {
    return (
      <span className="sc-stepper__date">
        <span>
          {proposed ? `${proposedLabel} · ` : null}
          {short ?? label}
        </span>
        {editable ? button : null}
      </span>
    );
  }
  return (
    <span className="sc-stepper__date">
      {proposed ? <span aria-hidden="true">{proposedLabel}</span> : null}
      {button}
    </span>
  );
}

/** `Stepper` › `Stepper.Step`, with `Stepper.Date` for a date that needs more room than a column has. */
export const Stepper = Object.assign(Root, { Step, Date: DateMeta });
