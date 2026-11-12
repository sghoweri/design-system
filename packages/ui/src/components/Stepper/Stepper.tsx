import type { ComponentPropsWithRef, ReactNode } from 'react';
import { CheckIcon } from '../../icons/icons.gen';
import { cx } from '../../utils/cx';

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
function Root({ orientation = 'horizontal', className, children, ...rest }: StepperProps) {
  return (
    <ol className={cx('sc-stepper', className)} data-orientation={orientation} {...rest}>
      {children}
    </ol>
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
          {meta}
        </span>
      ) : null}
    </li>
  );
}

/** `Stepper` › `Stepper.Step`. */
export const Stepper = Object.assign(Root, { Step });
